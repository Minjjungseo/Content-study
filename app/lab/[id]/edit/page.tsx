import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { Field, inputClass, SubmitButton } from "@/app/components/ui/Form";
import { updateExperiment } from "@/app/lab/actions";

export default async function EditExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: { idea: true },
  });
  if (!experiment) notFound();

  const boundUpdate = updateExperiment.bind(null, experiment.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">콘텐츠 기획</h1>
      <p className="mt-1 text-sm text-muted">
        {experiment.idea.title} · ONE THING 외에는 원래 콘텐츠를 불필요하게 모두 바꾸지 않아요.
      </p>

      <form action={boundUpdate} className="mt-5 space-y-4">
        <Field
          label="ONE THING TO TEST"
          htmlFor="oneThingToTest"
          hint="이번 콘텐츠에서 딱 하나 적용할 것"
        >
          <textarea
            id="oneThingToTest"
            name="oneThingToTest"
            rows={2}
            defaultValue={experiment.oneThingToTest ?? ""}
            className={`${inputClass} font-medium`}
          />
        </Field>

        <Field label="실험 가설" htmlFor="hypothesis">
          <textarea
            id="hypothesis"
            name="hypothesis"
            rows={2}
            defaultValue={experiment.hypothesis ?? ""}
            className={inputClass}
            placeholder="예: 첫 장면에서 결론을 먼저 보여주면 3초 유지율이 높아질 것이다."
          />
        </Field>

        <Field label="Hook" htmlFor="hook">
          <textarea id="hook" name="hook" rows={2} defaultValue={experiment.hook ?? ""} className={inputClass} />
        </Field>

        <Field label="핵심 메시지" htmlFor="coreMessage">
          <textarea
            id="coreMessage"
            name="coreMessage"
            rows={2}
            defaultValue={experiment.coreMessage ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="콘텐츠 구조" htmlFor="structureSteps" hint="한 줄에 한 단계씩 적어주세요">
          <textarea
            id="structureSteps"
            name="structureSteps"
            rows={4}
            defaultValue={experiment.structureSteps ?? ""}
            className={inputClass}
            placeholder={"1. \n2. \n3. "}
          />
        </Field>

        <Field label="필요한 촬영" htmlFor="neededShooting">
          <textarea
            id="neededShooting"
            name="neededShooting"
            rows={2}
            defaultValue={experiment.neededShooting ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="사용할 기존 촬영본" htmlFor="existingFootage">
          <textarea
            id="existingFootage"
            name="existingFootage"
            rows={2}
            defaultValue={experiment.existingFootage ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="CTA" htmlFor="cta">
          <input id="cta" name="cta" defaultValue={experiment.cta ?? ""} className={inputClass} />
        </Field>

        <Field label="Thumbnail 메모" htmlFor="thumbnailNote">
          <input
            id="thumbnailNote"
            name="thumbnailNote"
            defaultValue={experiment.thumbnailNote ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Caption 메모" htmlFor="captionMemo">
          <textarea
            id="captionMemo"
            name="captionMemo"
            rows={3}
            defaultValue={experiment.captionMemo ?? ""}
            className={inputClass}
          />
        </Field>

        <SubmitButton>저장</SubmitButton>
      </form>
    </div>
  );
}
