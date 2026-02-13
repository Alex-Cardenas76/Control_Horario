'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Clock } from 'lucide-react';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fullName.trim() || !email.trim() || !password.trim()) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        try {
            await signUp(email, password, fullName);

            // Cerrar sesión automática para forzar al usuario a iniciar sesión
            const { getSupabaseClient } = await import('@/lib/supabase');
            await getSupabaseClient().auth.signOut();

            setSuccess('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('rate limit') || msg.includes('429')) {
                setError('Se ha excedido el límite de registros. Espera unos minutos e intenta de nuevo.');
            } else if (msg.includes('already registered') || msg.includes('User already registered')) {
                setError('Este correo ya está registrado. Intenta iniciar sesión.');
            } else if (msg.includes('invalid') && msg.includes('email')) {
                setError('El correo electrónico no es válido.');
            } else {
                setError(msg || 'Error al registrarse');
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

                <h2>Crear Cuenta</h2>
                <p className="auth-card__subtitle">Regístrate para comenzar a controlar tu tiempo</p>

                {error && <div className="auth-error">{error}</div>}
                {success && (
                    <div className="auth-error" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="register-name">Nombre completo</label>
                        <input
                            id="register-name"
                            type="text"
                            className="form-input"
                            placeholder="Juan Pérez"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-email">Correo electrónico</label>
                        <input
                            id="register-email"
                            type="email"
                            className="form-input"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">Contraseña</label>
                        <input
                            id="register-password"
                            type="password"
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-confirm">Confirmar contraseña</label>
                        <input
                            id="register-confirm"
                            type="password"
                            className="form-input"
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
                        {isLoading ? 'Creando cuenta...' : 'Registrarse'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
}
