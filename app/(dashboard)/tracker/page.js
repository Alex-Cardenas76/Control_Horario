'use client';

import TimeTracker from '@/components/TimeTracker';

export default function TrackerPage() {
    return (
        <div>
            <div className="page-header">
                <h1>Control de Jornada</h1>
                <p>Registra tu entrada, salida y pausas laborales</p>
            </div>
            <TimeTracker />
        </div>
    );
}
