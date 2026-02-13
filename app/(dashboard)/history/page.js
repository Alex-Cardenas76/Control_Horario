'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserSessions } from '@/lib/supabase';
import SessionHistory from '@/components/SessionHistory';
import { History, Download } from 'lucide-react';

export default function HistoryPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadSessions = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const start = startDate ? new Date(startDate).toISOString() : undefined;
            const end = endDate
                ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
                : undefined;

            const data = await getUserSessions(user.id, start, end);
            setSessions(data);
        } catch (err) {
            console.error('Error loading sessions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, startDate, endDate]);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const totalHours = sessions.reduce((sum, s) => sum + (s.total_hours || 0), 0);

    return (
        <div>
            <div className="page-header">
                <h1>Historial de Jornadas</h1>
                <p>Revisa todas tus sesiones de trabajo registradas</p>
            </div>

            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="filter-start">Desde</label>
                    <input
                        id="filter-start"
                        type="date"
                        className="filter-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="filter-end">Hasta</label>
                    <input
                        id="filter-end"
                        type="date"
                        className="filter-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button className="btn btn--ghost" onClick={() => { setStartDate(''); setEndDate(''); }}>
                    Limpiar filtros
                </button>
            </div>

            {/* Summary */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <History size={16} style={{ color: 'var(--color-purple)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        {sessions.length} sesiones
                    </span>
                </div>
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Total: <strong style={{ color: 'var(--color-lime)' }}>{totalHours.toFixed(1)}h</strong>
                    </span>
                </div>
            </div>

            {/* Sessions list */}
            {isLoading ? (
                <div className="loading-screen" style={{ minHeight: '200px' }}>
                    <div className="loading-spinner" />
                </div>
            ) : (
                <SessionHistory sessions={sessions} />
            )}
        </div>
    );
}
