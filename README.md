# TubeNotes - Visual Video Knowledge Base

<div align="center">
  
**[Türkçe](#türkçe)** | **[English](#english)**

</div>

---

> **TR:** Bu proje hem hobi hem ihtiyaç olarak AI ile geliştirilmektedir. Geliştirmeler devam edecektir.
>
> **EN:** This project is being developed with AI as both a hobby and a necessity. Development will continue.

---

<a id="türkçe"></a>

## Türkçe

### Genel Bakış

TubeNotes, YouTube videolarınız için modern bir bilgi yönetim sistemidir. Videolarınızı klasörlerde düzenleyin, zengin formatlı notlar alın ve içeriklerinizi etkili bir şekilde yönetin. Masaüstü (Windows, macOS, Linux) ve web uygulaması olarak kullanılabilir.

### Ana Özellikler

**YouTube Entegrasyonu**
- Otomatik video metadata çekme (başlık, kanal, thumbnail)
- YouTube videolarına direkt bağlantılar
- Thumbnail önizleme kartları

**Zengin Metin Editörü**
- Tiptap editör ile profesyonel not alma
- Kalın, italik, altı çizili, üstü çizili metin
- Başlıklar, listeler, alıntılar, bağlantılar, kod blokları
- Karakter sayacı
- Otomatik kaydetme (3 saniye)

**Organizasyon Sistemi**
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
- Yerel depolama (bulut bağımlılığı yok)
- JSON tabanlı yapı
- Gizlilik odaklı

### Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Masaüstü | Electron 40.0.0 + electron-builder |
| Dil | TypeScript 5 |
| Stil | Tailwind CSS 4 |
| Editör | Tiptap (StarterKit, Link, Placeholder, CharacterCount) |
| Animasyon | Framer Motion 12.26.2 |
| İkonlar | Lucide React |
| Tarih | date-fns |
| PWA | @ducanh2912/next-pwa |

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
git clone https://github.com/orgofjs/tubenotes.git
cd tubenotes

# Bağımlılıkları yükleyin
npm install

# Web için geliştirme sunucusu
npm run dev

# Masaüstü için geliştirme
npm run electron-dev

# Windows için derleme
npm run build-win

# macOS için derleme
npm run build-mac

# Linux için derleme
npm run build-linux
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Kullanım

**Video Ekleme**
1. "+ Add New Video" butonuna tıklayın
2. YouTube URL yapıştırın
3. "Add Video" ile ekleyin

**Klasör Oluşturma**
1. Kenar çubuğunda "+ Add Folder" tıklayın
2. Klasör adı girin, Enter basın

**Not Alma**
1. Video kartına tıklayın
2. Editör araç çubuğunu kullanın
3. Notlar otomatik kaydedilir

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
- Web: Browser localStorage
- Windows: `%APPDATA%/TubeNotes/data`
- macOS: `~/Library/Application Support/TubeNotes/data`
- Linux: `~/.config/TubeNotes/data`

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

TubeNotes is a modern knowledge management system for YouTube videos. Organize your videos in folders, take rich-formatted notes, and manage your content effectively. Available as desktop (Windows, macOS, Linux) and web application.

### Key Features

**YouTube Integration**
- Automatic video metadata fetching (title, channel, thumbnail)
- Direct links to YouTube videos
- Thumbnail preview cards

**Rich Text Editor**
- Professional note-taking with Tiptap editor
- Bold, italic, underline, strikethrough text
- Headings, lists, blockquotes, links, code blocks
- Character counter
- Auto-save (3 seconds)

**Organization System**
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
- Local storage (no cloud dependency)
- JSON-based structure
- Privacy-focused

### Technologies

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Desktop | Electron 40.0.0 + electron-builder |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Editor | Tiptap (StarterKit, Link, Placeholder, CharacterCount) |
| Animation | Framer Motion 12.26.2 |
| Icons | Lucide React |
| Date | date-fns |
| PWA | @ducanh2912/next-pwa |

### System Requirements

**Built Application**
- Windows 10+ (64-bit)
- macOS 10.13+
- Linux: Ubuntu 18.04+, Fedora 32+, Debian 10+
- RAM: 4GB (recommended 8GB)
- Disk: 500MB free space

**Development**
- Node.js 18.x+
- npm 9.x+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/orgofjs/tubenotes.git
cd tubenotes

# Install dependencies
npm install

# Development server for web
npm run dev

# Development for desktop
npm run electron-dev

# Build for Windows
npm run build-win

# Build for macOS
npm run build-mac

# Build for Linux
npm run build-linux
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

**Adding Videos**
1. Click "+ Add New Video" button
2. Paste YouTube URL
3. Click "Add Video"

**Creating Folders**
1. Click "+ Add Folder" in sidebar
2. Enter folder name, press Enter

**Taking Notes**
1. Click on video card
2. Use editor toolbar
3. Notes auto-save

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
- Web: Browser localStorage
- Windows: `%APPDATA%/TubeNotes/data`
- macOS: `~/Library/Application Support/TubeNotes/data`
- Linux: `~/.config/TubeNotes/data`

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
