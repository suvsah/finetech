import StatCard from "@/components/StatCard";

const tasks = [
  "Irrigate Plot A (6:30 AM)",
  "Check tomato blight risk",
  "Rotate cattle to north pasture",
  "Schedule tractor maintenance",
];

export default function HomePage() {
  return (
    <main className="container">
      <header className="hero">
        <p className="badge">FarmFlow</p>
        <h1>Farmer-friendly Next.js dashboard</h1>
        <p>
          Track weather, crop health, and daily tasks in one clean dashboard built with React and Next.js.
        </p>
      </header>

      <section className="stats" aria-label="Farm summary">
        <StatCard title="Soil Moisture" value="62%" note="+4% vs yesterday" />
        <StatCard title="Rain Forecast" value="12 mm" note="Expected in 48 hours" />
        <StatCard title="Crop Health" value="Good" note="Low disease pressure" />
      </section>

      <section className="panel">
        <h2>Today&apos;s Priorities</h2>
        <ul>
          {tasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
