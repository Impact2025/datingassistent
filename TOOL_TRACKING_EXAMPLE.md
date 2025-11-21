# 🎯 Tool Tracking Implementatie Guide

## Hoe Tracking Toevoegen aan Bestaande Tools

Deze guide laat zien hoe je de nieuwe coaching tracker hook gebruikt in je tool components.

---

## 📦 De Hook: `useCoachingTracker`

Deze hook doet automatisch:
- ✅ Track wanneer user tool bekijkt
- ✅ Detect first-time usage
- ✅ Detect onboarding context
- ✅ Update coaching profile
- ✅ Trigger Google Analytics events

---

## 🚀 Quick Implementation

### Basis Gebruik (Meest Simpel)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

function ProfielCoachTab() {
  // That's it! Auto-tracks view on mount
  const { isFirstTime, isFromOnboarding } = useCoachingTracker('profiel-coach');

  return (
    <div>
      {isFirstTime && <WelcomeBanner />}
      {/* Rest van je component */}
    </div>
  );
}
```

### Met Complete Tracking

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

function ProfielCoachTab() {
  const {
    trackToolView,        // Manually track view
    trackToolComplete,    // Track when user completes action
    trackCustomEvent,     // Track custom events
    isTracking,          // Loading state
    isFirstTime,         // First time using this tool
    isFromOnboarding     // Came from coach advice
  } = useCoachingTracker('profiel-coach', {
    autoTrackView: true,  // Auto-track on mount (default: true)
    debug: true,          // Show console logs (default: dev mode)
    onTrackSuccess: (event) => {
      console.log('Tracked:', event);
    },
    onTrackError: (error) => {
      console.error('Tracking failed:', error);
    }
  });

  const handleAnalyze = async () => {
    // Your existing logic
    const result = await analyzeProfile();

    // Track that user completed the action
    await trackToolComplete();
  };

  const handleCustomAction = async () => {
    // Track custom event with data
    await trackCustomEvent('bio_generated', {
      bioLength: 250,
      tone: 'professional'
    });
  };

  return (
    <div>
      {isFromOnboarding && (
        <Alert>
          <Sparkles className="w-4 h-4" />
          Welkom! Laten we je profiel optimaliseren.
        </Alert>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={isTracking}
      >
        {isTracking ? 'Bezig...' : 'Analyseer Profiel'}
      </Button>
    </div>
  );
}
```

---

## 📋 Implementatie Per Tool

### 1. Profiel Coach (`profiel-coach-tab.tsx`)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

