# ⏱️ TimeFlow – Control Horario

## Descripción

TimeFlow es una aplicación web diseñada para el **registro y gestión de jornadas laborales**. Permite a los empleados llevar un control preciso de sus horas de trabajo, incluyendo entradas, salidas y pausas, con cálculo automático de horas netas trabajadas.

### ¿Qué problema resuelve?

En muchas empresas, el registro de horas se hace de forma manual (hojas de Excel, papel), lo que genera errores, pérdida de datos y falta de visibilidad. TimeFlow digitaliza este proceso ofreciendo:

- **Registro en tiempo real** de entrada, salida y pausas
- **Cálculo automático** de horas netas (descontando pausas)
- **Historial completo** de jornadas con filtros por fecha
- **Reportes visuales** (gráficos semanales y mensuales)
- **Acceso seguro** con autenticación por usuario

---

## Cómo Correr el Proyecto

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- Cuenta en [Supabase](https://supabase.com/) (plan gratuito)

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd actividad_0
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard)
2. Ve al **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. En **Authentication → Providers → Email**, desactiva "Confirm email" (opcional)

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

Estos valores los encuentras en **Supabase → Settings → API**.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Build de producción (opcional)

```bash
npm run build
npm start
```

---

## Arquitectura Básica

### Stack tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | Renderizado y routing |
| UI | React + CSS puro | Componentes e interfaz |
| Backend | Supabase (PostgreSQL) | Base de datos y autenticación |
| Gráficos | Recharts | Visualización de datos |
| Iconos | Lucide React | Iconografía |

### Diagrama de capas

```
┌─────────────────────────────────────────────┐
│                   UI (app/)                  │
│         Páginas + Componentes React          │
├─────────────────────────────────────────────┤
│              Contexto (context/)             │
│         AuthContext → Estado global          │
├─────────────────────────────────────────────┤
│            Servicios (lib/)                  │
│   supabase.js → Wrapper de datos            │
│   timeUtils.js → Cálculos de tiempo         │
├─────────────────────────────────────────────┤
│           Infraestructura                    │
│      Supabase Auth + PostgreSQL + RLS        │
└─────────────────────────────────────────────┘
```

### Estructura de carpetas

```
app/                        → Páginas (App Router de Next.js)
├── login/                  → Inicio de sesión
├── register/               → Registro de usuario
└── (dashboard)/            → Rutas protegidas
    ├── dashboard/          → Vista principal con métricas
    ├── tracker/            → Control de entrada/salida
    ├── history/            → Historial de jornadas
    └── reports/            → Reportes con gráficos

components/                 → Componentes reutilizables
context/                    → Estado global (AuthContext)
lib/                        → Lógica de negocio y datos
```

### Modelo de datos

```
profiles            work_sessions           breaks
┌────────────┐      ┌────────────────┐      ┌──────────────────┐
│ id (PK)    │◄─────│ user_id (FK)   │      │ session_id (FK)  │
│ email      │      │ start_time     │◄─────│ break_start      │
│ full_name  │      │ end_time       │      │ break_end        │
│ avatar_url │      │ total_hours    │      │ total_minutes    │
└────────────┘      │ status         │      └──────────────────┘
                    └────────────────┘
```

### Flujo de la aplicación

```
Registro → Login → Dashboard
                      │
            ┌─────────┼──────────┐
            ▼         ▼          ▼
        Tracker    Historial  Reportes
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
  Entrada  Pausa  Salida
```

### Seguridad

- **Autenticación**: gestionada por Supabase Auth
- **Row Level Security (RLS)**: cada usuario solo accede a sus propios datos
- **Rutas protegidas**: el componente `ProtectedRoute` redirige al login si no hay sesión
- **Variables de entorno**: las credenciales se mantienen en `.env.local` (incluido en `.gitignore`)
