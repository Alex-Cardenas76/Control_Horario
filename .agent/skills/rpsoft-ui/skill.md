---
name: rpsoft-ui
description: UI definitions and standards for RPSoft
---

# RPSoft UI Skill

## Stack Fijo
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS

## Estructura de Proyecto
- `src/components/ui`: Componentes base (atomicos).
- `src/features`: Módulos de negocio (ej: `auth`, `dashboard`).

## Componentes Base (Snippet Obligatorio)
```tsx
// src/components/ui/Button.tsx
export const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className={`bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors ${className}`} 
    {...props}
  >
    {children}
  </button>
);
```

## Reglas UI (Identidad Visual)
- **Layout**: Dashboard con Sidebar fija.
- **Colores**: Fondo `bg-slate-50`, Acentos Azul/Celeste.
- **Botones**: SIEMPRE `bg-black` + `text-white`.
- **Accesibilidad**: `aria-label` requerido en interactivos sin texto.

## Definition of Done (DoD UI)
- Sin errores en consola.
- Responsive **Mobile-First**.
