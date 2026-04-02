/**
 * StatsCard Component
 * Reusable card for displaying statistics on dashboards.
 */
export default function StatsCard({ icon, label, value, subtitle, color = 'primary' }) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__icon">{icon}</div>
      <div className="stats-card__content">
        <p className="stats-card__label">{label}</p>
        <h3 className="stats-card__value">{value}</h3>
        {subtitle && <p className="stats-card__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
