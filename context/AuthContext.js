'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    getSupabaseClient,
    signUpWithEmail,
    signInWithEmail,
    signOut as supabaseSignOut,
    getUserProfile,
} from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async (userId) => {
        try {
            const p = await getUserProfile(userId);
            setProfile(p);
        } catch (err) {
            console.warn('Could not load profile:', err.message);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        const supabase = getSupabaseClient();
        let isMounted = true;

        // Check initial session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    await loadProfile(currentUser.id);
                }
            } catch (err) {
                console.error('Error initializing session:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initSession();

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    // Non-blocking profile load — don't let it freeze the UI
                    loadProfile(currentUser.id);
                } else {
                    setProfile(null);
                }

                // Ensure loading is always set to false after any auth change
                setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [loadProfile]);

    const signUp = async (email, password, fullName) => {
        const data = await signUpWithEmail(email, password, fullName);
        return data;
    };

    const signIn = async (email, password) => {
        const data = await signInWithEmail(email, password);
        return data;
    };

    const logout = async () => {
        await supabaseSignOut();
        setUser(null);
        setProfile(null);
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
