# 🚀 Tool Modal System

Wereldklasse modal systeem voor tool visibility met premium UX en performance.

## 📋 Overzicht

Dit systeem biedt een elegante oplossing voor het tonen van tools in modals met:
- ✅ Full-screen modals op mobiel met slide-up animatie
- ✅ Centered modals op desktop met blur backdrop
- ✅ Swipe-down to close gesture (mobiel)
- ✅ ESC key, click outside, en back button support
- ✅ Lazy loading voor optimale performance
- ✅ Accessibility compliant (ARIA, focus trap)
- ✅ Smooth animations met framer-motion

## 🏗️ Architectuur

```
src/components/tools/
├── tool-modal.tsx              # Hoofdmodal component
├── tool-modal-header.tsx       # Header met back/close buttons
├── tool-registry.tsx           # Centralized tool mapping
├── index.ts                    # Export barrel
└── README.md                   # Deze file
```

## 🎯 Gebruik

### 1. Registreer je tool

Voeg je tool toe aan `tool-registry.tsx`:

```tsx
import { lazy } from 'react';

const MijnTool = lazy(() => import('@/components/mijn-tool'));

export const TOOL_REGISTRY = {
  '/mijn-tool': {
    component: MijnTool,
    title: 'Mijn Tool',
    subtitle: 'Beschrijving van mijn tool',
    supportsProgress: false,
    requiresAuth: true,
  },
  // ... andere tools
};
```

### 2. Gebruik in je component

```tsx
import { useState } from 'react';
import { ToolModal, ToolModalHeader, getToolMetadata, hasModalComponent } from '@/components/tools';

function MijnComponent() {
  const [activeModal, setActiveModal] = useState({
    isOpen: false,
    route: null,
    title: '',
    subtitle: '',
    component: null,
  });

  const handleToolClick = (route: string) => {
    if (hasModalComponent(route)) {
      const metadata = getToolMetadata(route);
      setActiveModal({
        isOpen: true,
        route,
        title: metadata.title,
        subtitle: metadata.subtitle,
        component: metadata.component,
      });
    }
  };

  const closeModal = () => {
    setActiveModal({
      isOpen: false,
      route: null,
      title: '',
      subtitle: '',
      component: null,
    });
  };

  return (
    <>
      <button onClick={() => handleToolClick('/mijn-tool')}>
        Open Tool
      </button>

      <ToolModal isOpen={activeModal.isOpen} onClose={closeModal}>
        <ToolModalHeader
          title={activeModal.title}
          subtitle={activeModal.subtitle}
          onBack={closeModal}
          onClose={closeModal}
        />
        <div className="flex-1 overflow-y-auto p-4">
          {activeModal.component && (
            <Suspense fallback={<LoadingSpinner />}>
              <activeModal.component onClose={closeModal} />
            </Suspense>
          )}
        </div>
      </ToolModal>
    </>
  );
}
```

## 🎨 Components

### ToolModal

Hoofdmodal component met responsive gedrag.

**Props:**
- `isOpen: boolean` - Modal open/closed state
- `onClose: () => void` - Close handler
- `children: ReactNode` - Modal content
- `className?: string` - Optional custom classes

**Features:**
- Mobile: Full-screen met slide-up animatie
- Desktop: Centered met backdrop blur
- Body scroll lock
- ESC key support
- Click outside to close
- Swipe-down gesture (mobiel)

### ToolModalHeader

Header component met navigation en progress.

**Props:**
- `title: string` - Modal title
- `subtitle?: string` - Optional subtitle
- `onBack: () => void` - Back button handler
- `onClose?: () => void` - Close button handler (desktop)
- `progress?: number` - Progress percentage (0-100)
- `currentStep?: number` - Current step number
- `totalSteps?: number` - Total steps
- `className?: string` - Optional custom classes

**Features:**
- Sticky positioning
- Back button (altijd)
- Close button (desktop only)
- Progress bar
- Step indicators (dots)

### Tool Registry

Centralized mapping van tools naar components.

**Functies:**
- `getToolMetadata(route)` - Haal tool metadata op
- `hasModalComponent(route)` - Check of route modal heeft
- `getAvailableToolRoutes()` - Lijst van beschikbare routes

## 🎭 Animations

### Mobile
```tsx
// Slide-up with spring
{
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: {
    type: 'spring',
    damping: 30,
    stiffness: 300
  }
}
```

### Desktop
```tsx
// Fade-in with scale
{
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
}
```

## ♿ Accessibility

- ✅ `role="dialog"` en `aria-modal="true"`
- ✅ Focus trap binnen modal
- ✅ ESC key om te sluiten
- ✅ `aria-labelledby` voor screen readers
- ✅ Keyboard navigation support

## 🔧 Customization

### Custom Styling

```tsx
<ToolModal
  isOpen={isOpen}
  onClose={onClose}
  className="custom-modal-class"
>
  {/* content */}
</ToolModal>
```

### Custom Loading State

```tsx
<Suspense
  fallback={
    <div className="custom-loading">
      <MyCustomSpinner />
      <p>Custom loading message</p>
    </div>
  }
>
  <ToolComponent />
</Suspense>
```

## 📱 Responsive Breakpoints

- **Mobile** (`< 768px`): Full-screen modal
- **Tablet** (`768px - 1024px`): Large modal (90vw)
- **Desktop** (`≥ 1024px`): Centered modal (max 1200px)

## ⚡ Performance

- **Lazy Loading**: Tools worden pas geladen wanneer nodig
- **Code Splitting**: Automatisch per tool component
- **Optimized Re-renders**: React.memo waar mogelijk
- **Smooth Animations**: 60fps met framer-motion

## 🐛 Debugging

### Tool wordt niet gevonden
```tsx
// Check of tool geregistreerd is
console.log(hasModalComponent('/mijn-tool'));
console.log(getToolMetadata('/mijn-tool'));
```

### Modal sluit niet
```tsx
// Check of onClose wordt aangeroepen
const closeModal = () => {
  console.log('Closing modal');
  setActiveModal({ ...defaultState });
};
```

### Animatie lagged
```tsx
// Reduceer damping/stiffness voor snellere animatie
transition: {
  type: 'spring',
  damping: 25,  // Lager = sneller
  stiffness: 350  // Hoger = sneller
}
```

## 🚀 Best Practices

1. **Altijd lazy load** tools voor optimale performance
2. **Gebruik Suspense** met loading fallback
3. **Implementeer onClose** in tool components
4. **Test op mobiel** voor gestures
5. **Valideer accessibility** met keyboard navigation

## 📚 Voorbeelden

Zie voor complete voorbeelden:
- `src/components/mobile/tabs/tools-tab-content.tsx`
- `src/app/profiel/page.tsx`

## 🎯 Roadmap

- [ ] Deep linking support via query params
- [ ] Haptic feedback voor mobile gestures
- [ ] Sound design voor animations
- [ ] Custom transition variants per tool
- [ ] Analytics tracking voor tool usage

---

**Gemaakt met ❤️ voor DatingAssistent**
