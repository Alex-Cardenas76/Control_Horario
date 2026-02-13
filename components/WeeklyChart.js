'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip__label">{label}</p>
            <p className="chart-tooltip__value">{payload[0].value.toFixed(1)}h</p>
        </div>
    );
};

export default function WeeklyChart({ data = [], title = 'Horas por Día' }) {
    const maxHours = Math.max(...data.map(d => d.hours), 0);

    return (
        <div className="weekly-chart">
            <div className="weekly-chart__header">
                <h3>{title}</h3>
            </div>

            {data.length === 0 ? (
                <div className="weekly-chart__empty">
                    <p>Sin datos para mostrar</p>
                </div>
            ) : (
                <div className="weekly-chart__container">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                tickLine={false}
                                tickFormatter={(value) => `${value}h`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,238,68,0.05)' }} />
                            <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                {data.map((entry, index) => {
                                    const isToday = entry.isToday;
                                    const intensity = maxHours > 0 ? entry.hours / maxHours : 0;
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={isToday ? '#C8EE44' : `rgba(139, 92, 246, ${0.3 + intensity * 0.7})`}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
