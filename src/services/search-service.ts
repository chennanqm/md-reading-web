import type { SearchHit, SearchSection } from '../features/reader/reader-types';
import {
  createSlugger,
  excerpt,
  isFenceLine,
  normalizeText,
  parseHeadingLine,
  stripMarkdownSyntax,
} from './markdown-service';

export function buildSearchSections(markdown: string) {
  const slugger = createSlugger();
  const sections: SearchSection[] = [];
  const lines = markdown.split(/\r?\n/);

  let currentHeading = '\u6587\u6863\u5f00\u5934';
  let currentLevel = 0;
  let currentId = 'document';
  let buffer: string[] = [];
  let inFence = false;

  function flush() {
    const text = buffer.join('\n').trim();
    sections.push({
      id: currentId,
      heading: currentHeading,
      level: currentLevel,
      text,
      snippet: excerpt(text),
    });
    buffer = [];
  }

  for (const line of lines) {
    if (isFenceLine(line)) {
      inFence = !inFence;
      buffer.push(stripMarkdownSyntax(line));
      continue;
    }

    const heading = inFence ? null : parseHeadingLine(line);
    if (heading) {
      flush();
      currentHeading = heading.text;
      currentLevel = heading.level;
      currentId = slugger(heading.text);
      continue;
    }

    buffer.push(stripMarkdownSyntax(line));
  }

  flush();
  return sections.filter((section) => section.text || section.id === 'document');
}

export function searchSections(sections: SearchSection[], query: string): SearchHit[] {
  const needle = normalizeText(query);
  if (!needle) {
    return [];
  }

  return sections
    .map((section, index) => {
      const haystack = normalizeText(`${section.heading} ${section.text}`);
      const score = haystack.includes(needle) ? 1 : 0;
      return {
        ...section,
        score,
        order: index,
      };
    })
    .filter((hit) => hit.score > 0)
    .slice(0, 20);
}
