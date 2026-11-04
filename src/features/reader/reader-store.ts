import type { ReaderSettings } from './reader-types';

export const storageKeys = {
  settings: 'md-reader:settings:v1',
  progress: 'md-reader:progress:v1',
} as const;

export const defaultReaderSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  lineHeight: 1.8,
  contentWidth: 'medium',
};
