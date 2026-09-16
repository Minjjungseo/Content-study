// One-off data migration: Study/Idea/Experiment/PublishedContent/Performance/
// Review -> LearningRecord. Run once per environment (local, then Supabase).
//
// Safety:
// - Never writes to or drops the old tables — purely additive reads from
//   them and inserts into LearningRecord/RecordAttachment/RecordPlaybookLink.
// - Refuses to run if LearningRecord already has rows, unless MIGRATE_FORCE=1
//   (prevents accidental double-migration/duplicates on re-run).
//
// Mapping decisions (confirmed with the app owner before writing this):
// - One Idea with N Experiments -> N separate LearningRecords (SOURCE fields
//   duplicated across each — "several different attempts from the same
//   source" is treated as intentional, not redundant).
// - One Experiment published to multiple platforms -> the earliest-created
//   PublishedContent becomes the record's structured publishedUrl/performance
//   fields; any additional platforms are folded into sourceMemo as a labeled
//   migration note (a Record only supports one publish target).
// - Review.result -> decision: SUPPORTED->REPEAT, INCONCLUSIVE->MODIFY,
//   NOT_SUPPORTED->STOP.
// - Fields with no new equivalent (Performance.completionRate/likes/
//   profileVisits, Review.unexpected/feelings/whatToChange, extra linked
//   Studies) are preserved as labeled text inside sourceMemo/problem/learning/
//   nextThing rather than silently dropped.
//
// Run with: npx tsx scripts/migrate-to-learning-record.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TYPE_MAP: Record<string, string> = {
  LEARNED: "LECTURE",
  REFERENCE: "REFERENCE",
  INSIGHT: "SELF_STUDY",
};

const ACCOUNT_MAP: Record<string, string> = {
  HEYELIA: "HEYELIA",
  JAEJAE_MOMMY: "JAEJAE_MOMMY",
  MINJUNG_ALSO: "MINJUNG_DOING",
  COMMON: "COMMON",
};

const PRIORITY_MAP: Record<string, string> = {
  P1: "P1",
  P2: "P2",
  P3: "P3",
  SOMEDAY: "P3",
};

const DECISION_MAP: Record<string, string> = {
  SUPPORTED: "REPEAT",
  INCONCLUSIVE: "MODIFY",
  NOT_SUPPORTED: "STOP",
};

function mapAccount(v: string | null | undefined): string {
  if (!v) return "COMMON";
  return ACCOUNT_MAP[v] ?? v;
}

function join(...parts: (string | null | undefined)[]): string | null {
  const filtered = parts.map((p) => p?.trim()).filter((p): p is string => Boolean(p));
  return filtered.length ? filtered.join("\n") : null;
}

function labeled(label: string, value: string | null | undefined): string | null {
  return value?.trim() ? `${label}: ${value.trim()}` : null;
}

