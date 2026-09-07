import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { StudyForm } from "@/app/study/StudyForm";
import { updateStudy } from "@/app/study/actions";

export default async function EditStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const study = await prisma.study.findUnique({ where: { id } });
  if (!study) notFound();

  const boundUpdate = updateStudy.bind(null, study.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">Study 수정</h1>
      <div className="mt-5">
        <StudyForm study={study} action={boundUpdate} submitLabel="수정 완료" />
      </div>
    </div>
  );
}
