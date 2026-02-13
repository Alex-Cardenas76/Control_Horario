'use client';

import { useAuth } from '@/context/AuthContext';
import { Search, Bell, Menu } from 'lucide-react';
import { formatDate } from '@/lib/timeUtils';

export default function Header({ onMenuClick }) {
    const { profile, user } = useAuth();
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';
    const today = formatDate(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="header">
            <div className="header__left">
                <button className="header__menu-btn" onClick={onMenuClick}>
                    <Menu size={22} />
                </button>
                <div className="header__greeting">
                    <h2 className="header__title">¡Hola, {displayName}!</h2>
                    <p className="header__date">{today}</p>
                </div>
            </div>

            <div className="header__right">
                <div className="header__search">
                    <Search size={16} />
                    <input type="text" placeholder="Buscar..." className="header__search-input" />
                </div>
                <button className="header__notification">
                    <Bell size={20} />
                    <span className="header__notification-dot" />
                </button>
            </div>
        </header>
    );
}
