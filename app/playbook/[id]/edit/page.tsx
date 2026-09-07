import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { PlaybookForm } from "@/app/playbook/PlaybookForm";
import { updatePlaybookRule } from "@/app/playbook/actions";

export default async function EditPlaybookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rule = await prisma.playbookRule.findUnique({ where: { id } });
  if (!rule) notFound();

  const boundUpdate = updatePlaybookRule.bind(null, rule.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">Playbook Rule 수정</h1>
      <div className="mt-5">
        <PlaybookForm rule={rule} action={boundUpdate} submitLabel="수정 완료" />
      </div>
    </div>
  );
}
