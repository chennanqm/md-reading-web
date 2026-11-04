export type ThemeMode = 'light' | 'sepia' | 'dark';

export type ContentWidth = 'narrow' | 'medium' | 'wide';

export type ReaderSettings = {
  theme: ThemeMode;
  fontSize: number;
  lineHeight: number;
  contentWidth: ContentWidth;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type SearchSection = {
  id: string;
  heading: string;
  level: number;
  text: string;
  snippet: string;
};

export type SearchHit = SearchSection & {
  score: number;
};

export type DocumentProgress = {
  headingId: string;
  scrollY: number;
};

export type ImportedDocument = {
  id: string;
  name: string;
  path: string;
  content: string;
};
