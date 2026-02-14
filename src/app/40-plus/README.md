# 40-Plus Landing Page

## Overview
Wereldklasse landingspagina speciaal voor 40+ singles met focus op privacy, emotionele readiness, en respectvolle tone-of-voice.

## Image Requirements

The following images need to be created/sourced:

### Hero Section
- **File:** `/public/images/40plus-hero.jpg`
- **Dimensions:** 1200x900px (4:3 aspect ratio)
- **Content:** Professional 40+ couple enjoying quality time together
- **Style:** Warm, mature, authentic (not stock photo looking)
- **Mood:** Confident, hopeful, sophisticated
- **Important:** Should show diversity in age (40s-50s), not "perfectly polished" but real people

### OG Image (Social Sharing)
- **File:** `/public/images/quiz/40plus-readiness-og.jpg`
- **Dimensions:** 1200x630px (OG standard)
- **Content:** Same hero image with overlay text: "Ben Je Klaar Om Te Daten?"
- **Branding:** Include DatingAssistent logo

### Fallback
If images are not ready, the page will currently show:
- Hero: `/images/40plus-hero.jpg` (will show broken image or fallback)
- OG: `/images/quiz/40plus-readiness-og.jpg` (Facebook/Twitter will use fallback)
- Blog: Uses existing `/images/hero-dating.jpg.png` as fallback

## Routes

- **Main page:** `/40-plus`
- **Quiz:** `/quiz/emotionele-readiness-40plus`
- **Registration (tagged):** `/register?source=40plus&program=transformatie`

## Components Created

### New Components (40-plus specific)
1. `/src/components/landing/40plus/hero-mature.tsx` - Hero without video, larger fonts
2. `/src/components/landing/40plus/trust-builder.tsx` - Privacy-focused trust badges
3. `/src/components/landing/40plus/success-stories-40plus.tsx` - Age-matched testimonials
4. `/src/components/landing/40plus/simplified-journey.tsx` - Clear 3-step process

### Reused Components
- All UI components from `/src/components/ui/`
- Color system from `/src/styles/variables.css`
- User provider from `/src/providers/user-provider`

## SEO Configuration

### Target Keywords
- Primary: "daten na 40", "dating 40 plus", "daten na scheiding"
- Long-tail: "ben ik te oud om te daten", "hoe daten na 20 jaar huwelijk"

### Metadata
- **Title:** Daten na 40 - Begin Opnieuw Met Wijsheid | DatingAssistent
- **Description:** Speciaal voor 40-plussers: ontdek hoe je levenservaring je sterkste troef is
- **Canonical:** https://datingassistent.nl/40-plus

## Tracking & Analytics

All CTAs and registrations from this page are tagged with:
```javascript
{
  source: '40plus-landing',
  segment: '40-plus-singles',
  landingPage: '/40-plus'
}
```

This allows for:
- Conversion tracking by age segment
- Personalized email flows
- Age-appropriate content recommendations

## Testing Checklist

### Accessibility
- [ ] Font sizes minimum 18px (20px on mobile)
- [ ] Contrast ratio >7:1 for all text
- [ ] All interactive elements >44px tap targets
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatible

### Responsiveness
- [ ] Desktop (1920px, 1440px, 1024px)
- [ ] Tablet (768px)
- [ ] Mobile (375px, 414px)
- [ ] Sticky CTA bar on mobile
- [ ] All sections stack properly

### Functionality
- [ ] Hero CTA links to `/quiz/emotionele-readiness-40plus`
- [ ] Pricing CTAs include `?source=40plus&program=X`
- [ ] FAQ accordion expands/collapses
- [ ] Mobile menu opens/closes
- [ ] Blog section loads (or shows loading state)
- [ ] All internal links work

### Content
- [ ] No broken links
- [ ] All images load (or show placeholder)
- [ ] Copy is age-appropriate (no patronizing)
- [ ] Testimonials show diverse situations (divorced, widowed, never married)
- [ ] Privacy messaging is prominent

## Performance Targets

- **Lighthouse Score:** 90+ (all categories)
- **LCP:** <2.5s
- **FID:** <100ms
- **CLS:** <0.1
- **Total Page Size:** <500KB (without images)

## Future Enhancements

1. **A/B Testing:**
   - Hero headline variations
   - CTA button copy
   - Pricing card order

2. **Content:**
   - Real testimonials from 40+ users
   - Professional photography session
   - 40+ specific blog posts

3. **Functionality:**
   - Custom 40+ quiz questions (currently uses general quiz)
   - Age-filtered success stories API
   - Personalized email sequences

## Notes

- This page uses the same color palette as homepage-v4 ("Warm Vertrouwen")
- Early bird discount ends March 1, 2026
- Average member age is 42 years (mentioned in copy)
- Privacy is emphasized throughout (key concern for 40+ with careers/kids)
