import { StudyForm } from "@/app/study/StudyForm";
import { createStudy } from "@/app/study/actions";

export default function NewStudyPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold">Study 저장</h1>
      <p className="mt-1 text-sm text-muted">
        제목 + Type만 있어도 저장할 수 있어요. 나머지는 나중에 채워도 됩니다.
      </p>
      <div className="mt-5">
        <StudyForm action={createStudy} submitLabel="저장하기" />
      </div>
    </div>
  );
}
