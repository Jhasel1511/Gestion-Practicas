# SGP - Sistema de Gestión de Prácticas Profesionales

Plataforma universitaria para la gestión y supervisión del ciclo completo de prácticas profesionales entre estudiantes, empresas y coordinación académica.

---

## 📋 Requisitos Previos

Asegúrate de tener instalados en tu computadora:

- **Python** (versión 3.10 o superior) - [Descargar Python](https://www.python.org/downloads/)
- **Node.js** (versión 18 o superior) y **npm** - [Descargar Node.js](https://nodejs.org/)
- **Git** - [Descargar Git](https://git-scm.com/)

---

## 🚀 Guía de Ejecución en Localhost

El sistema está dividido en dos partes: **Backend** (FastAPI) y **Frontend** (React + Vite). Necesitarás tener **dos terminales abiertas simultáneamente**.

---

### 1. Terminal 1: Iniciar el Backend (FastAPI)

1. **Abrir la terminal e ingresar a la carpeta `backend`:**
   ```bash
   cd backend
   ```

2. **Crear y activar un entorno virtual de Python:**
   - **En Windows (PowerShell):**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
     *(Si PowerShell te bloquea la ejecución de scripts, ejecuta antes: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*
   - **En Linux / macOS / Git Bash:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Instalar las librerías necesarias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar el archivo de variables de entorno:**
   - Crea el archivo `.env` basándote en el ejemplo:
     - **Windows (PowerShell):**
       ```powershell
       Copy-Item .env.example .env
       ```
     - **Linux / macOS:**
       ```bash
       cp .env.example .env
       ```
   - *Nota:* Por defecto viene configurado para usar SQLite (`sqlite:///./sgp.db`), por lo que no necesitas instalar PostgreSQL para probarlo localmente.

5. **Cargar los datos iniciales de prueba (Seed):**
   ```bash
   python -m app.seed
   ```
   *(Crea las tablas en la base de datos y los 4 usuarios de prueba).*

6. **Iniciar el servidor backend:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - La API estará corriendo en: `http://localhost:8000`
   - Documentación interactiva (Swagger UI): `http://localhost:8000/docs`

---

### 2. Terminal 2: Iniciar el Frontend (React + Vite)

1. **Abrir una segunda terminal e ingresar a la carpeta `frontend`:**
   ```bash
   cd frontend
   ```

2. **Instalar las dependencias de Node.js:**
   ```bash
   npm install
   ```

3. **Configurar el archivo de variables de entorno:**
   - Crea el archivo `.env` a partir del ejemplo:
     - **Windows (PowerShell):**
       ```powershell
       Copy-Item .env.example .env
       ```
     - **Linux / macOS:**
       ```bash
       cp .env.example .env
       ```
   - Contiene la URL hacia el backend (`VITE_API_URL=http://localhost:8000`).

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   - Abre tu navegador web en: **`http://localhost:5173`**

---

## 👥 Usuarios y Credenciales de Prueba

Todos los usuarios tienen la misma contraseña predeterminada:

> **Contraseña común:** `Clave123!`

| Rol | Correo Electrónico | Funcionalidades Principales |
| :--- | :--- | :--- |
| **Estudiante** | `estudiante@uninorte.edu.co` | Ver vacantes, postularse, registrar bitácora de horas, reportar incidencias. |
| **Empresa** | `empresa@acme.com` | Publicar convocatorias, revisar candidatos, validar horas de practicantes. |
| **Coordinador** | `coordinador@uninorte.edu.co` | Aprobar vacantes, formalizar inicio de prácticas, emitir certificado oficial. |
| **Gestor** | `gestor@uninorte.edu.co` | Mesa de ayuda, clasificación de gravedad, seguimiento y resolución de casos. |

*(En la pantalla de inicio de sesión también dispones de botones de acceso rápido para rellenar automáticamente las credenciales de cada rol).*

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Python 3, FastAPI, SQLAlchemy, SQLite/PostgreSQL, Pydantic, Passlib (Bcrypt), JWT (python-jose).
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios, React Router v6.
