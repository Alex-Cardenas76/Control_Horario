/**
 * Supabase Client Wrapper
 * Capa de abstracción sobre @supabase/supabase-js
 * Si se cambia el proveedor BaaS, solo se modifica este archivo.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
}

let supabaseInstance = null;

export function getSupabaseClient() {
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl || '', supabaseAnonKey || '');
    }
    return supabaseInstance;
}

// ─── Auth Helpers ────────────────────────────────────────
export async function signUpWithEmail(email, password, fullName) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });
    if (error) throw error;
    return data;
}

export async function signInWithEmail(email, password) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

// ─── Work Sessions ───────────────────────────────────────
export async function startWorkSession(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('work_sessions')
        .insert({
            user_id: userId,
            start_time: new Date().toISOString(),
            status: 'active',
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function endWorkSession(sessionId, totalHours) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('work_sessions')
        .update({
            end_time: new Date().toISOString(),
            total_hours: totalHours,
            status: 'completed',
        })
        .eq('id', sessionId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateSessionStatus(sessionId, status) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('work_sessions')
        .update({ status })
        .eq('id', sessionId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getActiveSession(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('work_sessions')
        .select('*, breaks(*)')
        .eq('user_id', userId)
        .in('status', ['active', 'paused'])
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function getUserSessions(userId, startDate, endDate) {
    const supabase = getSupabaseClient();
    let query = supabase
        .from('work_sessions')
        .select('*, breaks(*)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('start_time', { ascending: false });

    if (startDate) {
        query = query.gte('start_time', startDate);
    }
    if (endDate) {
        query = query.lte('start_time', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// ─── Breaks ──────────────────────────────────────────────
export async function startBreak(sessionId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('breaks')
        .insert({
            session_id: sessionId,
            break_start: new Date().toISOString(),
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function endBreak(breakId, totalMinutes) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('breaks')
        .update({
            break_end: new Date().toISOString(),
            total_break_minutes: totalMinutes,
        })
        .eq('id', breakId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getSessionBreaks(sessionId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('breaks')
        .select('*')
        .eq('session_id', sessionId)
        .order('break_start', { ascending: true });
    if (error) throw error;
    return data || [];
}

// ─── Profile ─────────────────────────────────────────────
export async function getUserProfile(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
}
