'use client';

import { useState } from 'react';
import { CursussenGallery } from './cursussen-gallery';
import { CursusViewer } from './cursus-viewer';

export function CursussenTab() {
  const [selectedCursusSlug, setSelectedCursusSlug] = useState<string | null>(null);

  if (selectedCursusSlug) {
    return (
      <CursusViewer
        cursusSlug={selectedCursusSlug}
        onBack={() => setSelectedCursusSlug(null)}
      />
    );
  }

  return (
    <CursussenGallery
      onCursusSelect={(slug) => setSelectedCursusSlug(slug)}
    />
  );
}