export function ProfielCoachTab({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { trackToolComplete, isFirstTime } = useCoachingTracker('profiel-coach');

  const handleBioGenerate = async () => {
    // Existing bio generation logic...
    const bio = await generateBio();

    // Track completion
    await trackToolComplete();
  };

  return (
    <div className="space-y-6">
      {isFirstTime && (
        <Alert className="border-primary">
          <Lightbulb className="w-4 h-4" />
          <AlertTitle>Je eerste keer in Profiel Coach!</AlertTitle>
          <AlertDescription>
            We gaan je helpen een authentiek profiel te maken dat bij je past.
          </AlertDescription>
        </Alert>
      )}

      {/* Rest of existing component */}
    </div>
  );
}
```

### 2. Foto Advies (`foto-advies-tab.tsx`)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

export function FotoAdviesTab() {
  const { trackCustomEvent, isFromOnboarding } = useCoachingTracker('foto-advies');

  const handlePhotoAnalyze = async (photoUrl: string) => {
    const analysis = await analyzePhoto(photoUrl);

    // Track with details
    await trackCustomEvent('photo_analyzed', {
      score: analysis.score,
      recommendations: analysis.recommendations.length
    });
  };

  return (
    <div>
      {isFromOnboarding && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm">
              💡 <strong>Tip van je coach:</strong> Upload je beste foto eerst!
            </p>
          </CardContent>
        </Card>
      )}
      {/* Existing component */}
    </div>
  );
}
```

### 3. Chat Coach (`chat-coach-tab.tsx`)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

export function ChatCoachTab() {
  const { trackCustomEvent, trackToolComplete } = useCoachingTracker('chat-coach');

  const handleSendMessage = async (message: string) => {
    const response = await getChatResponse(message);

    // Track conversation
    await trackCustomEvent('chat_message_sent', {
      messageLength: message.length,
      conversationType: 'practice'
    });
  };

  const handleConversationComplete = async () => {
    // Track when user finishes practice session
    await trackToolComplete();
  };

  return (
    <div>
      {/* Existing chat component */}
      <Button onClick={handleConversationComplete}>
        Sessie Afronden
      </Button>
    </div>
  );
}
```

### 4. Gesprek Starters (`gesprek-starter-tab.tsx`)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

export function GesprekStarterTab() {
  const { trackCustomEvent } = useCoachingTracker('gesprek-starter');

  const handleGenerateStarter = async () => {
    const starter = await generateStarter();

    await trackCustomEvent('starter_generated', {
      starterType: starter.type,
      saved: false
    });
  };

  const handleSaveStarter = async (starter: string) => {
    await saveStarter(starter);

    await trackCustomEvent('starter_saved', {
      starterLength: starter.length
    });
  };

  return <div>{/* Existing component */}</div>;
}
```

### 5. Date Planner (`date-planner-tab.tsx`)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

export function DatePlannerTab() {
  const { trackCustomEvent, trackToolComplete } = useCoachingTracker('date-planner');

  const handlePlanDate = async (preferences: any) => {
    const plan = await generateDatePlan(preferences);

    await trackCustomEvent('date_planned', {
      location: plan.location,
      budget: plan.budget,
      activities: plan.activities.length
    });
  };

  const handleBookDate = async () => {
    // User actually books the date
    await trackToolComplete();
  };

  return <div>{/* Existing component */}</div>;
}
```

### 6. Online Cursus (`online-cursus-tab.tsx`)

```typescript
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';

export function OnlineCursusTab() {
  const { trackCustomEvent } = useCoachingTracker('online-cursus');

  const handleStartModule = async (moduleId: number) => {
    await trackCustomEvent('module_started', {
      moduleId,
      moduleName: module.name
    });
  };

  const handleCompleteModule = async (moduleId: number) => {
    await trackCustomEvent('module_completed', {
      moduleId,
      timeSpent: calculateTimeSpent()
    });
  };

  return <div>{/* Existing component */}</div>;
}
```

---

## 🎨 Onboarding Overlay (Optional)

Voor een nog betere UX, gebruik `useToolOnboarding`:

```typescript
import { useCoachingTracker, useToolOnboarding } from '@/hooks/use-coaching-tracker';

function ProfielCoachTab() {
  useCoachingTracker('profiel-coach');

  const {
    shouldShowOnboarding,
    markOnboardingSeen
  } = useToolOnboarding('profiel-coach');

  return (
    <div>
      {shouldShowOnboarding && (
        <Dialog open={shouldShowOnboarding} onOpenChange={markOnboardingSeen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welkom bij Profiel Coach!</DialogTitle>
              <DialogDescription>
                Hier zijn 3 snelle tips om het meeste uit deze tool te halen...
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p>Wees eerlijk over je sterke punten</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p>Upload een recente foto</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p>Test verschillende bio's</p>
              </div>
            </div>
            <Button onClick={markOnboardingSeen}>
              Begrepen, laten we beginnen!
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Rest of component */}
    </div>
  );
}
```

---

## 📊 Analytics Events

De hook tracked automatisch deze events naar Google Analytics (als geconfigureerd):

### Auto Events
- `coaching_view` - User bekijkt tool
- `coaching_complete` - User completeert actie
- `coaching_custom` - Custom event

### Event Properties
```javascript
{
  tool_name: 'profiel-coach',
  event_name: 'bio_generated',
  user_id: 87,
  is_first_time: true,
  is_from_onboarding: true,
  // + custom data
}
```

### In Google Analytics Dashboard

Je ziet:
```
Event: coaching_view
Tool: profiel-coach
First Time Users: 45%
From Onboarding: 62%
```

---

## 🔄 Update Next Action

De hook update automatisch het coaching profile:

```typescript
// In de API route (already implemented):
POST /api/coaching-profile/track-tool

Body: {
  toolName: 'profiel-coach',
  eventType: 'view',
  timestamp: '2025-11-16T...'
}

Effect:
- tools_used['profiel-coach'] increments
- last_active_at updates
- current_streak may update
- next_action may change (via logic)
```

---

## 🎯 Best Practices

### DO ✅

```typescript
// Track meaningful completions
const handleProfileSaved = async () => {
  await saveProfile();
  await trackToolComplete(); // User actually did something
};

// Track with context
await trackCustomEvent('bio_generated', {
  bioLength: bio.length,
  generationMethod: 'ai',
  tone: selectedTone
});

// Show first-time guidance
{isFirstTime && <QuickTipsCard />}
```

### DON'T ❌

```typescript
// Don't track every tiny action
onChange={() => trackCustomEvent('input_changed')} // Too much!

// Don't track without user action
useEffect(() => {
  trackToolComplete(); // User didn't do anything!
}, []);

// Don't ignore isTracking state
<Button onClick={trackToolComplete}>
  Save // Missing disabled={isTracking}
</Button>
```

---

## 🧪 Testing

### Test Auto-Tracking

```javascript
// Open tool directly
http://localhost:9000/dashboard?tab=profiel-coach

// Check console (in debug mode):
// 🎯 [profiel-coach] Context: { isFirstTime: false, isFromOnboarding: false }
// ✅ [profiel-coach] Tracked view: tool usage
```

### Test Onboarding Context

```javascript
// Navigate from coach advice (already implemented)
http://localhost:9000/dashboard?tab=profiel-coach&onboarding=true&firstTime=true

// Check console:
// 🎯 [profiel-coach] Context: { isFirstTime: true, isFromOnboarding: true }
```

### Test Profile Updates

```javascript
// After using tool, check profile:
const token = localStorage.getItem('datespark_auth_token');
const res = await fetch('/api/coaching-profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profile = await res.json();
console.log('Tools used:', profile.toolsUsed);
// { "profiel-coach": 2, "foto-advies": 1 }
```

---

## 📈 Rollout Plan

### Phase 1: Core Tools (Deze Week)
- [ ] profiel-coach-tab.tsx
- [ ] foto-advies-tab.tsx
- [ ] chat-coach-tab.tsx

### Phase 2: Extended Tools (Volgende Week)
- [ ] gesprek-starter-tab.tsx
- [ ] date-planner-tab.tsx
- [ ] online-cursus-tab.tsx

### Phase 3: Onboarding Overlays (Sprint 2)
- [ ] Create overlay components
- [ ] Add to all tools
- [ ] A/B test with/without

---

## ✅ Implementation Checklist

Voor elk tool component:

- [ ] Import `useCoachingTracker`
- [ ] Call hook with tool name
- [ ] Use `isFirstTime` voor first-time UX
- [ ] Use `isFromOnboarding` voor coach context
- [ ] Track completions with `trackToolComplete`
- [ ] Track custom events waar relevant
- [ ] Test in browser console
- [ ] Verify profile updates

---

## 💡 Pro Tips

1. **Use Descriptive Event Names**
   ```typescript
   trackCustomEvent('bio_generated') // Good
   trackCustomEvent('action')        // Bad
   ```

2. **Include Useful Data**
   ```typescript
   trackCustomEvent('date_planned', {
     budget: 'medium',
     activities: 3,
     location_type: 'outdoor'
   }); // Analytics goldmine!
   ```

3. **Don't Over-Track**
   - Track actions, not interactions
   - Track completions, not attempts
   - Track value, not noise

4. **Use Loading States**
   ```typescript
   <Button disabled={isTracking}>
     {isTracking ? 'Bezig...' : 'Opslaan'}
   </Button>
   ```

---

## 🚀 Ready to Implement?

1. Copy the hook to your project ✅ (Already done!)
2. Pick a tool to start with
3. Add 3 lines of code
4. Test it works
5. Repeat for other tools

**Start met profiel-coach-tab.tsx - het is het meest gebruikt!**

---

**Questions?** Check de hook source code - het heeft uitgebreide JSDoc comments!
