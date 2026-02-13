'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    startWorkSession,
    endWorkSession,
    getActiveSession,
    startBreak,
    endBreak,
    updateSessionStatus,
} from '@/lib/supabase';
import {
    calculateWorkedHours,
    calculateTotalBreakMs,
    formatDuration,
} from '@/lib/timeUtils';
import { Play, Square, Coffee, Timer } from 'lucide-react';

/**
 * Estados posibles del tracker:
 * - idle: Sin sesión activa
 * - working: Trabajando (temporizador corriendo)
 * - paused: En pausa
 */

export default function TimeTracker({ onSessionEnd }) {
    const { user } = useAuth();
    const [status, setStatus] = useState('idle'); // idle | working | paused
    const [session, setSession] = useState(null);
    const [activeBreak, setActiveBreak] = useState(null);
    const [elapsedDisplay, setElapsedDisplay] = useState('00:00:00');
    const [breakDisplay, setBreakDisplay] = useState('00:00:00');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const timerRef = useRef(null);

    // Load existing active session on mount
    useEffect(() => {
        if (!user) return;

        const loadActiveSession = async () => {
            try {
                const activeSession = await getActiveSession(user.id);
                if (activeSession) {
                    setSession(activeSession);
                    const openBreak = activeSession.breaks?.find(b => !b.break_end);
                    if (openBreak) {
                        setActiveBreak(openBreak);
                        setStatus('paused');
                    } else {
                        setStatus(activeSession.status === 'paused' ? 'paused' : 'working');
                    }
                }
            } catch (err) {
                console.error('Error loading active session:', err);
            }
        };

        loadActiveSession();
    }, [user]);

    // Timer tick
    const updateTimers = useCallback(() => {
        if (!session) return;

        const now = new Date();
        const start = new Date(session.start_time);
        const totalBreak = calculateTotalBreakMs(session.breaks || []);

        if (status === 'working') {
            const elapsed = now.getTime() - start.getTime() - totalBreak;
            setElapsedDisplay(formatDuration(elapsed));
        } else if (status === 'paused' && activeBreak) {
            const breakStart = new Date(activeBreak.break_start);
            const currentBreakMs = now.getTime() - breakStart.getTime();
            setBreakDisplay(formatDuration(currentBreakMs));

            // Still update total elapsed (frozen since pause)
            const elapsed = now.getTime() - start.getTime() - totalBreak;
            setElapsedDisplay(formatDuration(elapsed));
        }
    }, [session, status, activeBreak]);

    useEffect(() => {
        if (status === 'idle') {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        updateTimers();
        timerRef.current = setInterval(updateTimers, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, updateTimers]);

    const clearError = () => setError(null);

    // ─── Actions ───────────────────────────────────────────
    const handleStartWork = async () => {
        clearError();
        setIsLoading(true);
        try {
            const newSession = await startWorkSession(user.id);
            setSession({ ...newSession, breaks: [] });
            setStatus('working');
            setElapsedDisplay('00:00:00');
        } catch (err) {
            setError('Error al iniciar jornada: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartBreak = async () => {
        clearError();
        setIsLoading(true);
        try {
            await updateSessionStatus(session.id, 'paused');
            const newBreak = await startBreak(session.id);
            setActiveBreak(newBreak);
            setSession(prev => ({
                ...prev,
                status: 'paused',
                breaks: [...(prev.breaks || []), newBreak],
            }));
            setStatus('paused');
            setBreakDisplay('00:00:00');
        } catch (err) {
            setError('Error al iniciar pausa: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndBreak = async () => {
        clearError();
        setIsLoading(true);
        try {
            const breakStart = new Date(activeBreak.break_start);
            const totalMinutes = (Date.now() - breakStart.getTime()) / (1000 * 60);

            const updatedBreak = await endBreak(activeBreak.id, parseFloat(totalMinutes.toFixed(2)));
            await updateSessionStatus(session.id, 'active');

            setSession(prev => ({
                ...prev,
                status: 'active',
                breaks: prev.breaks.map(b =>
                    b.id === activeBreak.id ? updatedBreak : b
                ),
            }));
            setActiveBreak(null);
            setStatus('working');
            setBreakDisplay('00:00:00');
        } catch (err) {
            setError('Error al finalizar pausa: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndWork = async () => {
        clearError();
        setIsLoading(true);
        try {
            // If there's an active break, end it first
            if (activeBreak) {
                const breakStart = new Date(activeBreak.break_start);
                const totalMinutes = (Date.now() - breakStart.getTime()) / (1000 * 60);
                await endBreak(activeBreak.id, parseFloat(totalMinutes.toFixed(2)));
            }

            const totalHours = calculateWorkedHours(
                session.start_time,
                new Date().toISOString(),
                session.breaks || []
            );

            await endWorkSession(session.id, parseFloat(totalHours.toFixed(2)));

            setSession(null);
            setActiveBreak(null);
            setStatus('idle');
            setElapsedDisplay('00:00:00');
            setBreakDisplay('00:00:00');

            if (onSessionEnd) onSessionEnd();
        } catch (err) {
            setError('Error al finalizar jornada: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="time-tracker">
            <div className="time-tracker__header">
                <Timer size={22} />
                <h3>Control de Jornada</h3>
                <span className={`time-tracker__status time-tracker__status--${status}`}>
                    {status === 'idle' && 'Sin iniciar'}
                    {status === 'working' && 'Trabajando'}
                    {status === 'paused' && 'En pausa'}
                </span>
            </div>

            {/* Timer display */}
            <div className="time-tracker__display">
                <div className="time-tracker__time">{elapsedDisplay}</div>
                <p className="time-tracker__label">
                    {status === 'idle' ? 'Tiempo trabajado' : 'Tiempo neto trabajado'}
                </p>
                {status === 'paused' && (
                    <div className="time-tracker__break-display">
                        <Coffee size={14} />
                        <span>Pausa: {breakDisplay}</span>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="time-tracker__actions">
                {status === 'idle' && (
                    <button
                        className="btn btn--primary btn--lg"
                        onClick={handleStartWork}
                        disabled={isLoading}
                    >
                        <Play size={20} />
                        Marcar Entrada
                    </button>
                )}

                {status === 'working' && (
                    <>
                        <button
                            className="btn btn--secondary"
                            onClick={handleStartBreak}
                            disabled={isLoading}
                        >
                            <Coffee size={18} />
                            Iniciar Pausa
                        </button>
                        <button
                            className="btn btn--danger"
                            onClick={handleEndWork}
                            disabled={isLoading}
                        >
                            <Square size={18} />
                            Marcar Salida
                        </button>
                    </>
                )}

                {status === 'paused' && (
                    <>
                        <button
                            className="btn btn--primary"
                            onClick={handleEndBreak}
                            disabled={isLoading}
                        >
                            <Play size={18} />
                            Reanudar Trabajo
                        </button>
                        <button
                            className="btn btn--danger"
                            onClick={handleEndWork}
                            disabled={isLoading}
                        >
                            <Square size={18} />
                            Marcar Salida
                        </button>
                    </>
                )}
            </div>

            {/* Error display */}
            {error && (
                <div className="time-tracker__error">
                    <p>{error}</p>
                    <button onClick={clearError}>✕</button>
                </div>
            )}
        </div>
    );
}
