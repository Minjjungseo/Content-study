import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  ACCOUNT_LABEL,
  Account,
  LEVEL_LABEL,
  Level,
  SHOOT_DIFFICULTY_LABEL,
  ShootDifficulty,
} from "@/app/lib/types";
import { PriorityBadge, StatusBadge } from "@/app/components/ui/Badge";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import { inputClass, SubmitButton } from "@/app/components/ui/Form";
import {
  deleteIdea,
  linkExistingStudy,
  setSourceStudy,
  createExperimentFromIdea,
} from "@/app/ideas/actions";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      sourceStudy: true,
      studyLinks: { include: { study: true } },
      experiments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!idea) notFound();

  const linkedStudyIds = new Set(idea.studyLinks.map((l) => l.studyId));
  const candidateStudies = await prisma.study.findMany({
    where: { id: { notIn: [...linkedStudyIds] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const boundDelete = deleteIdea.bind(null, idea.id);
  const boundLinkStudy = linkExistingStudy.bind(null, idea.id);
  const boundSetSource = setSourceStudy.bind(null, idea.id);
  const boundCreateExperiment = createExperimentFromIdea.bind(null, idea.id);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={idea.myPriority} />
          <StatusBadge status={idea.status} />
          {idea.contentIP && <span className="text-xs text-muted">{idea.contentIP}</span>}
        </div>
        <h1 className="mt-2 text-lg font-bold">{idea.title}</h1>
        <p className="mt-1 text-xs text-muted">{ACCOUNT_LABEL[idea.account as Account]}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href={`/ideas/${idea.id}/edit`} className="text-xs font-medium text-accent">
            수정
          </Link>
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      {idea.coreMessage && (
        <Card>
          <SectionHeader title="핵심 메시지" />
          <p className="whitespace-pre-wrap text-sm text-foreground">{idea.coreMessage}</p>
        </Card>
      )}

      {idea.memo && (
        <Card>
          <SectionHeader title="메모" />
          <p className="whitespace-pre-wrap text-sm text-foreground">{idea.memo}</p>
        </Card>
      )}

      <Card>
        <SectionHeader title="촬영 / 브랜드 정보" />
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">촬영 난이도</dt>
            <dd className="font-medium">{SHOOT_DIFFICULTY_LABEL[idea.shootDifficulty as ShootDifficulty]}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">브랜드 가치</dt>
            <dd className="font-medium">{LEVEL_LABEL[idea.brandValue as Level]}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">촬영 필요</dt>
            <dd className="font-medium">{idea.needsShoot ? "예" : "아니오"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">기존 촬영본</dt>
            <dd className="font-medium">{idea.hasExistingFootage ? "있음" : "없음"}</dd>
          </div>
        </dl>
      </Card>

      {idea.oneThing && (
        <Card className="border-accent/30 bg-accent-soft">
          <SectionHeader
            title="연결 ONE THING"
            subtitle={idea.sourceStudy ? `Source: ${idea.sourceStudy.title}` : undefined}
          />
          <p className="text-sm font-semibold text-foreground">{idea.oneThing}</p>
        </Card>
      )}

      <Card>
        <SectionHeader title="연결된 Study" />
        {idea.studyLinks.length === 0 ? (
          <p className="text-sm text-muted">아직 연결된 Study가 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {idea.studyLinks.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <Link href={`/study/${l.study.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
                  {l.study.title}
                </Link>
                {idea.sourceStudyId === l.study.id && (
                  <span className="text-[11px] font-semibold text-accent">SOURCE</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {candidateStudies.length > 0 && (
            <form action={boundLinkStudy} className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted">기존 Study 연결</p>
              <select name="studyId" required className={inputClass}>
                <option value="">Study 선택</option>
                {candidateStudies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <SubmitButton className="w-full">연결하기</SubmitButton>
            </form>
          )}

          {idea.studyLinks.length > 0 && (
            <form action={boundSetSource} className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted">
                테스트할 ONE THING 지정 (하나만 선택)
              </p>
              <select name="sourceStudyId" defaultValue={idea.sourceStudyId ?? ""} className={inputClass}>
                <option value="">선택 안 함</option>
                {idea.studyLinks.map((l) => (
                  <option key={l.study.id} value={l.study.id}>
                    {l.study.title}
                  </option>
                ))}
              </select>
              <textarea
                name="oneThing"
                rows={2}
                defaultValue={idea.oneThing ?? ""}
                placeholder="ONE THING"
                className={inputClass}
              />
              <SubmitButton className="w-full">ONE THING 설정</SubmitButton>
            </form>
          )}
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Experiment"
          action={
            <form action={boundCreateExperiment}>
              <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                + 실험 시작하기
              </button>
            </form>
          }
        />
        {idea.experiments.length === 0 ? (
          <p className="text-sm text-muted">아직 시작한 Experiment가 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {idea.experiments.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/lab/${e.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:border-accent/40"
                >
                  <span className="truncate text-sm font-medium">
                    {e.oneThingToTest ?? "ONE THING 미정"}
                  </span>
                  <StatusBadge status={e.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
