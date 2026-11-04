import { storageKeys } from '../features/reader/reader-store';
import type { DocumentProgress } from '../features/reader/reader-types';
import { readStoredValue, writeStoredValue } from './storage-service';

type DocumentProgressMap = Record<string, DocumentProgress>;

export function createDocumentKey(fileName: string | null, markdown: string) {
  const seed = `${fileName ?? 'untitled'}::${markdown}`;
  return `doc:${hashString(seed)}`;
}

export function readDocumentProgress(key: string) {
  const allProgress = readStoredValue<DocumentProgressMap>(storageKeys.progress, {});
  return allProgress[key] ?? null;
}

export function writeDocumentProgress(key: string, progress: DocumentProgress) {
  const allProgress = readStoredValue<DocumentProgressMap>(storageKeys.progress, {});
  writeStoredValue(storageKeys.progress, {
    ...allProgress,
    [key]: progress,
  });
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
