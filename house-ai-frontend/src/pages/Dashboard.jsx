import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../api";

function Bars({ title, data, colors = {} }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <div className="stat-card">
      <span className="answer-label">{title}</span>
      {Object.keys(data).length === 0 && <p className="fallback-note">No data yet</p>}
      {Object.entries(data).map(([k, v]) => (
        <div className="bar-row" key={k}>
          <span className="bar-name">{k}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(v / max) * 100}%`, background: colors[k] }} />
          </div>
          <span className="bar-val">{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { getStats().then(setS).catch(() => setS(false)); }, []);

  return (
    <section className="history">
      <Link to="/" className="back-link">← Back home</Link>
      <h2 className="dash-title">Your Home Insights</h2>
      {s === false && <p className="fallback-note">Couldn't load stats.</p>}
      {s && (
        <>
          <div className="stat-row">
            <div className="stat-big"><b>{s.total}</b><span>questions asked</span></div>
            <div className="stat-big"><b>{s.videos}</b><span>videos suggested</span></div>
            <div className="stat-big"><b>{s.urgency.high || 0}</b><span>high-urgency issues</span></div>
          </div>
          <Bars title="Topics" data={s.categories}
            colors={{ food: "var(--accent-food)", appliance: "var(--accent-appliance)", energy: "var(--accent-energy)" }} />
          <Bars title="Urgency" data={s.urgency}
            colors={{ low: "#6fb8a8", medium: "#e8b94a", high: "#d9644a" }} />
          <Bars title="Last 7 active days" data={s.per_day} />
        </>
      )}
    </section>
  );
}
