# 🚗 Nissan - Sistema de Gestión de Citas y TV Display

Un sistema profesional de visualización y gestión de servicios automotrices diseñado para sucursales Nissan. Permite sincronizar en tiempo real el estado de los vehículos en taller desde un panel administrativo hacia una pantalla pública (TV) con un scroll infinito fluido.

![Nissan Banner](https://raw.githubusercontent.com/ammber69/citas/master/src/assets/logo.png)

## ✨ Características Principales

- **📺 Pantalla de TV Pública**: Visualización elegante con scroll infinito ascendente (60-120 FPS) para mostrar el estado de todas las citas del día.
- **🛠️ Panel de Administración**: Interfaz intuitiva para cambiar estados de servicio (En espera, En servicio, Vehículo Listo) con un solo clic.
- **📊 Importación DMS (CSV)**: Carga masiva de citas directamente desde el sistema DMS, con soporte automático para caracteres especiales (Ñ, acentos).
- **☁️ Sincronización en Tiempo Real**: Utiliza **Supabase Realtime** para que los cambios en el panel administrativo se reflejen instantáneamente en todas las pantallas.
- **🎨 Identidad de Marca**: Diseño alineado con la estética de Nissan, incluyendo logotipos oficiales y paleta de colores corporativa.

## 🚀 Tecnologías Utilizadas

- **Frontend**: React.js con Vite
- **Estilos**: Tailwind CSS (Diseño Premium)
- **Base de Datos**: Supabase (PostgreSQL + Realtime)
- **Iconos**: Lucide React
- **Procesamiento**: PapaParse (Lectura de CSV)

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ammber69/citas.git
   cd citas
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Supabase:**
   Crea un archivo `.env` o configura el cliente en `src/utils/supabaseClient.js` con tus credenciales:
   ```javascript
   const supabaseUrl = 'TU_URL_DE_SUPABASE';
   const supabaseKey = 'TU_ANON_KEY';
   ```

4. **Preparar la Base de Datos:**
   Ejecuta el siguiente SQL en tu editor de Supabase para crear la tabla necesaria:
   ```sql
   create table turnos (
     id uuid default uuid_generate_v4() primary key,
     folio text,
     cliente text,
     vehiculo text,
     horacita text,
     horaentrega text,
     asesor text,
     estado text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```

5. **Correr en local:**
   ```bash
   npm run dev
   ```

## 📖 Guía de Uso

1. **Inicio**: La aplicación abre por defecto en la pantalla de TV.
2. **Administración**: Haz clic en el título de la cabecera para acceder al panel de control.
3. **Carga de Datos**: Exporta el CSV de tu DMS y súbelo en el panel de administración. El sistema detectará automáticamente clientes, vehículos y asesores.
4. **Gestión**: Cambia el estado de cada vehículo según avance el servicio. La TV se actualizará sola.

---
Desarrollado con ❤️ para Nissan.
