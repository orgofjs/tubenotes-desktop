# TubeNotes - Visual Video Knowledge Base

![License](https://img.shields.io/github/license/orgofjs/tubenotes-desktop)
![Version](https://img.shields.io/github/v/release/orgofjs/tubenotes-desktop)
![Platform](https://img.shields.io/badge/platform-windows-blue)

<div align="center">


<table>
  <tr>
    <td width="33%">
      <img src="public/pics/pic11.png" alt="Canvas Mode - Infinite canvas with shapes and markdown nodes" />
      <p align="center"><em>Video Library</em></p>
    </td>
    <td width="33%">
      <img src="public/pics/pic2.png" alt="Video Note Editor - Rich text editing with markdown support" />
      <p align="center"><em>Canvas Mode - Visual Note Taking</em></p>
    </td>
    <td width="33%">
      <img src="public/pics/pic3.png" alt="Video Library - Organize your YouTube notes" />
      <p align="center"><em>Kanban Task Mode</em></p>
    </td>
  </tr>
</table>

---

**[Türkçe](#türkçe)** | **[English](#english)**

</div>

---

> **TR:** 
>Bu proje hem hobi hem ihtiyaç olarak AI ile geliştirilmektedir. Geliştirmeler devam edecektir. Uygulamayı hemen kullanmak için [Hızlı Başlangıç](#hızlıbaslangıc) kısmına ilerleyin.
>Planlanan özellikleri ve proje yönlendirmesi [ROADMAP.md](./ROADMAP.md). dosyası içindedir.
>Geliştirme sürecinin güncel ilerleyişini [GitHub Projeler panosu](https://github.com/users/orgofjs/projects/1/views/1) ve [CHANGELOG.md](CHANGELOG.md) üzerinden takip edebilirsiniz. 
>Katkı yapmak için [CONTRIBUTING.md](./CONTRIBUTING.md) dosyasından yönergelere ulaşabilirsiniz.
>
> **EN:** 
>This project is being developed with AI as both a hobby and a necessity. Development will continue. Go to [Quick Start](#quickstart) to start using the app right away.
>Planned features and project direction can be found in [ROADMAP.md](./ROADMAP.md).
>Current development progress can be tracked via the
[GitHub Projects board](https://github.com/users/orgofjs/projects/1/views/1) and [CHANGELOG.md](CHANGELOG.md).
>For contribution guidelines, refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

---

<a id="türkçe"></a>

## Türkçe

TubeNotes, YouTube videolarınız için modern bir görsel bilgi yönetim sistemidir. Video notları alın, sonsuz canvas üzerinde fikirlerinizi görselleştirin, şekiller çizin, markdown notları ekleyin, Kanban görevlerinizi yönetin. Masaüstü uygulaması (Windows, macOS, Linux) olarak kullanılabilir.

<a id="hızlıbaslangıc"></a>

## Hızlı Başlangıç

- Adım 1: [Yayınlar](https://github.com/orgofjs/tubenotes-desktop/releases) sayfasına gidin.
- Adım 2: En son sürümü indirin `TubeNotes-Setup-0.2.3.exe`.
- Adım 3: Yükleyin ve not almaya başlayın!


### Ana Özellikler

- Kanban Görevler Modu
- Kanvas Not Alanı
- YouTube Video Notları
- Organizasyon Sistemi
- Tema Desteği
- Arama ve Filtreleme
- Yerel Depolama

### Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Masaüstü | Electron 40.0.0 + electron-builder |
| Veritabanı | SQLite (better-sqlite3 12.6.2) |
| ORM | Prisma 6.19.2 (schema tanımı için) |
| Dil | TypeScript 5 |
| Stil | Tailwind CSS 4 |
| Canvas | @xyflow/react 12.10.0 (React Flow) |
| Editör (Not) | Tiptap 3.15.3 (StarterKit, Link, Placeholder, CharacterCount) |
| Editör (Markdown) | CodeMirror 4.25.4 (@uiw/react-codemirror) |
| Animasyon | Framer Motion 12.26.2 |
| İkonlar | Lucide React 0.562.0 |
| Tarih | date-fns 4.1.0 |
| PWA | @ducanh2912/next-pwa 10.2.9 |

- PWA varsayılan olarak kapalıdır, açmak için `next.config.ts` dosyasına aşağıdaki değişikliği uygula:

```js
// Satır 32-34

// (sil)
withPWA({
  dest: "public",
  disable: true,
  register: false,
})

// (ekle)
withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
})
```

### Sistem Gereksinimleri

**Derlenmiş Uygulama**
- Windows 10+ (64-bit)
- macOS 10.13+
- Linux: Ubuntu 18.04+, Fedora 32+, Debian 10+
- RAM: -
- Disk: 500MB boş alan

**Geliştirme**
- Node.js 18.x+
- npm 9.x+
- Git

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/orgofjs/tubenotes-desktop.git

# Bağımlılıkları yükleyin
npm install

# Masaüstü için geliştirme
npm run electron-dev

# Windows için derleme
npm run build-win

# macOS için derleme
npm run build-mac

# Linux için derleme
npm run build-linux
```

### Yapılandırma

**Tema Özelleştirme**

`app/globals.css` dosyasını düzenleyin:

```css
:root[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-primary: #ff0000;
}
```

**Veri Konumu**
- Windows: `%APPDATA%/tubenotes/tubenotes.db` (SQLite)
- macOS: `~/Library/Application Support/tubenotes/tubenotes.db`
- Linux: `~/.config/tubenotes/tubenotes.db`

### Lisans

Apache 2.0 Lisansı - [LICENSE](LICENSE) dosyasına bakın.

---

<a id="english"></a>

## English

TubeNotes is a modern visual knowledge management system for YouTube videos. Take video notes, visualize your ideas on infinite canvas, draw shapes, manage your Kanban tasks and add markdown notes. Available as desktop application (Windows, macOS, Linux).

<a id="quickstart"></a>

## Quick Start

- Step 1: Go to the [Releases](https://github.com/orgofjs/tubenotes-desktop/releases) page.
- Step 2: Download the latest `TubeNotes-Setup-0.2.3.exe`.
- Step 3: Install and start taking notes!

### Key Features

- Kanban Task Mode
- Canvas Mode
- YouTube Video Notes
- Organization System
- Theme Support
- Search & Filtering
- Local Storage

### Technologies

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Desktop | Electron 40.0.0 + electron-builder |
| Database | SQLite (better-sqlite3 12.6.2) |
| ORM | Prisma 6.19.2 (schema definition) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Canvas | @xyflow/react 12.10.0 (React Flow) |
| Editor (Notes) | Tiptap 3.15.3 (StarterKit, Link, Placeholder, CharacterCount) |
| Editor (Markdown) | CodeMirror 4.25.4 (@uiw/react-codemirror) |
| Animation | Framer Motion 12.26.2 |
| Icons | Lucide React 0.562.0 |
| Date | date-fns 4.1.0 |
| PWA | @ducanh2912/next-pwa 10.2.9 |

- PWA is disabled by default; to enable it, apply the following change in the `next.config.ts` file:

```js
// Ln 32-34

// (delete)
withPWA({
  dest: "public",
  disable: true,
  register: false,
})

// (add)
withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
})
```

### System Requirements

**Built Application**
- Windows 10+ (64-bit)
- macOS 10.13+
- Linux: Ubuntu 18.04+, Fedora 32+, Debian 10+
- RAM: -
- Disk: 500MB free space

**Development**
- Node.js 18.x+
- npm 9.x+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/orgofjs/tubenotes-desktop.git

# Install dependencies
npm install

# Development for desktop
npm run electron-dev

# Build for Windows
npm run build-win

# Build for macOS
npm run build-mac

# Build for Linux
npm run build-linux
```

### Configuration

**Theme Customization**

Edit `app/globals.css`:

```css
:root[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-primary: #ff0000;
}
```

**Data Location**
- Windows: `%APPDATA%/tubenotes/tubenotes.db` (SQLite)
- macOS: `~/Library/Application Support/tubenotes/tubenotes.db`
- Linux: `~/.config/tubenotes/tubenotes.db`

### License

Apache 2.0 License - see [LICENSE](LICENSE) file.

---

<div align="center">
  <p>Made by <a href="https://github.com/orgofjs">orgofjs</a></p>
  <p>
    <a href="https://github.com/orgofjs/tubenotes/stargazers">Star</a> |
    <a href="https://github.com/orgofjs/tubenotes/issues">Report Bug</a> |
    <a href="https://github.com/orgofjs/tubenotes/issues">Request Feature</a>
  </p>
</div>
