import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  PLATFORM_LABEL,
  Platform,
  EXPERIMENT_RESULTS,
  RESULT_LABEL,
  PLAYBOOK_CATEGORIES,
  PLAYBOOK_CATEGORY_LABEL,
} from "@/app/lib/types";
import { computeRatios, formatPercent } from "@/app/lib/calc";
import { Card, EmptyState, SectionHeader } from "@/app/components/ui/Card";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";
import {
  upsertReview,
  upsertPerformance,
  createPlaybookCandidateFromReview,
} from "@/app/review/actions";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: experimentId } = await params;
  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
    include: {
      idea: true,
      review: true,
      publishedContents: { include: { performance: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!experiment) notFound();

  if (experiment.publishedContents.length === 0) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          title="아직 게시된 콘텐츠가 없어요"
          description="Lab에서 게시 정보를 먼저 등록해주세요."
          action={
            <Link href={`/lab/${experiment.id}`} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
              Lab에서 게시 정보 등록
            </Link>
          }
        />
      </div>
    );
  }

  const boundUpsertReview = upsertReview.bind(null, experiment.id);
  const boundCreatePlaybook = createPlaybookCandidateFromReview.bind(null, experiment.id);
  const review = experiment.review;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">이번에 검증한 ONE THING</p>
        <h1 className="mt-1 text-lg font-bold">{experiment.oneThingToTest ?? "미정"}</h1>
        <Link href={`/lab/${experiment.id}`} className="mt-1 inline-block text-xs text-accent underline">
          {experiment.idea.title} · Lab에서 보기
        </Link>
      </div>

      <Card>
        <SectionHeader title="Objective Data" subtitle="플랫폼별로 저장할 수 있어요" />
        <div className="space-y-4">
          {experiment.publishedContents.map((p) => {
            const perf = p.performance;
            const ratios = computeRatios({
              views: perf?.views,
              reach: perf?.reach,
              avgWatchTime: perf?.avgWatchTime,
              retention3s: perf?.retention3s,
              completionRate: perf?.completionRate,
              likes: perf?.likes,
              comments: perf?.comments,
              saves: perf?.saves,
              shares: perf?.shares,
              profileVisits: perf?.profileVisits,
              followsGained: perf?.followsGained,
              videoLength: p.videoLength,
            });
            const boundUpsertPerf = upsertPerformance.bind(null, p.id, experiment.id);

            return (
              <details key={p.id} className="rounded-lg border border-border" open={experiment.publishedContents.length === 1}>
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold">
                  {PLATFORM_LABEL[p.platform as Platform]}
                  {p.videoLength != null && (
                    <span className="ml-2 text-xs font-normal text-muted">{p.videoLength}초</span>
                  )}
                </summary>
                <div className="space-y-3 border-t border-border p-3">
                  <form action={boundUpsertPerf} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      ["views", "조회수"],
                      ["reach", "Reach"],
                      ["avgWatchTime", "평균 시청 시간(초)"],
                      ["retention3s", "3초 유지율(%)"],
                      ["completionRate", "완주율(%)"],
                      ["likes", "좋아요"],
                      ["comments", "댓글"],
                      ["saves", "저장"],
                      ["shares", "공유"],
                      ["profileVisits", "프로필 방문"],
                      ["followsGained", "팔로우 증가"],
                    ].map(([key, label]) => (
                      <label key={key} className="text-xs">
                        <span className="mb-1 block text-muted">{label}</span>
                        <input
                          type="number"
                          step="any"
                          name={key}
                          defaultValue={perf?.[key as keyof typeof perf] as number | undefined ?? ""}
                          className={inputClass}
                        />
                      </label>
                    ))}
                    <div className="col-span-2 sm:col-span-3">
                      <SubmitButton className="w-full">저장</SubmitButton>
                    </div>
                  </form>

                  {perf && (
                    <dl className="grid grid-cols-2 gap-2 rounded-lg bg-accent-soft p-3 text-xs sm:grid-cols-3">
                      <div>
                        <dt className="text-muted">저장률</dt>
                        <dd className="font-semibold text-accent">{formatPercent(ratios.saveRate)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">공유율</dt>
                        <dd className="font-semibold text-accent">{formatPercent(ratios.shareRate)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">댓글률</dt>
                        <dd className="font-semibold text-accent">{formatPercent(ratios.commentRate)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">프로필 방문률</dt>
                        <dd className="font-semibold text-accent">{formatPercent(ratios.profileVisitRate)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">팔로우 전환율</dt>
                        <dd className="font-semibold text-accent">{formatPercent(ratios.followConversionRate)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">평균 시청률</dt>
                        <dd className="font-semibold text-accent">{formatPercent(ratios.avgWatchRate)}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHeader title="My Review" subtitle="주관적 복기" />
        <form action={boundUpsertReview} className="space-y-4">
          <Field label="내가 생각하는 잘된 점" htmlFor="whatWentWell">
            <textarea id="whatWentWell" name="whatWentWell" rows={2} defaultValue={review?.whatWentWell ?? ""} className={inputClass} />
          </Field>
          <Field label="내가 생각하는 부족했던 점" htmlFor="whatWasLacking">
            <textarea id="whatWasLacking" name="whatWasLacking" rows={2} defaultValue={review?.whatWasLacking ?? ""} className={inputClass} />
          </Field>
          <Field label="예상과 달랐던 점" htmlFor="unexpected">
            <textarea id="unexpected" name="unexpected" rows={2} defaultValue={review?.unexpected ?? ""} className={inputClass} />
          </Field>
          <Field label="만들면서 느낀 점" htmlFor="feelings">
            <textarea id="feelings" name="feelings" rows={2} defaultValue={review?.feelings ?? ""} className={inputClass} />
          </Field>
          <Field label="다시 만든다면 바꿀 것" htmlFor="whatToChange">
            <textarea id="whatToChange" name="whatToChange" rows={2} defaultValue={review?.whatToChange ?? ""} className={inputClass} />
          </Field>
          <Field label="이번 콘텐츠에서 배운 한 가지" htmlFor="oneLearning">
            <textarea id="oneLearning" name="oneLearning" rows={2} defaultValue={review?.oneLearning ?? ""} className={`${inputClass} font-medium`} />
          </Field>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold text-foreground">RESULT</p>
            <div className="flex flex-wrap gap-2">
              {EXPERIMENT_RESULTS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
                >
                  <input type="radio" name="result" value={r} defaultChecked={review?.result === r} className="h-3 w-3" />
                  {RESULT_LABEL[r]}
                </label>
              ))}
            </div>
          </div>

          <Field label="WHAT WE LEARNED" htmlFor="whatWeLearned">
            <textarea id="whatWeLearned" name="whatWeLearned" rows={2} defaultValue={review?.whatWeLearned ?? ""} className={inputClass} />
          </Field>
          <Field label="다음에 할 ONE THING" htmlFor="nextOneThing">
            <textarea id="nextOneThing" name="nextOneThing" rows={2} defaultValue={review?.nextOneThing ?? ""} className={inputClass} />
          </Field>
          <Field label="NEXT EXPERIMENT" htmlFor="nextExperimentNote">
            <textarea id="nextExperimentNote" name="nextExperimentNote" rows={2} defaultValue={review?.nextExperimentNote ?? ""} className={inputClass} />
          </Field>

          <SubmitButton>Review 저장</SubmitButton>
        </form>
      </Card>

      {review && (
        <Card>
          <SectionHeader title="Playbook 후보로 추가" subtitle="검증된 원칙이라면 Playbook에 남겨보세요" />
          <form action={boundCreatePlaybook} className="space-y-2">
            <input
              name="title"
              required
              defaultValue={review.oneLearning ?? review.nextOneThing ?? ""}
              placeholder="Rule 제목"
              className={inputClass}
            />
            <select name="category" defaultValue="OTHER" className={inputClass}>
              {PLAYBOOK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {PLAYBOOK_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
            <textarea
              name="description"
              rows={2}
              defaultValue={review.whatWeLearned ?? ""}
              placeholder="Rule 설명"
              className={inputClass}
            />
            <SubmitButton className="w-full">Playbook 후보로 추가</SubmitButton>
          </form>
        </Card>
      )}
    </div>
  );
}
