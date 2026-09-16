type IconName =
  | "home"
  | "book"
  | "bulb"
  | "flask"
  | "chart"
  | "book2"
  | "plus";

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <path
      d="M4 11.5 12 5l8 6.5M6 10v9h12v-9"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  book: (
    <path
      d="M5 5.5C5 4.7 5.7 4 6.5 4H18v14.5H6.5c-.8 0-1.5.7-1.5 1.5V5.5ZM5 18.5c0-.8.7-1.5 1.5-1.5H18"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  bulb: (
    <path
      d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3Z"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  flask: (
    <path
      d="M9 3h6M10 3v6.2L4.8 18a1.5 1.5 0 0 0 1.3 2.3h11.8a1.5 1.5 0 0 0 1.3-2.3L14 9.2V3M8 15h8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  chart: (
    <path
      d="M5 20V9M12 20V4M19 20v-7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  book2: (
    <path
      d="M4 19.5V6a2 2 0 0 1 2-2h13v14.5M4 19.5A1.5 1.5 0 0 0 5.5 21H19M4 19.5A1.5 1.5 0 0 1 5.5 18H19"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  plus: (
    <path d="M12 5v14M5 12h14" strokeWidth="1.8" strokeLinecap="round" />
  ),
};

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
