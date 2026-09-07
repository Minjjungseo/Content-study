"use client";

export function DeleteButton({
  action,
  confirmMessage = "삭제하시겠습니까? 연결된 데이터는 유지되며 연결만 해제됩니다.",
  label = "삭제",
  className = "",
}: {
  action: (formData: FormData) => void;
  confirmMessage?: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className={`text-xs font-medium text-rose-600 hover:underline ${className}`}
      >
        {label}
      </button>
    </form>
  );
}
