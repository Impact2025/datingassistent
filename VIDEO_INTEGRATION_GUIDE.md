# Video Integration Guide voor DatingAssistent.nl

## 🎬 Overzicht

Deze gids beschrijft de beste manier om video's te integreren in de DatingAssistent applicatie, specifiek geoptimaliseerd voor Vercel deployment.

## 🔧 Technische Configuratie

### Vercel Headers (vercel.json)
```json
{
  "headers": [
    {
      "source": "/videos/:path*",
      "headers": [
        { "key": "Accept-Ranges", "value": "bytes" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/videos/:path*.mp4",
      "headers": [{ "key": "Content-Type", "value": "video/mp4" }]
    },
    {
      "source": "/videos/:path*.webm",
      "headers": [{ "key": "Content-Type", "value": "video/webm" }]
    }
  ]
}
```

### Next.js Configuratie (next.config.ts)
```typescript
export default {
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};
```

## 📁 Bestandsstructuur

```
public/
├── videos/
│   ├── README.md
│   ├── Doelen.mp4          # Goals onboarding video
│   ├── Welkom-dashboard.mp4 # Dashboard welcome video
│   └── Welkom-Iris.mp4     # Iris welcome video
└── uploads/
    └── videos/             # User-uploaded course videos
        ├── course_1_module_1_123456789.mp4
        └── ...
```

## 🎯 VideoPlayer Component

### Gebruik
```tsx
import { VideoPlayer } from '@/components/shared/video-player';

// Basis gebruik
<VideoPlayer
  src="/videos/Welkom-Iris.mp4"
  title="Welkomstvideo van Iris"
  className="aspect-video"
  controls={true}
  fallbackText="Video kon niet worden geladen"
/>

// Met error handling
<VideoPlayer
  src={videoUrl}
  onError={(error) => console.error('Video error:', error)}
  fallbackText="Probeer de pagina te vernieuwen"
/>
```

### Features
- ✅ Automatische error handling
- ✅ Loading states
- ✅ Retry functionaliteit
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)
- ✅ Multiple format support (MP4, WebM)
- ✅ Custom controls overlay

## 📤 Video Upload Systeem

### API Endpoint: `/api/admin/upload-video`

**Request:**
```typescript
POST /api/admin/upload-video
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

FormData:
- video: File (MP4/WebM)
- courseId: string
- moduleId: string
- title: string (optional)
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "/uploads/videos/course_1_module_1_123456789.mp4",
  "filename": "course_1_module_1_123456789.mp4",
  "size": 8710000,
  "type": "video/mp4"
}
```

### Upload Component
```tsx
import { VideoUpload } from '@/components/admin/video-upload';

<VideoUpload
  courseId="course-123"
  moduleId="module-456"
  currentVideoUrl={currentVideo}
  onUploadSuccess={(url) => setVideoUrl(url)}
/>
```

## 📊 Video Specificaties

### Technische Eisen
- **Formaten:** MP4 (H.264) of WebM (VP9)
- **Resolutie:** 1920x1080 (Full HD) of 1280x720 (HD)
- **Bitrate:** 2-5 Mbps voor web streaming
- **Audio:** AAC, 128kbps, Nederlands
- **Maximale grootte:** 100MB (Vercel limiet)

### Optimalisatie Tips
1. **Comprimeer voor web:** Gebruik HandBrake of FFmpeg
2. **Multiple formaten:** Bied MP4 en WebM aan voor betere browser support
3. **Lazy loading:** Laad videos pas wanneer ze in beeld komen
4. **Poster images:** Gebruik aantrekkelijke thumbnails

### FFmpeg Compressie Command
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output.mp4
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Videos zijn gecomprimeerd (< 10MB per bestand)
- [ ] MIME types correct ingesteld in Vercel
- [ ] Cache headers geconfigureerd
- [ ] Error handling geïmplementeerd
- [ ] Fallback content beschikbaar

### Post-deployment
- [ ] Test video playback op verschillende devices
- [ ] Controleer console voor errors
- [ ] Valideer dat videos niet de build limiet overschrijden
- [ ] Test slow 3G verbindingen

## 🔍 Troubleshooting

### Video wordt niet getoond
1. **Controleer browser console** voor CORS/network errors
2. **Valideer video URL** - moet beginnen met `/videos/` of `/uploads/videos/`
3. **Check Vercel headers** - Accept-Ranges en Cache-Control moeten ingesteld zijn
4. **Test directe URL** - ga naar `yoursite.com/videos/filename.mp4`

### Video laadt langzaam
1. **Comprimeer video** - doel: < 5MB voor snelle loading
2. **Gebruik preload="metadata"** - laadt alleen metadata eerst
3. **Implementeer lazy loading** - laad pas bij hover/click

### CORS Errors
1. **Zorg voor juiste headers** in vercel.json
2. **Gebruik relatieve URLs** - `/videos/filename.mp4` in plaats van absolute URLs
3. **Controleer Vercel deployment** - soms moet je redeployen na header changes

## 📈 Prestatie Optimalisaties

### Code Splitting
```tsx
const VideoPlayer = dynamic(
  () => import('@/components/shared/video-player'),
  { ssr: false, loading: () => <div>Loading video...</div> }
);
```

### Lazy Loading
```tsx
import { useState, useRef, useEffect } from 'react';

function LazyVideo({ src, ...props }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isInView && <VideoPlayer src={src} {...props} />}
    </div>
  );
}
```

## 🔒 Beveiliging

### Content Protection
- Gebruik `controlsList="nodownload"` om download te beperken
- Implementeer token-based access voor premium content
- Overweeg DRM voor gevoelige content

### Upload Security
- Valideer file types server-side
- Controleer bestandsgrootte limieten
- Sanitize filenames
- Gebruik authentication voor upload endpoints

## 📚 Gerelateerde Documenten

- [Vercel Static Assets Guide](https://vercel.com/docs/concepts/projects/project-configuration#static-files)
- [Web Video Best Practices](https://web.dev/articles/video)
- [Video SEO Guide](https://developers.google.com/search/docs/appearance/video)

---

**Laatste update:** November 2024
**Auteur:** Kilo Code
**Versie:** 1.0