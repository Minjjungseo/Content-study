"use client";

import { useRef } from "react";
import { EXPERIMENT_STATUSES, STATUS_LABEL } from "@/app/lib/types";
import { inputClass } from "@/app/components/ui/Form";

export function StatusSelect({
  action,
  currentStatus,
}: {
  action: (formData: FormData) => void;
  currentStatus: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        className={`${inputClass} w-auto py-1.5`}
        onChange={() => formRef.current?.requestSubmit()}
      >
        {EXPERIMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </form>
  );
}
