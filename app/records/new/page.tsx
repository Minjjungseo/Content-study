import { RecordForm } from "@/app/records/RecordForm";
import { createRecord } from "@/app/records/actions";

export default function NewRecordPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">기록 저장</h1>
      <p className="mt-1 text-sm text-muted">
        제목만 있어도 저장할 수 있어요. 나머지는 나중에 이어서 적어도 됩니다.
      </p>
      <div className="mt-5">
        <RecordForm action={createRecord} />
      </div>
    </div>
  );
}
