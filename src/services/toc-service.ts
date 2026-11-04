import type { TocItem } from '../features/reader/reader-types';
import { createSlugger, isFenceLine, parseHeadingLine } from './markdown-service';

export function extractToc(markdown: string): TocItem[] {
  const slugger = createSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (isFenceLine(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    const heading = parseHeadingLine(line);
    if (!heading) {
      continue;
    }

    items.push({
      id: slugger(heading.text),
      text: heading.text,
      level: heading.level,
    });
  }

  return items;
}
