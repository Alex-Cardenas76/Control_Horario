'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="app-layout">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="app-layout__content">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="app-layout__main">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
