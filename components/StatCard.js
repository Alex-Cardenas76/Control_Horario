'use client';

export default function StatCard({ icon: Icon, title, value, subtitle, trend, color = 'lime' }) {
    return (
        <div className={`stat-card stat-card--${color}`}>
            <div className="stat-card__header">
                <div className="stat-card__icon">
                    {Icon && <Icon size={18} />}
                </div>
                <span className="stat-card__title">{title}</span>
                {trend && (
                    <span className={`stat-card__trend stat-card__trend--${trend > 0 ? 'up' : 'down'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div className="stat-card__value">{value}</div>
            {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
        </div>
    );
}
