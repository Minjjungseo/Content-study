import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { StudyForm } from "@/app/study/StudyForm";
import { updateStudy, deleteStudyAttachment } from "@/app/study/actions";

export default async function EditStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const study = await prisma.study.findUnique({
    where: { id },
    include: { attachments: { orderBy: { createdAt: "desc" } } },
  });
  if (!study) notFound();

  const boundUpdate = updateStudy.bind(null, study.id);
  const boundDeleteAttachment = deleteStudyAttachment.bind(null, study.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">Study 수정</h1>
      <div className="mt-5">
        <StudyForm
          study={study}
          attachments={study.attachments}
          onDeleteAttachment={boundDeleteAttachment}
          action={boundUpdate}
          submitLabel="수정 완료"
        />
      </div>
    </div>
  );
}
