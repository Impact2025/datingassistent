# Goals Onboarding Videos

Deze directory bevat de onboarding video's voor het doelen systeem.

## Benodigde Video Bestanden:

### `Doelen.mp4` ✅ **BESCHIKBAAR**
- **Doel:** Eerste kennismaking met het doelen systeem
- **Locatie:** `/videos/Doelen.mp4`
- **Gebruikt in:** Goals Onboarding Modal
- **Autoplay:** Ja, bij eerste bezoek aan Doelen sectie
- **Inhoud:** Welkom video voor doelen systeem

### `goals-onboarding-poster.jpg`
- **Doel:** Poster image voor de video player
- **Formaat:** 16:9 aspect ratio (bijv. 1280x720)
- **Inhoud:** Aantrekkelijke afbeelding met "Hoe werkt het Doelen Systeem?" tekst

## Technische Specificaties:

### Video:
- **Formaat:** MP4 (H.264) en WebM
- **Resolutie:** 1920x1080 (Full HD) of 1280x720 (HD)
- **Bitrate:** 2-5 Mbps
- **Audio:** AAC, 128kbps, Nederlands

### Poster Image:
- **Formaat:** JPG of PNG
- **Resolutie:** Minimaal 1280x720
- **Bestandsgrootte:** Max 500KB

## Implementatie Notities:

De video wordt automatisch afgespeeld wanneer een gebruiker voor het eerst de "Doelen" sectie opent. Na het bekijken wordt een localStorage flag gezet zodat de video niet opnieuw wordt getoond.

Component: `src/components/dashboard/goals-onboarding-modal.tsx`