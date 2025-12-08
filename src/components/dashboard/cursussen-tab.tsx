'use client';

import { useState } from 'react';
import { CursussenGallery } from './cursussen-gallery';
import { CursusViewer } from './cursus-viewer';
import { LessonViewer } from './lesson-viewer';

type ViewState =
  | { type: 'gallery' }
  | { type: 'cursus'; slug: string }
  | { type: 'lesson'; cursusSlug: string; lessonSlug: string };

export function CursussenTab() {
  const [viewState, setViewState] = useState<ViewState>({ type: 'gallery' });

  // Gallery view
  if (viewState.type === 'gallery') {
    return (
      <CursussenGallery
        onCursusSelect={(slug) => setViewState({ type: 'cursus', slug })}
      />
    );
  }

  // Course overview view
  if (viewState.type === 'cursus') {
    return (
      <CursusViewer
        cursusSlug={viewState.slug}
        onBack={() => setViewState({ type: 'gallery' })}
        onLessonSelect={(lessonSlug) =>
          setViewState({ type: 'lesson', cursusSlug: viewState.slug, lessonSlug })
        }
      />
    );
  }

  // Lesson view
  return (
    <LessonViewer
      cursusSlug={viewState.cursusSlug}
      lessonSlug={viewState.lessonSlug}
      onBack={() => setViewState({ type: 'cursus', slug: viewState.cursusSlug })}
    />
  );
}
