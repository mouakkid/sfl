type Props = { title: string; value: string; sub?: string; };
export default function KPI({ title, value, sub }: Props) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-400 mt-2">{sub}</div> : null}
    </div>
  );
}
