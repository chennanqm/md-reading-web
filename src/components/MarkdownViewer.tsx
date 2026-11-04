import { createElement, useEffect, type ReactNode, type RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { TocItem } from '../features/reader/reader-types';
import { createSlugger, highlightNode, toPlainText } from '../services/markdown-service';

type MarkdownViewerProps = {
  markdown: string;
  searchQuery: string;
  viewerRef: RefObject<HTMLDivElement | null>;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  onHeadingRegister: (id: string, element: HTMLElement | null) => void;
  onTocChange: (items: TocItem[]) => void;
  onHeadingVisible: (id: string) => void;
};

export function MarkdownViewer({
  markdown,
  searchQuery,
  viewerRef,
  scrollRootRef,
  onHeadingRegister,
  onTocChange,
  onHeadingVisible,
}: MarkdownViewerProps) {
  const slugger = createSlugger();

  useEffect(() => {
    const root = viewerRef.current;
    const scrollRoot = scrollRootRef.current;
    if (!root) {
      return;
    }

    const headings = Array.from(root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'));
    onTocChange(
      headings.map((heading) => ({
        id: heading.id,
        text: heading.textContent?.trim() || '未命名章节',
        level: Number(heading.tagName.slice(1)),
      })),
    );

    if (!headings.length) {
      onHeadingVisible('document');
      return;
    }

    let currentId = headings[0]?.id ?? 'document';
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) {
          return;
        }

        const best = visible
          .map((entry) => entry.target as HTMLElement)
          .sort((left, right) => left.getBoundingClientRect().top - right.getBoundingClientRect().top)[0];

        if (best?.id && best.id !== currentId) {
          currentId = best.id;
          onHeadingVisible(best.id);
        }
      },
      {
        root: scrollRoot,
        threshold: [0, 0.2, 0.5, 1],
        rootMargin: '-12% 0px -72% 0px',
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    onHeadingVisible(currentId);
    return () => observer.disconnect();
  }, [markdown, onHeadingVisible, onTocChange, scrollRootRef, viewerRef]);

  return (
    <article className="markdown-shell" ref={viewerRef} id="document">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: HeadingComponent(1, slugger, searchQuery, onHeadingRegister),
          h2: HeadingComponent(2, slugger, searchQuery, onHeadingRegister),
          h3: HeadingComponent(3, slugger, searchQuery, onHeadingRegister),
          h4: HeadingComponent(4, slugger, searchQuery, onHeadingRegister),
          h5: HeadingComponent(5, slugger, searchQuery, onHeadingRegister),
          h6: HeadingComponent(6, slugger, searchQuery, onHeadingRegister),
          p: TextBlockComponent('p', searchQuery),
          li: TextBlockComponent('li', searchQuery),
          blockquote: TextBlockComponent('blockquote', searchQuery),
          td: TextBlockComponent('td', searchQuery),
          th: TextBlockComponent('th', searchQuery),
          a: LinkComponent(searchQuery),
          img: ImageComponent,
          code: CodeComponent,
          pre: PreComponent,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}

function HeadingComponent(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  slugger: (value: string) => string,
  searchQuery: string,
  onHeadingRegister: (id: string, element: HTMLElement | null) => void,
) {
  return function Heading({ children }: { children?: ReactNode }) {
    const text = toPlainText(children);
    const id = slugger(text);
    const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][level - 1] as
      | 'h1'
      | 'h2'
      | 'h3'
      | 'h4'
      | 'h5'
      | 'h6';

    return createElement(
      tag,
      {
        id,
        ref: (element: HTMLElement | null) => onHeadingRegister(id, element),
      },
      highlightNode(children ?? text, searchQuery),
    );
  };
}

function TextBlockComponent(
  tag: 'p' | 'li' | 'blockquote' | 'td' | 'th',
  searchQuery: string,
) {
  return function TextBlock({ children }: { children?: ReactNode }) {
    return createElement(tag, undefined, highlightNode(children ?? null, searchQuery));
  };
}

function LinkComponent(searchQuery: string) {
  return function Link({ href, children }: { href?: string; children?: ReactNode }) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {highlightNode(children ?? null, searchQuery)}
      </a>
    );
  };
}

function ImageComponent({ src, alt }: { src?: string; alt?: string }) {
  return <img src={src} alt={alt} loading="lazy" />;
}

function CodeComponent({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  if (inline) {
    return <code className={className}>{children}</code>;
  }

  return <code className={className}>{children}</code>;
}

function PreComponent({ children }: { children?: ReactNode }) {
  const text = toPlainText(children);

  async function copy() {
    if (!text.trim()) {
      return;
    }

    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="code-block">
      <button type="button" className="code-block__copy" onClick={() => void copy()}>
        {"\u590d\u5236"}
      </button>
      <pre>{children}</pre>
    </div>
  );
}
