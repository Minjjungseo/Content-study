"use client";

import { useState } from "react";
import type { Study } from "@prisma/client";
import {
  ACCOUNTS,
  ACCOUNT_LABEL,
  APPLICABLE_ELEMENTS,
  LEVELS,
  LEVEL_LABEL,
  STUDY_TYPES,
  STUDY_TYPE_LABEL,
  StudyType,
} from "@/app/lib/types";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";

export function StudyForm({
  study,
  action,
  submitLabel = "저장",
}: {
  study?: Study;
  action: (formData: FormData) => void;
  submitLabel?: string;
}) {
  const [studyType, setStudyType] = useState<StudyType>(
    (study?.studyType as StudyType) ?? "LEARNED"
  );
  const [showMore, setShowMore] = useState(Boolean(study));
  const selectedElements = new Set(
    (study?.applicableElements ?? "").split(",").filter(Boolean)
  );

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="제목 *" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              defaultValue={study?.title}
              className={inputClass}
              placeholder="무엇을 저장하나요?"
              autoFocus={!study}
            />
          </Field>
        </div>

        <Field label="Study Type *" htmlFor="studyType">
          <select
            id="studyType"
            name="studyType"
            required
            value={studyType}
            onChange={(e) => setStudyType(e.target.value as StudyType)}
            className={inputClass}
          >
            {STUDY_TYPES.map((t) => (
              <option key={t} value={t}>
                {STUDY_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="계정" htmlFor="account">
          <select
            id="account"
            name="account"
            defaultValue={study?.account ?? "COMMON"}
            className={inputClass}
          >
            {ACCOUNTS.map((a) => (
              <option key={a} value={a}>
                {ACCOUNT_LABEL[a]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="출처명" htmlFor="sourceName">
          <input
            id="sourceName"
            name="sourceName"
            defaultValue={study?.sourceName ?? ""}
            className={inputClass}
            placeholder="강의명 / 계정명 / 채널명"
          />
        </Field>

        <Field label="URL" htmlFor="url">
          <input
            id="url"
            name="url"
            type="url"
            defaultValue={study?.url ?? ""}
            className={inputClass}
            placeholder="https://"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="자유 메모" htmlFor="memo">
            <textarea
              id="memo"
              name="memo"
              rows={3}
              defaultValue={study?.memo ?? ""}
              className={inputClass}
              placeholder="무엇을 보고 배웠는지 편하게 적어두세요"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="이미지 / 스크린샷" htmlFor="imageFile">
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent`}
            />
            {study?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={study.imageUrl}
                alt=""
                className="mt-2 max-h-40 rounded-lg border border-border object-cover"
              />
            )}
          </Field>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="text-xs font-medium text-accent"
      >
        {showMore ? "상세 항목 접기 ▲" : "상세 항목 더 보기 ▼"}
      </button>

      {showMore && (
        <div className="space-y-5 rounded-xl border border-border bg-background/50 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="카테고리" htmlFor="category">
              <input
                id="category"
                name="category"
                defaultValue={study?.category ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="중요도" htmlFor="importance">
              <select
                id="importance"
                name="importance"
                defaultValue={study?.importance ?? "MEDIUM"}
                className={inputClass}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABEL[l]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="태그" htmlFor="tags" hint="쉼표로 구분">
              <input
                id="tags"
                name="tags"
                defaultValue={study?.tags ?? ""}
                className={inputClass}
                placeholder="hook, 릴스"
              />
            </Field>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold text-foreground">분석</p>
            <div className="space-y-4">
              <Field label="핵심 내용" htmlFor="keyContent">
                <textarea
                  id="keyContent"
                  name="keyContent"
                  rows={2}
                  defaultValue={study?.keyContent ?? ""}
                  className={inputClass}
                />
              </Field>

              <Field label="적용 가능한 요소">
                <div className="flex flex-wrap gap-2">
                  {APPLICABLE_ELEMENTS.map((el) => (
                    <label
                      key={el}
                      className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent"
                    >
                      <input
                        type="checkbox"
                        name="applicableElements"
                        value={el}
                        defaultChecked={selectedElements.has(el)}
                        className="h-3 w-3"
                      />
                      {el}
                    </label>
                  ))}
                </div>
              </Field>

              <Field
                label="ONE THING"
                htmlFor="oneThing"
                hint="이 자료에서 다음 콘텐츠에 딱 하나 적용한다면?"
              >
                <textarea
                  id="oneThing"
                  name="oneThing"
                  rows={2}
                  defaultValue={study?.oneThing ?? ""}
                  className={`${inputClass} font-medium`}
                  placeholder="예: 첫 장면에서 결론을 먼저 보여준다."
                />
              </Field>
            </div>
          </div>

          {studyType === "REFERENCE" && (
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-semibold text-foreground">
                Reference Breakdown
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hook" htmlFor="refHook">
                  <input id="refHook" name="refHook" defaultValue={study?.refHook ?? ""} className={inputClass} />
                </Field>
                <Field label="Promise" htmlFor="refPromise">
                  <input id="refPromise" name="refPromise" defaultValue={study?.refPromise ?? ""} className={inputClass} />
                </Field>
                <Field label="Structure" htmlFor="refStructure">
                  <input id="refStructure" name="refStructure" defaultValue={study?.refStructure ?? ""} className={inputClass} />
                </Field>
                <Field label="Emotion" htmlFor="refEmotion">
                  <input id="refEmotion" name="refEmotion" defaultValue={study?.refEmotion ?? ""} className={inputClass} />
                </Field>
                <Field label="Visual" htmlFor="refVisual">
                  <input id="refVisual" name="refVisual" defaultValue={study?.refVisual ?? ""} className={inputClass} />
                </Field>
                <Field label="Payoff" htmlFor="refPayoff">
                  <input id="refPayoff" name="refPayoff" defaultValue={study?.refPayoff ?? ""} className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Why it may work" htmlFor="refWhyItWorks">
                    <textarea id="refWhyItWorks" name="refWhyItWorks" rows={2} defaultValue={study?.refWhyItWorks ?? ""} className={inputClass} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {studyType === "LEARNED" && (
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-semibold text-foreground">
                LEARNED 상세
              </p>
              <div className="space-y-4">
                <Field label="무엇을 배웠는가" htmlFor="learnedWhat">
                  <textarea id="learnedWhat" name="learnedWhat" rows={2} defaultValue={study?.learnedWhat ?? ""} className={inputClass} />
                </Field>
                <Field label="왜 중요한가" htmlFor="learnedWhy">
                  <textarea id="learnedWhy" name="learnedWhy" rows={2} defaultValue={study?.learnedWhy ?? ""} className={inputClass} />
                </Field>
                <Field label="어디에 적용할 수 있는가" htmlFor="learnedWhere">
                  <textarea id="learnedWhere" name="learnedWhere" rows={2} defaultValue={study?.learnedWhere ?? ""} className={inputClass} />
                </Field>
              </div>
            </div>
          )}
        </div>
      )}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
