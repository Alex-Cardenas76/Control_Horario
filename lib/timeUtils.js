/**
 * Time Calculation Utilities
 * Funciones puras para cálculo de horas trabajadas.
 * Sin dependencias de UI ni de capa de datos.
 */

/**
 * Calcula las horas trabajadas netas.
 * Fórmula: (end - start) - totalBreaks
 * @param {string|Date} startTime
 * @param {string|Date} endTime
 * @param {Array} breaks - Array de objetos { break_start, break_end }
 * @returns {number} Horas trabajadas (decimal)
 */
export function calculateWorkedHours(startTime, endTime, breaks = []) {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();

    const totalMs = end.getTime() - start.getTime();
    const totalBreakMs = calculateTotalBreakMs(breaks);

    const netMs = Math.max(0, totalMs - totalBreakMs);
    return netMs / (1000 * 60 * 60);
}

/**
 * Calcula el total de milisegundos en pausas.
 * @param {Array} breaks
 * @returns {number}
 */
export function calculateTotalBreakMs(breaks = []) {
    return breaks.reduce((total, brk) => {
        const breakStart = new Date(brk.break_start);
        const breakEnd = brk.break_end ? new Date(brk.break_end) : new Date();
        return total + (breakEnd.getTime() - breakStart.getTime());
    }, 0);
}

/**
 * Formatea milisegundos a HH:MM:SS
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formatea horas decimales a texto legible
 * @param {number} decimalHours
 * @returns {string}
 */
export function formatDecimalHours(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

/**
 * Obtiene el rango de la semana actual (lunes a domingo)
 * @param {Date} date
 * @returns {{ start: string, end: string }}
 */
export function getWeekRange(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
        start: monday.toISOString(),
        end: sunday.toISOString(),
    };
}

/**
 * Obtiene el rango del mes actual
 * @param {Date} date
 * @returns {{ start: string, end: string }}
 */
export function getMonthRange(date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

/**
 * Obtiene los nombres de los días de la semana desde una fecha base (lunes)
 * @param {Date} mondayDate
 * @returns {Array<{name: string, date: string}>}
 */
export function getWeekDays(mondayDate = null) {
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const monday = mondayDate ? new Date(mondayDate) : (() => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const m = new Date(now);
        m.setDate(diff);
        m.setHours(0, 0, 0, 0);
        return m;
    })();

    return dayNames.map((name, index) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + index);
        return {
            name,
            date: d.toISOString().split('T')[0],
            fullDate: d,
        };
    });
}

/**
 * Agrupa sesiones por fecha
 * @param {Array} sessions
 * @returns {Object} Mapa fecha -> array de sesiones
 */
export function groupSessionsByDate(sessions) {
    return sessions.reduce((groups, session) => {
        const date = new Date(session.start_time).toISOString().split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(session);
        return groups;
    }, {});
}

/**
 * Calcula el total de horas por día de un array de sesiones
 * @param {Array} sessions
 * @returns {Array<{date: string, hours: number}>}
 */
export function calculateDailyHours(sessions) {
    const grouped = groupSessionsByDate(sessions);
    return Object.entries(grouped).map(([date, daySessions]) => {
        const totalHours = daySessions.reduce((sum, session) => {
            return sum + (session.total_hours || 0);
        }, 0);
        return { date, hours: parseFloat(totalHours.toFixed(2)) };
    }).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Formatea una fecha a formato local
 * @param {string|Date} dateStr
 * @param {object} options
 * @returns {string}
 */
export function formatDate(dateStr, options = {}) {
    const date = new Date(dateStr);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    };
    return date.toLocaleDateString('es-ES', defaultOptions);
}

/**
 * Formatea hora de una fecha
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatTime(dateStr) {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
