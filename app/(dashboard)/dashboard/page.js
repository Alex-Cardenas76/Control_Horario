'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserSessions } from '@/lib/supabase';
import {
    getWeekRange,
    getWeekDays,
    calculateWorkedHours,
    formatDecimalHours,
    calculateTotalBreakMs,
} from '@/lib/timeUtils';
import StatCard from '@/components/StatCard';
import TimeTracker from '@/components/TimeTracker';
import WeeklyChart from '@/components/WeeklyChart';
import SessionHistory from '@/components/SessionHistory';
import { Clock, Calendar, Coffee, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [stats, setStats] = useState({
        todayHours: 0,
        weekHours: 0,
        totalBreaks: 0,
        avgDaily: 0,
    });

    const loadDashboardData = useCallback(async () => {
        if (!user) return;

        try {
            const { start, end } = getWeekRange();
            const weekSessions = await getUserSessions(user.id, start, end);
            setSessions(weekSessions);

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const todaySessions = weekSessions.filter(
                (s) => new Date(s.start_time).toISOString().split('T')[0] === today
            );

            const todayHours = todaySessions.reduce((sum, s) => sum + (s.total_hours || 0), 0);
            const weekHours = weekSessions.reduce((sum, s) => sum + (s.total_hours || 0), 0);
            const totalBreaks = weekSessions.reduce((sum, s) => {
                return sum + (s.breaks?.length || 0);
            }, 0);
            const daysWorked = new Set(
                weekSessions.map((s) => new Date(s.start_time).toISOString().split('T')[0])
            ).size;
            const avgDaily = daysWorked > 0 ? weekHours / daysWorked : 0;

            setStats({
                todayHours: parseFloat(todayHours.toFixed(1)),
                weekHours: parseFloat(weekHours.toFixed(1)),
                totalBreaks,
                avgDaily: parseFloat(avgDaily.toFixed(1)),
            });

            // Build chart data
            const weekDays = getWeekDays();
            const chartData = weekDays.map((day) => {
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
            setWeekData(chartData);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    }, [user]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    return (
        <div className="dashboard-grid">
            {/* Stats Row */}
            <div className="dashboard-grid__stats">
                <StatCard
                    icon={Clock}
                    title="Horas Hoy"
                    value={formatDecimalHours(stats.todayHours)}
                    subtitle="Tiempo neto trabajado"
                    color="lime"
                    trend={stats.todayHours > 0 ? 5 : undefined}
                />
                <StatCard
                    icon={Calendar}
                    title="Horas Semana"
                    value={formatDecimalHours(stats.weekHours)}
                    subtitle="Total semanal"
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Promedio Diario"
                    value={formatDecimalHours(stats.avgDaily)}
                    subtitle={`${stats.totalBreaks} pausas esta semana`}
                    color="success"
                />
            </div>

            {/* Time Tracker */}
            <div className="dashboard-grid__tracker">
                <TimeTracker onSessionEnd={loadDashboardData} />
            </div>

            {/* Weekly chart */}
            <div className="dashboard-grid__chart">
                <WeeklyChart data={weekData} title="Horas por Día – Esta Semana" />
            </div>

            {/* Recent sessions */}
            <div className="dashboard-grid__history">
                <div className="dashboard-grid__history-header">
                    <h3>Sesiones Recientes</h3>
                    <Link href="/history" className="btn btn--ghost">
                        Ver todo
                    </Link>
                </div>
                <SessionHistory sessions={sessions} compact />
            </div>
        </div>
    );
}
