import { PlaybookForm } from "@/app/playbook/PlaybookForm";
import { createPlaybookRule } from "@/app/playbook/actions";

export default function NewPlaybookPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">Playbook Rule 추가</h1>
      <div className="mt-5">
        <PlaybookForm action={createPlaybookRule} submitLabel="저장하기" />
      </div>
    </div>
  );
}
