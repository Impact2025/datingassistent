// Slide type definitions for interactive lesson content

export type SlideType = 'title' | 'content' | 'quote' | 'split' | 'image' | 'checklist';

export interface BaseSlide {
  type: SlideType;
  id?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface TitleSlide extends BaseSlide {
  type: 'title';
  title: string;
  subtitle?: string;
  emoji?: string;
}

export interface ContentSlide extends BaseSlide {
  type: 'content';
  title: string;
  content?: string; // Markdown supported
  bullets?: string[];
  emoji?: string;
  highlightColor?: string;
}

export interface QuoteSlide extends BaseSlide {
  type: 'quote';
  quote: string;
  author?: string;
  emoji?: string;
}

export interface SplitSlide extends BaseSlide {
  type: 'split';
  title: string;
  leftContent: string; // Markdown supported
  rightContent: string; // Can be markdown or image URL
  isRightImage?: boolean;
}

export interface ImageSlide extends BaseSlide {
  type: 'image';
  imageUrl: string;
  caption?: string;
  title?: string;
}

export interface ChecklistSlide extends BaseSlide {
  type: 'checklist';
  title: string;
  items: Array<{
    text: string;
    checked?: boolean;
  }>;
  emoji?: string;
}

export type Slide = TitleSlide | ContentSlide | QuoteSlide | SplitSlide | ImageSlide | ChecklistSlide;

export interface SlideDeck {
  title: string;
  slides: Slide[];
  lessonId?: number;
}
