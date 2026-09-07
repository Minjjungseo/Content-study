import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { IdeaForm } from "@/app/ideas/IdeaForm";
import { updateIdea } from "@/app/ideas/actions";

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea) notFound();

  const boundUpdate = updateIdea.bind(null, idea.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">아이디어 수정</h1>
      <div className="mt-5">
        <IdeaForm idea={idea} action={boundUpdate} submitLabel="수정 완료" />
      </div>
    </div>
  );
}
