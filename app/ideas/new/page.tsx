import { IdeaForm } from "@/app/ideas/IdeaForm";
import { createIdea } from "@/app/ideas/actions";

export default function NewIdeaPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">아이디어 저장</h1>
      <p className="mt-1 text-sm text-muted">
        제목 + 계정만 있어도 저장할 수 있어요.
      </p>
      <div className="mt-5">
        <IdeaForm action={createIdea} submitLabel="저장하기" />
      </div>
    </div>
  );
}
