import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  ACCOUNT_LABEL,
  Account,
  IDEA_ACCOUNTS,
  ACCOUNT_LABEL as AL,
  STUDY_TYPE_LABEL,
  StudyType,
  LEVEL_LABEL,
  Level,
} from "@/app/lib/types";
import { Badge } from "@/app/components/ui/Badge";
import { Card, SectionHeader } from "@/app/components/ui/Card";
import { DeleteButton } from "@/app/components/ui/DeleteButton";
import { inputClass, SubmitButton } from "@/app/components/ui/Form";
import {
  deleteStudy,
  linkStudyToExistingIdea,
  createIdeaFromStudy,
  unlinkStudyFromIdea,
} from "@/app/study/actions";

export default async function StudyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const study = await prisma.study.findUnique({
    where: { id },
    include: {
      studyIdeaLinks: { include: { idea: true } },
    },
  });
  if (!study) notFound();

  const linkedIdeaIds = new Set(study.studyIdeaLinks.map((l) => l.ideaId));
  const candidateIdeas = await prisma.idea.findMany({
    where: { id: { notIn: [...linkedIdeaIds] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const boundDelete = deleteStudy.bind(null, study.id);
  const boundLink = linkStudyToExistingIdea.bind(null, study.id);
  const boundCreateIdea = createIdeaFromStudy.bind(null, study.id);

  const elements = (study.applicableElements ?? "").split(",").filter(Boolean);
  const tags = (study.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-accent-soft text-accent">
            {STUDY_TYPE_LABEL[study.studyType as StudyType] ?? study.studyType}
          </Badge>
          <Badge>{ACCOUNT_LABEL[study.account as Account] ?? study.account}</Badge>
          <Badge>{LEVEL_LABEL[study.importance as Level] ?? study.importance}</Badge>
        </div>
        <h1 className="mt-2 text-lg font-bold">{study.title}</h1>
        <p className="mt-1 text-xs text-muted">
          {study.sourceName ?? "출처 미입력"}
          {study.url && (
            <>
              {" · "}
              <a href={study.url} target="_blank" className="text-accent underline">
                원본 링크
              </a>
            </>
          )}
        </p>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </div>
        )}
        <div className="mt-3 flex gap-3">
          <Link href={`/study/${study.id}/edit`} className="text-xs font-medium text-accent">
            수정
          </Link>
          <DeleteButton action={boundDelete} />
        </div>
      </div>

      {study.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={study.imageUrl} alt="" className="max-h-72 rounded-xl border border-border object-cover" />
      )}

      {study.memo && (
        <Card>
          <SectionHeader title="원본 메모" />
          <p className="whitespace-pre-wrap text-sm text-foreground">{study.memo}</p>
        </Card>
      )}

      {(study.keyContent || elements.length > 0) && (
        <Card>
          <SectionHeader title="핵심 내용 / 적용 가능한 요소" />
          {study.keyContent && (
            <p className="whitespace-pre-wrap text-sm text-foreground">{study.keyContent}</p>
          )}
          {elements.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {elements.map((e) => (
                <Badge key={e} className="bg-accent-soft text-accent">
                  {e}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {study.studyType === "REFERENCE" &&
        (study.refHook || study.refPromise || study.refStructure || study.refEmotion || study.refVisual || study.refPayoff || study.refWhyItWorks) && (
          <Card>
            <SectionHeader title="Reference Breakdown" />
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {[
                ["Hook", study.refHook],
                ["Promise", study.refPromise],
                ["Structure", study.refStructure],
                ["Emotion", study.refEmotion],
                ["Visual", study.refVisual],
                ["Payoff", study.refPayoff],
              ].map(([label, value]) =>
                value ? (
                  <div key={label as string}>
                    <dt className="text-xs font-medium text-muted">{label}</dt>
                    <dd className="text-foreground">{value as string}</dd>
                  </div>
                ) : null
              )}
              {study.refWhyItWorks && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-muted">Why it may work</dt>
                  <dd className="text-foreground">{study.refWhyItWorks}</dd>
                </div>
              )}
            </dl>
          </Card>
        )}

      {study.studyType === "LEARNED" &&
        (study.learnedWhat || study.learnedWhy || study.learnedWhere) && (
          <Card>
            <SectionHeader title="LEARNED 상세" />
            <dl className="space-y-2 text-sm">
              {study.learnedWhat && (
                <div>
                  <dt className="text-xs font-medium text-muted">무엇을 배웠는가</dt>
                  <dd className="text-foreground">{study.learnedWhat}</dd>
                </div>
              )}
              {study.learnedWhy && (
                <div>
                  <dt className="text-xs font-medium text-muted">왜 중요한가</dt>
                  <dd className="text-foreground">{study.learnedWhy}</dd>
                </div>
              )}
              {study.learnedWhere && (
                <div>
                  <dt className="text-xs font-medium text-muted">어디에 적용할 수 있는가</dt>
                  <dd className="text-foreground">{study.learnedWhere}</dd>
                </div>
              )}
            </dl>
          </Card>
        )}

      {study.oneThing && (
        <Card className="border-accent/30 bg-accent-soft">
          <SectionHeader title="ONE THING" />
          <p className="text-sm font-semibold text-foreground">{study.oneThing}</p>
        </Card>
      )}

      <Card>
        <SectionHeader title="연결된 아이디어" />
        {study.studyIdeaLinks.length === 0 ? (
          <p className="text-sm text-muted">아직 연결된 아이디어가 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {study.studyIdeaLinks.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <Link href={`/ideas/${l.idea.id}`} className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-accent">
                  {l.idea.title}
                </Link>
                <form action={unlinkStudyFromIdea.bind(null, study.id, l.ideaId)}>
                  <button className="text-xs text-muted hover:text-rose-600">연결 해제</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <p className="text-xs font-semibold text-foreground">아이디어에 적용하기</p>

          {candidateIdeas.length > 0 && (
            <form action={boundLink} className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted">기존 아이디어에 연결</p>
              <select name="ideaId" required className={inputClass}>
                <option value="">아이디어 선택</option>
                {candidateIdeas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
              <input
                name="oneThing"
                defaultValue={study.oneThing ?? ""}
                placeholder="이번 Experiment에서 테스트할 ONE THING"
                className={inputClass}
              />
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" name="setAsSource" defaultChecked className="h-3 w-3" />
                이 Study를 Source Study / ONE THING으로 설정
              </label>
              <SubmitButton className="w-full">연결하기</SubmitButton>
            </form>
          )}

          <form action={boundCreateIdea} className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted">새 아이디어 만들기</p>
            <input name="title" required placeholder="콘텐츠 제목" className={inputClass} />
            <select name="account" defaultValue="HEYELIA" className={inputClass}>
              {IDEA_ACCOUNTS.map((a) => (
                <option key={a} value={a}>
                  {AL[a as Account]}
                </option>
              ))}
            </select>
            <input
              name="oneThing"
              defaultValue={study.oneThing ?? ""}
              placeholder="ONE THING"
              className={inputClass}
            />
            <SubmitButton className="w-full">새 아이디어로 만들기</SubmitButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
