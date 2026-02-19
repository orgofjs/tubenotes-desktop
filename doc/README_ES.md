# TubeNotes - Base de Conocimiento Visual de Videos

![License](https://img.shields.io/github/license/orgofjs/tubenotes-desktop)
![Version](https://img.shields.io/github/v/release/orgofjs/tubenotes-desktop)
![Platform](https://img.shields.io/badge/platform-windows-blue)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)
![Website](https://img.shields.io/badge/website-tubenotes-green?link=https%3A%2F%2Ftubenotesdesktop.github.io%2F)

<div align="center">

<table>
  <tr>
    <td width="33%">
      <img src="../public/pics/pic11.png" alt="Modo Canvas - Lienzo infinito con formas y nodos markdown" />
      <p align="center"><em>Biblioteca de Videos</em></p>
    </td>
    <td width="33%">
      <img src="../public/pics/pic2.png" alt="Editor de Notas de Video - Edición de texto enriquecido con soporte markdown" />
      <p align="center"><em>Modo Canvas - Toma de Notas Visual</em></p>
    </td>
    <td width="33%">
      <img src="../public/pics/pic3.png" alt="Biblioteca de Videos - Organiza tus notas de YouTube" />
      <p align="center"><em>Modo de Tareas Kanban</em></p>
    </td>
  </tr>
</table>

</div>

---

TubeNotes es un sistema moderno de gestión visual del conocimiento para videos de YouTube. Toma notas de video, visualiza tus ideas en un lienzo infinito, dibuja formas, gestiona tus tareas Kanban y añade notas en markdown. Disponible como aplicación de escritorio (Windows, macOS, Linux).

## Inicio Rápido

- Paso 1: Ve a la página de [Releases](https://github.com/orgofjs/tubenotes-desktop/releases).
- Paso 2: Descarga la última versión.
- Paso 3: ¡Instala y empieza a tomar notas!

### Características Principales

- Modo de Tareas Kanban
- Modo Canvas
- Notas de Videos de YouTube
- Sistema de Organización
- Soporte de Temas
- Búsqueda y Filtrado
- Almacenamiento Local

### Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Escritorio | Electron 40.0.0 + electron-builder |
| Base de Datos | SQLite (better-sqlite3 12.6.2) |
| ORM | Prisma 6.19.2 (definición de esquema) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Canvas | @xyflow/react 12.10.0 (React Flow) |
| Editor (Notas) | Tiptap 3.15.3 (StarterKit, Link, Placeholder, CharacterCount) |
| Editor (Markdown) | CodeMirror 4.25.4 (@uiw/react-codemirror) |
| Animación | Framer Motion 12.26.2 |
| Iconos | Lucide React 0.562.0 |
| Fecha | date-fns 4.1.0 |
| PWA | @ducanh2912/next-pwa 10.2.9 |

- PWA está desactivado por defecto; para activarlo, aplica el siguiente cambio en el archivo `next.config.ts`:

```js
// Línea 32-34

// (eliminar)
withPWA({
  dest: "public",
  disable: true,
  register: false,
})

// (añadir)
withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
})
```

### Requisitos del Sistema

**Aplicación Compilada**
- Windows 10+ (64-bit)
- macOS 10.13+
- Linux: Ubuntu 18.04+, Fedora 32+, Debian 10+
- RAM: -
- Disco: 300MB de espacio libre

**Desarrollo**
- Node.js 18.x+
- npm 9.x+
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/orgofjs/tubenotes-desktop.git

# Instalar dependencias
npm install

# Desarrollo para escritorio
npm run electron-dev

# Compilar para Windows
npm run build-win

# Compilar para macOS
npm run build-mac

# Compilar para Linux
npm run build-linux
```

### Configuración

**Personalización del Tema**

Edita `app/globals.css`:

```css
:root[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-primary: #ff0000;
}
```

**Ubicación de Datos**
- Windows: `%APPDATA%/tubenotes/tubenotes.db` (SQLite)
- macOS: `~/Library/Application Support/tubenotes/tubenotes.db`
- Linux: `~/.config/tubenotes/tubenotes.db`

### Licencia

Licencia Apache 2.0 - consulta el archivo [LICENSE](../LICENSE).

---

<div align="center">
  <p>Hecho por <a href="https://github.com/orgofjs">orgofjs</a></p>
  <p>
    <a href="https://github.com/orgofjs/tubenotes/stargazers">Estrella</a> |
    <a href="https://github.com/orgofjs/tubenotes/issues">Reportar Error</a> |
    <a href="https://github.com/orgofjs/tubenotes/issues">Solicitar Función</a>
  </p>
</div>
