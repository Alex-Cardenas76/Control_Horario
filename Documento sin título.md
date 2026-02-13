# **📄 DOCUMENTO DE ESPECIFICACIÓN DE REQUERIMIENTOS**

## **Aplicación Web de Control Horario**

---

## **1\. Introducción**

### **1.1 Propósito del documento**

El presente documento tiene como finalidad definir los requerimientos funcionales y no funcionales para el desarrollo de una **Aplicación Web de Control y Gestión de Horarios Laborales**, la cual permitirá registrar, calcular y visualizar el tiempo trabajado por los usuarios.

Este documento servirá como base para el análisis, diseño, desarrollo e implementación del sistema.

---

### **1.2 Alcance del sistema**

La aplicación permitirá:

* Registrar entradas y salidas laborales.  
* Gestionar pausas o descansos.  
* Calcular automáticamente las horas trabajadas.  
* Generar reportes visuales del tiempo trabajado.  
* Acceder mediante autenticación segura.

El sistema será desarrollado como una aplicación web moderna y responsive.

---

### **1.3 Definiciones y abreviaturas**

* **Usuario**: Persona que registra su jornada laboral.  
* **Jornada**: Periodo comprendido entre la hora de entrada y salida.  
* **Pausa**: Tiempo de descanso dentro de una jornada.  
* **Supabase**: Plataforma Backend-as-a-Service que provee base de datos PostgreSQL y autenticación.  
* **Responsive**: Adaptable a distintos tamaños de pantalla.

---

## **2\. Descripción General del Sistema**

### **2.1 Perspectiva del producto**

La aplicación será un sistema web accesible desde navegador, desarrollada con:

* **Frontend:** JavaScript o TypeScript (React o Next.js).  
* **Backend y Base de Datos:** Supabase.  
* **Autenticación:** Supabase Auth.

No se requiere servidor backend tradicional, ya que Supabase gestionará base de datos y autenticación.

---

### **2.2 Funciones del sistema**

El sistema permitirá:

1. Registro de usuarios.  
2. Inicio y cierre de sesión.  
3. Registro de entrada laboral.  
4. Registro de salida laboral.  
5. Registro de pausas (inicio y fin).  
6. Cálculo automático de horas trabajadas.  
7. Visualización de historial.  
8. Generación de reportes visuales.  
9. Interfaz moderna y adaptable.

---

### **2.3 Características de los usuarios**

| Tipo de Usuario | Descripción |
| ----- | ----- |
| Usuario estándar | Persona que registra su horario laboral |
| Administrador (opcional) | Puede visualizar reportes globales |

---

## **3\. Requerimientos Funcionales**

### **RF01 – Registro de Usuario**

El sistema debe permitir el registro de nuevos usuarios mediante correo electrónico y contraseña usando Supabase Auth.

### **RF02 – Inicio de Sesión**

El sistema debe permitir el inicio de sesión con autenticación segura.

### **RF03 – Registro de Entrada**

El sistema debe permitir registrar la hora exacta de inicio de jornada con un botón “Marcar Entrada”.

### **RF04 – Registro de Salida**

El sistema debe permitir registrar la hora de finalización con un botón “Marcar Salida”.

### **RF05 – Gestión de Pausas**

El sistema debe permitir:

* Iniciar pausa.  
* Finalizar pausa.  
* Registrar automáticamente el tiempo de descanso.

### **RF06 – Cálculo Automático**

El sistema debe:

* Calcular automáticamente el total de horas trabajadas.  
* Restar el tiempo de pausas.  
* Mostrar horas netas trabajadas.

Fórmula básica:

Horas trabajadas \= (Hora salida – Hora entrada) – Total pausas

### **RF07 – Historial de Jornadas**

El sistema debe mostrar un listado histórico de jornadas por fecha.

### **RF08 – Reportes Visuales**

El sistema debe generar:

* Gráficos de horas trabajadas por día.  
* Resumen semanal.  
* Resumen mensual.

### **RF09 – Interfaz Responsive**

La aplicación debe adaptarse correctamente a:

* Desktop  
* Tablet  
* Smartphone

---

## **4\. Requerimientos No Funcionales**

### **RNF01 – Seguridad**

* Autenticación mediante Supabase.  
* Protección de rutas privadas.  
* Acceso a datos únicamente del usuario autenticado.

### **RNF02 – Rendimiento**

* Tiempo de respuesta menor a 2 segundos.  
* Cálculos en tiempo real.

### **RNF03 – Usabilidad**

* Interfaz intuitiva.  
* Botones claramente identificados.  
* Diseño minimalista y moderno.

### **RNF04 – Compatibilidad**

* Compatible con navegadores modernos (Chrome, Edge, Firefox).

### **RNF05 – Escalabilidad**

* Base de datos en Supabase escalable.  
* Arquitectura preparada para múltiples usuarios.

---

## **5\. Modelo de Datos Propuesto**

### **Tabla: users**

* id (UUID)  
* email  
* created\_at

### **Tabla: work\_sessions**

* id (UUID)  
* user\_id (FK)  
* start\_time (timestamp)  
* end\_time (timestamp)  
* total\_hours (decimal)  
* created\_at

### **Tabla: breaks**

* id (UUID)  
* session\_id (FK)  
* break\_start (timestamp)  
* break\_end (timestamp)  
* total\_break\_time (decimal)

Relaciones:

* Un usuario puede tener muchas jornadas.  
* Una jornada puede tener múltiples pausas.

---

## **6\. Stack Tecnológico**

### **Base de Datos y Backend**

* Supabase (PostgreSQL)  
* Supabase Auth

### **Frontend**

* JavaScript o TypeScript  
* React o Next.js  
* Librería de gráficos (ej: Chart.js o Recharts)

### **Herramientas adicionales**

* Git para control de versiones  
* Vercel o similar para despliegue

---

## **7\. Restricciones del Sistema**

* El sistema depende de conexión a internet.  
* El registro de horas se basa en la hora del servidor.  
* Se requiere navegador moderno.

---

## **8\. Criterios de Aceptación**

El sistema será aceptado cuando:

* El usuario pueda registrarse e iniciar sesión correctamente.  
* Se puedan registrar entradas y salidas sin errores.  
* Se calculen correctamente las horas trabajadas.  
* Los reportes visuales muestren información coherente.  
* La aplicación sea responsive.


  
