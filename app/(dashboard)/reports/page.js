'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserSessions } from '@/lib/supabase';
import {
    getWeekRange,
    getMonthRange,
    getWeekDays,
    calculateDailyHours,
    formatDecimalHours,
} from '@/lib/timeUtils';
import WeeklyChart from '@/components/WeeklyChart';
import StatCard from '@/components/StatCard';
import { Clock, Calendar, TrendingUp, Award } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();
    const [period, setPeriod] = useState('week');
    const [weekChartData, setWeekChartData] = useState([]);
    const [monthChartData, setMonthChartData] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalHours: 0,
        totalSessions: 0,
        avgPerDay: 0,
        bestDay: '--',
    });

    const loadReportData = useCallback(async () => {
        if (!user) return;

        try {
            // Week data
            const weekRange = getWeekRange();
            const weekSessions = await getUserSessions(user.id, weekRange.start, weekRange.end);
            const today = new Date().toISOString().split('T')[0];
            const weekDays = getWeekDays();

            const wData = weekDays.map((day) => {
                const daySessions = weekSessions.filter(
                    (s) => new Date(s.start_time).toISOString().split('T')[0] === day.date
                );
                const hours = daySessions.reduce((sum, s) => sum + (s.total_hours || 0), 0);
                return {
                    name: day.name,
                    hours: parseFloat(hours.toFixed(1)),
                    isToday: day.date === today,
                };
            });
            setWeekChartData(wData);

            // Month data
            const monthRange = getMonthRange();
            const monthSessions = await getUserSessions(user.id, monthRange.start, monthRange.end);
            const dailyHours = calculateDailyHours(monthSessions);

            const mData = dailyHours.map((d) => ({
                name: new Date(d.date).getDate().toString(),
                hours: d.hours,
                isToday: d.date === today,
            }));
            setMonthChartData(mData);

            // Summary stats (based on active period)
            const activeSessions = period === 'week' ? weekSessions : monthSessions;
            const totalHours = activeSessions.reduce((sum, s) => sum + (s.total_hours || 0), 0);
            const uniqueDays = new Set(
                activeSessions.map((s) => new Date(s.start_time).toISOString().split('T')[0])
            );
            const avgPerDay = uniqueDays.size > 0 ? totalHours / uniqueDays.size : 0;

            // Find best day
            const dailyTotals = {};
            activeSessions.forEach((s) => {
                const date = new Date(s.start_time).toISOString().split('T')[0];
                dailyTotals[date] = (dailyTotals[date] || 0) + (s.total_hours || 0);
            });

            let bestDay = '--';
            let bestHours = 0;
            for (const [date, hours] of Object.entries(dailyTotals)) {
                if (hours > bestHours) {
                    bestHours = hours;
                    const d = new Date(date);
                    bestDay = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                }
            }

            setSummaryStats({
                totalHours: parseFloat(totalHours.toFixed(1)),
                totalSessions: activeSessions.length,
                avgPerDay: parseFloat(avgPerDay.toFixed(1)),
                bestDay,
            });
        } catch (err) {
            console.error('Error loading report data:', err);
        }
    }, [user, period]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    return (
        <div>
            <div className="page-header">
                <h1>Reportes</h1>
                <p>Análisis visual de tu tiempo trabajado</p>
            </div>

            {/* Period selector */}
            <div className="filters">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn ${period === 'week' ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setPeriod('week')}
                    >
                        Semanal
                    </button>
                    <button
                        className={`btn ${period === 'month' ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setPeriod('month')}
                    >
                        Mensual
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="reports-grid__summary">
                <StatCard
                    icon={Clock}
                    title="Total Horas"
                    value={formatDecimalHours(summaryStats.totalHours)}
                    subtitle={period === 'week' ? 'Esta semana' : 'Este mes'}
                    color="lime"
                />
                <StatCard
                    icon={Calendar}
                    title="Sesiones"
                    value={summaryStats.totalSessions}
                    subtitle="Jornadas completadas"
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Promedio/Día"
                    value={formatDecimalHours(summaryStats.avgPerDay)}
                    subtitle="Horas promedio diarias"
                    color="success"
                />
                <StatCard
                    icon={Award}
                    title="Mejor Día"
                    value={summaryStats.bestDay}
                    subtitle="Día más productivo"
                    color="lime"
                />
            </div>

            {/* Charts */}
            <div className="reports-grid" style={{ marginTop: '24px' }}>
                <div className="reports-grid__chart">
                    {period === 'week' ? (
                        <WeeklyChart data={weekChartData} title="Horas por Día – Semana Actual" />
                    ) : (
                        <WeeklyChart data={monthChartData} title="Horas por Día – Mes Actual" />
                    )}
                </div>
            </div>
        </div>
    );
}
