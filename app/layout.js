import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
    title: 'TimeFlow - Control Horario',
    description: 'Aplicación web de control y gestión de horarios laborales. Registra entradas, salidas, pausas y visualiza reportes de tu tiempo trabajado.',
    keywords: ['control horario', 'gestión tiempo', 'registro laboral', 'horas trabajadas'],
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
