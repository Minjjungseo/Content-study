import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { SourceForm } from "@/app/records/SourceForm";
import { updateSource, deleteAttachment } from "@/app/records/actions";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.learningRecord.findUnique({
    where: { id },
    include: { attachments: { orderBy: { createdAt: "desc" } } },
  });
  if (!record) notFound();

  const boundUpdate = updateSource.bind(null, record.id);
  const boundDeleteAttachment = deleteAttachment.bind(null, record.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">SOURCE 수정</h1>
      <div className="mt-5">
        <SourceForm
          record={record}
          attachments={record.attachments}
          onDeleteAttachment={boundDeleteAttachment}
          action={boundUpdate}
        />
      </div>
    </div>
  );
}
