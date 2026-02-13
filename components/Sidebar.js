'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Clock,
    BarChart3,
    History,
    User,
    LogOut,
    Zap,
    X,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tracker', label: 'Control', icon: Clock },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/reports', label: 'Reportes', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const { logout, profile, user } = useAuth();

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';
    const displayEmail = user?.email || '';

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} />
            )}

            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                {/* Logo */}
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">
                        <Clock size={20} />
                    </div>
                    <span className="sidebar__logo-text">TimeFlow</span>
                    <button className="sidebar__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar__nav">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                                onClick={onClose}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Promo Card */}
                <div className="sidebar__promo">
                    <div className="sidebar__promo-icon">
                        <Zap size={24} />
                    </div>
                    <h4>Control Total</h4>
                    <p>Gestiona tu tiempo laboral de forma eficiente</p>
                </div>

                {/* User & Logout */}
                <div className="sidebar__footer">
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">
                            <User size={18} />
                        </div>
                        <div className="sidebar__user-info">
                            <span className="sidebar__user-name">{displayName}</span>
                            <span className="sidebar__user-email">{displayEmail}</span>
                        </div>
                    </div>
                    <button className="sidebar__logout" onClick={logout} title="Cerrar sesión">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}