async function main() {
  const existing = await prisma.learningRecord.count();
  if (existing > 0 && process.env.MIGRATE_FORCE !== "1") {
    console.log(
      `LearningRecord already has ${existing} row(s) — skipping (set MIGRATE_FORCE=1 to re-run anyway).`
    );
    return;
  }

  const studies = await prisma.study.findMany({
    include: { attachments: true, studyIdeaLinks: { include: { idea: true } } },
  });
  const ideas = await prisma.idea.findMany({
    include: {
      sourceStudy: { include: { attachments: true } },
      studyLinks: { include: { study: { include: { attachments: true } } }, orderBy: { createdAt: "asc" } },
      experiments: {
        include: {
          publishedContents: { include: { performance: true }, orderBy: { createdAt: "asc" } },
          review: true,
          playbookEvidence: true,
        },
      },
    },
  });

  const processedStudyIds = new Set<string>();
  const experimentIdToRecordId = new Map<string, string>();
  let created = 0;

  for (const idea of ideas) {
    const repStudy = idea.sourceStudy ?? idea.studyLinks[0]?.study ?? null;
    const extraStudies = idea.studyLinks
      .map((l) => l.study)
      .filter((s) => s.id !== repStudy?.id);

    if (repStudy) processedStudyIds.add(repStudy.id);
    for (const s of idea.studyLinks) processedStudyIds.add(s.study.id);

    const sourceMemoBase = join(
      repStudy?.memo,
      labeled("핵심 내용", repStudy?.keyContent),
      labeled("적용 가능한 요소", repStudy?.applicableElements),
      labeled("카테고리", repStudy?.category),
      repStudy?.studyType === "REFERENCE"
        ? join(
            labeled("Hook", repStudy?.refHook),
            labeled("Promise", repStudy?.refPromise),
            labeled("Structure", repStudy?.refStructure),
            labeled("Emotion", repStudy?.refEmotion),
            labeled("Visual", repStudy?.refVisual),
            labeled("Payoff", repStudy?.refPayoff),
            labeled("Why it may work", repStudy?.refWhyItWorks)
          )
        : null,
      repStudy?.studyType === "LEARNED"
        ? join(
            labeled("무엇을 배웠는가", repStudy?.learnedWhat),
            labeled("왜 중요한가", repStudy?.learnedWhy),
            labeled("어디에 적용할 수 있는가", repStudy?.learnedWhere)
          )
        : null,
      extraStudies.length
        ? `[마이그레이션 메모] 함께 연결되어 있던 다른 자료: ${extraStudies.map((s) => s.title).join(", ")}`
        : null
    );

    const baseFields = {
      type: TYPE_MAP[repStudy?.studyType ?? ""] ?? "SELF_STUDY",
      account: mapAccount(idea.account),
      title: repStudy?.title ?? idea.title,
      sourceUrl: repStudy?.url ?? null,
      sourceMemo: sourceMemoBase,
      takeaway: idea.oneThing ?? repStudy?.oneThing ?? null,
      priority: PRIORITY_MAP[idea.myPriority] ?? "P2",
      tags: repStudy?.tags ?? null,
      applyTitle: idea.title,
      contentSeries: idea.contentIP,
    };

    const attachmentsToCopy = [
      ...(repStudy?.attachments ?? []).map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      ...(repStudy?.imageUrl
        ? [{ fileName: "cover-image", fileUrl: repStudy.imageUrl, fileType: "image", fileSize: null }]
        : []),
    ];

    if (idea.experiments.length === 0) {
      await prisma.learningRecord.create({
        data: {
          ...baseFields,
          applyPoint: idea.oneThing ?? null,
          ...(attachmentsToCopy.length ? { attachments: { create: attachmentsToCopy } } : {}),
        },
      });
      created++;
      continue;
    }

    for (const exp of idea.experiments) {
      const rep = exp.publishedContents[0] ?? null;
      const extraPublish = exp.publishedContents.slice(1);

      const migrationNote = join(
        extraPublish.length
          ? `[마이그레이션 메모] 추가 플랫폼 게시\n${extraPublish
              .map((p) => `- ${p.platform}: ${p.url ?? "(URL 없음)"}${p.publishedAt ? ` (${p.publishedAt.toISOString().slice(0, 10)})` : ""}`)
              .join("\n")}`
          : null,
        rep?.performance
          ? join(
              labeled("완주율", rep.performance.completionRate != null ? `${rep.performance.completionRate}%` : null),
              labeled("좋아요", rep.performance.likes?.toString()),
              labeled("프로필 방문", rep.performance.profileVisits?.toString())
            )
          : null
      );

      const review = exp.review;
      const learningParts = join(review?.oneLearning, review?.whatWeLearned !== review?.oneLearning ? review?.whatWeLearned : null, labeled("만들면서 느낀 점", review?.feelings));
      const problemParts = join(review?.whatWasLacking, labeled("예상과 달랐던 점", review?.unexpected));
      const nextThingParts = review?.nextOneThing ?? review?.nextExperimentNote ?? null;
      const nextThingExtra =
        review?.whatToChange && review.whatToChange !== nextThingParts
          ? labeled("다시 만든다면 바꿀 것", review.whatToChange)
          : null;

      const record = await prisma.learningRecord.create({
        data: {
          ...baseFields,
          sourceMemo: join(baseFields.sourceMemo, migrationNote),
          applyPoint: exp.oneThingToTest ?? idea.oneThing ?? null,
          hook: exp.hook,
          plan: exp.structureSteps,
          shootingMemo: join(
            labeled("필요한 촬영", exp.neededShooting),
            labeled("사용할 기존 촬영본", exp.existingFootage),
            labeled("CTA", exp.cta),
            labeled("썸네일 메모", exp.thumbnailNote),
            labeled("캡션 메모", exp.captionMemo)
          ),
          publishedUrl: rep?.url ?? null,
          publishedAt: rep?.publishedAt ?? null,
          views: rep?.performance?.views ?? null,
          reach: rep?.performance?.reach ?? null,
          avgWatchTime: rep?.performance?.avgWatchTime ?? null,
          retentionRate: rep?.performance?.retention3s ?? null,
          saves: rep?.performance?.saves ?? null,
          shares: rep?.performance?.shares ?? null,
          comments: rep?.performance?.comments ?? null,
          follows: rep?.performance?.followsGained ?? null,
          good: review?.whatWentWell ?? null,
          problem: problemParts,
          learning: learningParts,
          nextThing: join(nextThingParts, nextThingExtra),
          decision: review?.result ? DECISION_MAP[review.result] ?? null : null,
          playbookSaved: exp.playbookEvidence.length > 0,
          ...(attachmentsToCopy.length ? { attachments: { create: attachmentsToCopy } } : {}),
        },
      });
      experimentIdToRecordId.set(exp.id, record.id);
      created++;
    }
  }

  // Studies never linked to any Idea -> SOURCE-only records.
  for (const study of studies) {
    if (processedStudyIds.has(study.id)) continue;

    const sourceMemo = join(
      study.memo,
      labeled("핵심 내용", study.keyContent),
      labeled("적용 가능한 요소", study.applicableElements),
      labeled("카테고리", study.category),
      study.studyType === "REFERENCE"
        ? join(
            labeled("Hook", study.refHook),
            labeled("Promise", study.refPromise),
            labeled("Structure", study.refStructure),
            labeled("Emotion", study.refEmotion),
            labeled("Visual", study.refVisual),
            labeled("Payoff", study.refPayoff),
            labeled("Why it may work", study.refWhyItWorks)
          )
        : null,
      study.studyType === "LEARNED"
        ? join(
            labeled("무엇을 배웠는가", study.learnedWhat),
            labeled("왜 중요한가", study.learnedWhy),
            labeled("어디에 적용할 수 있는가", study.learnedWhere)
          )
        : null
    );

    const attachmentsToCopy = [
      ...study.attachments.map((a) => ({
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        fileSize: a.fileSize,
      })),
      ...(study.imageUrl
        ? [{ fileName: "cover-image", fileUrl: study.imageUrl, fileType: "image", fileSize: null }]
        : []),
    ];

    await prisma.learningRecord.create({
      data: {
        type: TYPE_MAP[study.studyType] ?? "SELF_STUDY",
        account: mapAccount(study.account),
        title: study.title,
        sourceUrl: study.url,
        sourceMemo,
        takeaway: study.oneThing,
        priority: "P2",
        tags: study.tags,
        ...(attachmentsToCopy.length ? { attachments: { create: attachmentsToCopy } } : {}),
      },
    });
    created++;
  }

  // PlaybookEvidence -> RecordPlaybookLink, via the experimentId -> new record id map.
  const evidence = await prisma.playbookEvidence.findMany();
  let linksCreated = 0;
  let linksSkipped = 0;
  for (const ev of evidence) {
    const recordId = experimentIdToRecordId.get(ev.experimentId);
    if (!recordId) {
      linksSkipped++;
      continue;
    }
    await prisma.recordPlaybookLink.upsert({
      where: { recordId_playbookRuleId: { recordId, playbookRuleId: ev.playbookRuleId } },
      create: { recordId, playbookRuleId: ev.playbookRuleId },
      update: {},
    });
    linksCreated++;
  }

  console.log(`Created ${created} LearningRecord row(s).`);
  console.log(`Created/confirmed ${linksCreated} RecordPlaybookLink row(s) (${linksSkipped} skipped — no matching experiment).`);
  console.log("Old tables (Study, Idea, Experiment, ...) were not modified.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
