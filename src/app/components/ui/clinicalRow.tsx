type Props = {
  label: string;
  value: string;
  highlight?: boolean;
  multiline?: boolean;
};

export function ClinicalRow({ label, value, highlight, multiline }: Props) {
  return (
    <div className="grid grid-cols-[220px_1fr] border-b pb-2">
      <span className="text-muted-foreground font-medium">
        {label}
      </span>

      <span
        className={`
          font-medium
          ${highlight ? 'text-green-600 font-semibold' : ''}
          ${multiline ? 'whitespace-pre-wrap break-words' : ''}
        `}
      >
        {value}
      </span>
    </div>
  );
}

export default ClinicalRow;