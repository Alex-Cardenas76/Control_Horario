'use client';

import { formatDate, formatTime, formatDecimalHours } from '@/lib/timeUtils';
import { Clock, Coffee, TrendingUp } from 'lucide-react';

export default function SessionHistory({ sessions = [], compact = false }) {
    if (sessions.length === 0) {
        return (
            <div className="session-history">
                <div className="session-history__empty">
                    <Clock size={40} />
                    <p>No hay sesiones registradas</p>
                </div>
            </div>
        );
    }

    const displaySessions = compact ? sessions.slice(0, 5) : sessions;

    return (
        <div className="session-history">
            <div className="session-history__list">
                {displaySessions.map((session) => {
                    const breakCount = session.breaks?.length || 0;
                    const totalBreakMinutes = session.breaks?.reduce(
                        (sum, b) => sum + (b.total_break_minutes || 0), 0
                    ) || 0;

                    return (
                        <div key={session.id} className="session-history__item">
                            <div className="session-history__date">
                                <span className="session-history__day">
                                    {formatDate(session.start_time, { weekday: 'short', day: 'numeric' })}
                                </span>
                                <span className="session-history__month">
                                    {formatDate(session.start_time, { month: 'short' })}
                                </span>
                            </div>

                            <div className="session-history__details">
                                <div className="session-history__times">
                                    <span>{formatTime(session.start_time)}</span>
                                    <span className="session-history__separator">→</span>
                                    <span>{formatTime(session.end_time)}</span>
                                </div>
                                {breakCount > 0 && (
                                    <div className="session-history__breaks">
                                        <Coffee size={12} />
                                        <span>{breakCount} pausa{breakCount > 1 ? 's' : ''} ({Math.round(totalBreakMinutes)} min)</span>
                                    </div>
                                )}
                            </div>

                            <div className="session-history__total">
                                <TrendingUp size={14} />
                                <span>{formatDecimalHours(session.total_hours || 0)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
