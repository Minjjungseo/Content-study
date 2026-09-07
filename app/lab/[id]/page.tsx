import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PLATFORMS, PLATFORM_LABEL, Platform } from "@/app/lib/types";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import { inputClass, SubmitButton } from "@/app/components/ui/Form";
import { StatusSelect } from "@/app/lab/[id]/StatusSelect";
import {
  setExperimentStatus,
  deleteExperiment,
  addPublishedContent,
  deletePublishedContent,
} from "@/app/lab/actions";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: {
      idea: { include: { sourceStudy: true } },
      publishedContents: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });
  if (!experiment) notFound();

  const boundStatus = setExperimentStatus.bind(null, experiment.id);
  const boundDelete = deleteExperiment.bind(null, experiment.id);
  const boundAddPublish = addPublishedContent.bind(null, experiment.id);

  const steps = (experiment.structureSteps ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Original Idea</p>
        <Link href={`/ideas/${experiment.idea.id}`} className="text-lg font-bold hover:text-accent">
          {experiment.idea.title}
        </Link>

        {experiment.idea.sourceStudy && (
          <p className="mt-1 text-xs text-muted">
            SOURCE:{" "}
            <Link href={`/study/${experiment.idea.sourceStudy.id}`} className="text-accent underline">
              {experiment.idea.sourceStudy.title}
            </Link>
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <StatusSelect action={boundStatus} currentStatus={experiment.status} />
          <Link href={`/lab/${experiment.id}/edit`} className="text-xs font-medium text-accent">
            기획 수정
          </Link>
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      <Card className="border-accent/30 bg-accent-soft">
        <SectionHeader title="ONE THING TO TEST" />
        <p className="text-sm font-semibold text-foreground">
          {experiment.oneThingToTest ?? "아직 정하지 않았어요"}
        </p>
      </Card>

      {experiment.hypothesis && (
        <Card>
          <SectionHeader title="실험 가설" />
          <p className="whitespace-pre-wrap text-sm text-foreground">{experiment.hypothesis}</p>
        </Card>
      )}

      <Card>
        <SectionHeader title="콘텐츠 기획" />
        <dl className="space-y-3 text-sm">
          {experiment.hook && (
            <div>
              <dt className="text-xs font-medium text-muted">Hook</dt>
              <dd className="text-foreground">{experiment.hook}</dd>
            </div>
          )}
          {experiment.coreMessage && (
            <div>
              <dt className="text-xs font-medium text-muted">핵심 메시지</dt>
              <dd className="text-foreground">{experiment.coreMessage}</dd>
            </div>
          )}
          {steps.length > 0 && (
            <div>
              <dt className="text-xs font-medium text-muted">콘텐츠 구조</dt>
              <dd>
                <ol className="ml-4 list-decimal space-y-0.5 text-foreground">
                  {steps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </dd>
            </div>
          )}
          {experiment.neededShooting && (
            <div>
              <dt className="text-xs font-medium text-muted">필요한 촬영</dt>
              <dd className="text-foreground">{experiment.neededShooting}</dd>
            </div>
          )}
          {experiment.existingFootage && (
            <div>
              <dt className="text-xs font-medium text-muted">사용할 기존 촬영본</dt>
              <dd className="text-foreground">{experiment.existingFootage}</dd>
            </div>
          )}
          {experiment.cta && (
            <div>
              <dt className="text-xs font-medium text-muted">CTA</dt>
              <dd className="text-foreground">{experiment.cta}</dd>
            </div>
          )}
          {experiment.thumbnailNote && (
            <div>
              <dt className="text-xs font-medium text-muted">Thumbnail</dt>
              <dd className="text-foreground">{experiment.thumbnailNote}</dd>
            </div>
          )}
          {experiment.captionMemo && (
            <div>
              <dt className="text-xs font-medium text-muted">Caption 메모</dt>
              <dd className="whitespace-pre-wrap text-foreground">{experiment.captionMemo}</dd>
            </div>
          )}
          {!experiment.hook &&
            !experiment.coreMessage &&
            steps.length === 0 &&
            !experiment.cta && (
              <p className="text-muted">아직 기획 내용이 없어요. &apos;기획 수정&apos;에서 채워보세요.</p>
            )}
        </dl>
      </Card>

      <Card>
        <SectionHeader title="게시 정보" subtitle="플랫폼별로 여러 개 등록할 수 있어요" />
        {experiment.publishedContents.length > 0 && (
          <ul className="mb-4 space-y-2">
            {experiment.publishedContents.map((p) => (
              <li key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{PLATFORM_LABEL[p.platform as Platform]}</span>
                  <form action={deletePublishedContent.bind(null, p.id, experiment.id)}>
                    <button className="text-xs text-muted hover:text-rose-600">삭제</button>
                  </form>
                </div>
                <dl className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted sm:grid-cols-3">
                  {p.publishedAt && <div>게시일: {new Date(p.publishedAt).toLocaleDateString("ko-KR")}</div>}
                  {p.videoLength != null && <div>길이: {p.videoLength}초</div>}
                  {p.url && (
                    <div className="col-span-2 sm:col-span-3">
                      <a href={p.url} target="_blank" className="text-accent underline">
                        게시물 보기
                      </a>
                    </div>
                  )}
                </dl>
                <Link
                  href={`/review/${experiment.id}`}
                  className="mt-2 inline-block text-xs font-medium text-accent"
                >
                  이 콘텐츠 복기하기 →
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form action={boundAddPublish} className="space-y-2 rounded-lg border border-border p-3">
          <p className="text-xs font-medium text-muted">게시 정보 추가</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <select name="platform" defaultValue="INSTAGRAM" className={inputClass}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
            <input type="date" name="publishedAt" className={inputClass} />
            <input name="actualHook" placeholder="실제 Hook" className={inputClass} />
            <input name="actualThumbnailUrl" placeholder="실제 Thumbnail URL" className={inputClass} />
            <input type="number" name="videoLength" placeholder="영상 길이(초)" className={inputClass} />
            <input name="url" placeholder="게시 URL" className={inputClass} />
          </div>
          <SubmitButton className="w-full">게시 정보 저장</SubmitButton>
        </form>
      </Card>

      {experiment.review && (
        <Link
          href={`/review/${experiment.id}`}
          className="block rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          복기 완료 — Review 보기 →
        </Link>
      )}
    </div>
  );
}
