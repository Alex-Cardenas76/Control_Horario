'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Clock } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    // Prefetch dashboard para que compile antes del login
    useEffect(() => {
        router.prefetch('/dashboard');
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Por favor completa todos los campos');
            return;
        }

        setIsLoading(true);
        try {
            await signIn(email, password);
            router.replace('/dashboard');
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('Email not confirmed')) {
                setError('Tu email aún no ha sido confirmado. Revisa tu bandeja de entrada (o spam) y haz clic en el enlace de confirmación.');
            } else if (msg.includes('Invalid login credentials')) {
                setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
            } else {
                setError(msg || 'Error al iniciar sesión');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in">
                <div className="auth-card__logo">
                    <div className="auth-card__logo-icon">
                        <Clock size={24} />
                    </div>
                    <span>TimeFlow</span>
                </div>

                <h2>Iniciar Sesión</h2>
                <p className="auth-card__subtitle">Ingresa a tu cuenta para controlar tu jornada</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login-email">Correo electrónico</label>
                        <input
                            id="login-email"
                            type="email"
                            className="form-input"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Contraseña</label>
                        <input
                            id="login-password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
                        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    ¿No tienes cuenta? <Link href="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}
