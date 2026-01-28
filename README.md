# TubeNotes - Visual Video Knowledge Base

<div align="center">


<table>
  <tr>
    <td width="33%">
      <img src="public/pics/pic11.png" alt="Canvas Mode - Infinite canvas with shapes and markdown nodes" />
      <p align="center"><em>Canvas Mode - Visual Note Taking</em></p>
    </td>
    <td width="33%">
      <img src="public/pics/pic2.png" alt="Video Note Editor - Rich text editing with markdown support" />
      <p align="center"><em>Video Note Editor</em></p>
    </td>
    <td width="33%">
      <img src="public/pics/pic3.png" alt="Video Library - Organize your YouTube notes" />
      <p align="center"><em>Video Library</em></p>
    </td>
  </tr>
</table>

---

**[Türkçe](#türkçe)** | **[English](#english)**

</div>

---

> **TR:** Bu proje hem hobi hem ihtiyaç olarak AI ile geliştirilmektedir. Geliştirmeler devam edecektir. Planlanan özellikleri ve proje yönlendirmesi [ROADMAP.md](./ROADMAP.md). dosyası içindedir. Geliştirme sürecinin güncel ilerleyişini [GitHub Projeler panosu](https://github.com/users/orgofjs/projects/1/views/1) üzerinden takip edebilirsiniz. Katkı yapmak için [CONTRIBUTING.md](./CONTRIBUTING.md) dosyasından yönergelere ulaşabilirsiniz.
>
> **EN:** This project is being developed with AI as both a hobby and a necessity. Development will continue. Planned features and project direction can be found in [ROADMAP.md](./ROADMAP.md). Current development progress can be tracked via the
[GitHub Projects board](https://github.com/users/orgofjs/projects/1/views/1). For contribution guidelines, refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

---

<a id="türkçe"></a>

## Türkçe

### Genel Bakış

TubeNotes, YouTube videolarınız için modern bir görsel bilgi yönetim sistemidir. Video notları alın, sonsuz canvas üzerinde fikirlerinizi görselleştirin, şekiller çizin, markdown notları ekleyin. Masaüstü uygulaması (Windows, macOS, Linux) olarak kullanılabilir.

### Ana Özellikler

**Canvas Mode (Yeni!)**
- React Flow tabanlı sonsuz canvas
- Metin kutuları ile hızlı not alma
- CodeMirror ile markdown editör node'ları
- Manuel kaydetme (Ctrl+S) - veri güvenliği
- Canvas export/import (.json)
- Zoom ve pan özellikleri

**YouTube Video Notları**
- Otomatik video metadata çekme (başlık, kanal, thumbnail)
- Tiptap zengin metin editörü
- Kalın, italik, altı çizili, üstü çizili metin
- Başlıklar, listeler, alıntılar, bağlantılar, kod blokları
- Karakter sayacı
- YouTube'a direkt bağlantılar

**Organizasyon Sistemi**
- Canvas ve notlar için klasör yapısı
- Sınırsız klasör ve alt klasör
- Klasör ağacı navigasyonu
- Hızlı filtreler (Önemli, Tamamlanan)

**Tema Desteği**
- Dark Theme: Siyah arka plan, kırmızı vurgular
- Navy Theme: Lacivert arka plan, turuncu vurgular
- Light Theme: Krem arka plan, bordo vurgular

**Arama ve Filtreleme**
- Başlık, kanal ve not içeriklerinde gerçek zamanlı arama
- Durum filtreleme (İzlenmedi, İzleniyor, İzlendi)
- Klasör bazlı filtreleme

**Veri Yönetimi**
- SQLite veritabanı (better-sqlite3)
- Yerel depolama (bulut bağımlılığı yok)
- Gizlilik odaklı
- Canvas verilerinin güvenli saklanması

### Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Masaüstü | Electron 40.0.0 + electron-builder |
| Veritabanı | SQLite (better-sqlite3 12.6.2) |
| ORM | Prisma 7.3.0 (schema tanımı için) |
| Dil | TypeScript 5 |
| Stil | Tailwind CSS 4 |
| Canvas | @xyflow/react 12.10.0 (React Flow) |
| Editör (Not) | Tiptap 3.15.3 (StarterKit, Link, Placeholder, CharacterCount) |
| Editör (Markdown) | CodeMirror 4.25.4 (@uiw/react-codemirror) |
| Animasyon | Framer Motion 12.26.2 |
| İkonlar | Lucide React 0.562.0 |
| Tarih | date-fns 4.1.0 |
| PWA | @ducanh2912/next-pwa 10.2.9 |

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

### Kullanım

**Canvas Modu**
1. "+ New Canvas" ile yeni canvas oluşturun
2. Canvas Mode'a geçin
3. Araçları kullanın:
   - **Text Tool**: Hızlı metin kutusu ekle
   - **Markdown**: CodeMirror markdown editörü ekle
4. **Ctrl+S** ile manuel kaydetme yapın
5. **Export** ile canvas'ı JSON olarak dışa aktarın
6. **Import** ile kayıtlı canvas'ı içe aktarın

**Video Notları**
1. "+ Add New Video" butonuna tıklayın
2. YouTube URL yapıştırın
3. "Add Video" ile ekleyin
4. Video kartına tıklayın
5. Editör araç çubuğunu kullanın
6. Notlar otomatik kaydedilir

**Klasör Yönetimi**
1. Kenar çubuğunda "+ Add Folder" tıklayın
2. Klasör adı girin, Enter basın
3. Canvas veya notları klasörlere taşıyın

**Durum Yönetimi**
- Video kartının üzerine gelin
- Unwatched / Watching / Watched seçin
- Important (yıldız) ve Completed (işaret) işaretleyin

**Arama ve Tema**
- Kenar çubuğundaki arama kutusunu kullanın
- Tema menüsünden Dark, Navy veya Light seçin

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

**Veritabanı**
- SQLite veritabanı kullanır (better-sqlite3)
- Canvas verileri JSON string olarak saklanır
- Video notları ve klasörler ilişkisel tablolarda tutulur

### Katkıda Bulunma

1. Depoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit yapın (`git commit -m 'Yeni özellik'`)
4. Push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

### Lisans

MIT Lisansı - [LICENSE](LICENSE) dosyasına bakın.

---

<a id="english"></a>

## English

### Overview

TubeNotes is a modern visual knowledge management system for YouTube videos. Take video notes, visualize your ideas on infinite canvas, draw shapes, and add markdown notes. Available as desktop application (Windows, macOS, Linux).

### Key Features

**Canvas Mode (New!)**
- React Flow based infinite canvas
- Text boxes for quick notes
- CodeMirror markdown editor nodes
- Manual save (Ctrl+S) - data safety
- Canvas export/import (.json)
- Zoom and pan features

**YouTube Video Notes**
- Automatic video metadata fetching (title, channel, thumbnail)
- Tiptap rich text editor
- Bold, italic, underline, strikethrough text
- Headings, lists, blockquotes, links, code blocks
- Character counter
- Direct links to YouTube

**Organization System**
- Folder structure for canvas and notes
- Unlimited folders and subfolders
- Folder tree navigation
- Quick filters (Important, Completed)

**Theme Support**
- Dark Theme: Black background, red accents
- Navy Theme: Navy background, orange accents
- Light Theme: Cream background, burgundy accents

**Search & Filtering**
- Real-time search across titles, channels, and note content
- Status filtering (Unwatched, Watching, Watched)
- Folder-based filtering

**Data Management**
- SQLite database (better-sqlite3)
- Local storage (no cloud dependency)
- Privacy-focused
- Secure canvas data storage

### Technologies

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Desktop | Electron 40.0.0 + electron-builder |
| Database | SQLite (better-sqlite3 12.6.2) |
| ORM | Prisma 7.3.0 (schema definition) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Canvas | @xyflow/react 12.10.0 (React Flow) |
| Editor (Notes) | Tiptap 3.15.3 (StarterKit, Link, Placeholder, CharacterCount) |
| Editor (Markdown) | CodeMirror 4.25.4 (@uiw/react-codemirror) |
| Animation | Framer Motion 12.26.2 |
| Icons | Lucide React 0.562.0 |
| Date | date-fns 4.1.0 |
| PWA | @ducanh2912/next-pwa 10.2.9 |

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

### Usage

**Canvas Mode**
1. Create new canvas with "+ New Canvas"
2. Switch to Canvas Mode
3. Use tools:
   - **Text Tool**: Add quick text boxes
   - **Markdown**: Add CodeMirror markdown editor
4. **Ctrl+S** for manual save
5. **Export** canvas as JSON
6. **Import** saved canvas from JSON

**Video Notes**
1. Click "+ Add New Video" button
2. Paste YouTube URL
3. Click "Add Video"
4. Click on video card
5. Use editor toolbar
6. Notes auto-save

**Folder Management**
1. Click "+ Add Folder" in sidebar
2. Enter folder name, press Enter
3. Move canvas or notes to folders

**Status Management**
- Hover over video card
- Select Unwatched / Watching / Watched
- Toggle Important (star) and Completed (checkmark)

**Search and Theme**
- Use search box in sidebar
- Select Dark, Navy or Light from theme dropdown

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

**Database**
- Uses SQLite database (better-sqlite3)
- Canvas data stored as JSON strings
- Video notes and folders in relational tables

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push branch (`git push origin feature/new-feature`)
5. Open Pull Request

### License

MIT License - see [LICENSE](LICENSE) file.

---

<div align="center">
  <p>Made by <a href="https://github.com/orgofjs">orgofjs</a></p>
  <p>
    <a href="https://github.com/orgofjs/tubenotes/stargazers">Star</a> |
    <a href="https://github.com/orgofjs/tubenotes/issues">Report Bug</a> |
    <a href="https://github.com/orgofjs/tubenotes/issues">Request Feature</a>
  </p>
</div>
