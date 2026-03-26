interface StatCardProps {
  title: string;
  value: string;
  note: string;
}

export default function StatCard({ title, value, note }: StatCardProps) {
  return (
    <article className="statCard">
      <h3>{title}</h3>
      <p className="value">{value}</p>
      <p className="note">{note}</p>
    </article>
  );
}
