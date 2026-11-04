import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { FloatingActions } from '../components/FloatingActions';
import { MarkdownViewer } from '../components/MarkdownViewer';
import { SearchPanel } from '../components/SearchPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { TOCSidebar } from '../components/TOCSidebar';
import { TopBar } from '../components/TopBar';
import { useLocalStorageState } from '../features/reader/reader-hooks';
import { defaultReaderSettings, storageKeys } from '../features/reader/reader-store';
import type { ImportedDocument, ReaderSettings, TocItem } from '../features/reader/reader-types';
import { readDocumentProgress, writeDocumentProgress } from '../services/document-progress-service';
import { createTextDocument, readMarkdownFiles } from '../services/file-service';
import { buildSearchSections, searchSections } from '../services/search-service';
import { extractToc } from '../services/toc-service';

const sampleMarkdown = `# Markdown 阅读器

这是首版示例文档。

## 目录

- 上传文件
- 自动生成目录
- 搜索文档

## 代码块

\`\`\`ts
const message = 'Hello Markdown';
console.log(message);
\`\`\`

## 表格

| 功能 | 状态 |
| --- | --- |
| 上传 | 就绪 |
| 阅读 | 就绪 |
`;

export function App() {
  const [documents, setDocuments] = useState<ImportedDocument[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renderedToc, setRenderedToc] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState('document');
  const [activeHitIndex, setActiveHitIndex] = useState(0);
  const [mobilePanel, setMobilePanel] = useState<'toc' | 'settings' | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [settings, setSettings] = useLocalStorageState<ReaderSettings>(
    storageKeys.settings,
    defaultReaderSettings,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerPaneRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const activeHeadingRef = useRef(activeHeadingId);
  const headingElementsRef = useRef<Record<string, HTMLElement | null>>({});

  const currentDocument = useMemo(
    () => documents.find((item) => item.id === currentDocumentId) ?? null,
    [currentDocumentId, documents],
  );
  const markdown = currentDocument?.content ?? '';
  const fileName = currentDocument?.name ?? null;
  const hasDocument = currentDocument !== null;
  const documentKey = currentDocument?.path ?? null;
  const parsedToc = useMemo(() => extractToc(markdown), [markdown]);
  const toc = renderedToc.length ? renderedToc : parsedToc;
  const searchIndex = useMemo(() => buildSearchSections(markdown), [markdown]);
  const searchHits = useMemo(() => searchSections(searchIndex, searchQuery), [searchIndex, searchQuery]);
  const documentOptions = useMemo(
    () =>
      documents.map((item) => ({
        id: item.id,
        label: item.path,
      })),
    [documents],
  );
  const activeSectionIndex = useMemo(
    () => Math.max(0, toc.findIndex((item) => item.id === activeHeadingId)),
    [activeHeadingId, toc],
  );
  const activeSectionLabel = toc[activeSectionIndex]?.text ?? (hasDocument ? '阅读中...' : '待导入');
  const progressValue = hasDocument && toc.length ? Math.round(((activeSectionIndex + 1) / toc.length) * 100) : 0;
  const progressText = hasDocument ? `${activeSectionIndex + 1}/${Math.max(toc.length, 1)}` : '0/0';
  const readerWide = leftCollapsed || rightCollapsed;
  const readerFull = leftCollapsed && rightCollapsed;

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.setProperty('--reader-font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--reader-line-height', `${settings.lineHeight}`);

    const widthMap = {
      narrow: '680px',
      medium: '840px',
      wide: '980px',
    } as const;

    document.documentElement.style.setProperty('--reader-content-width', widthMap[settings.contentWidth]);
  }, [settings]);

  useEffect(() => {
    activeHeadingRef.current = activeHeadingId;
  }, [activeHeadingId]);

  useEffect(() => {
    if (!searchHits.length) {
      setActiveHitIndex(0);
      return;
    }

    setActiveHitIndex((current) => Math.min(current, searchHits.length - 1));
  }, [searchHits]);

  useEffect(() => {
    if (!toc.length && hasDocument) {
      setActiveHeadingId('document');
      return;
    }

    if (toc.length && !toc.some((item) => item.id === activeHeadingId)) {
      setActiveHeadingId(toc[0]?.id ?? 'document');
    }
  }, [activeHeadingId, hasDocument, toc]);

  const handleRenderedTocChange = useCallback((items: TocItem[]) => {
    setRenderedToc((current) => {
      if (areTocItemsEqual(current, items)) {
        return current;
      }

      return items;
    });
  }, []);

  useEffect(() => {
    if (!documentKey || !readerPaneRef.current) {
      return;
    }

    const saved = readDocumentProgress(documentKey);
    const frame = window.requestAnimationFrame(() => {
      if (!saved || !readerPaneRef.current) {
        return;
      }

      readerPaneRef.current.scrollTo({ top: saved.scrollY, behavior: 'auto' });
      setActiveHeadingId(saved.headingId || 'document');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [documentKey]);

  useEffect(() => {
    if (!documentKey || !readerPaneRef.current) {
      return;
    }

    let timer = 0;
    const root = readerPaneRef.current;
    const saveProgress = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        writeDocumentProgress(documentKey, {
          headingId: activeHeadingRef.current,
          scrollY: root.scrollTop,
        });
      }, 120);
    };

    root.addEventListener('scroll', saveProgress, { passive: true });
    window.addEventListener('beforeunload', saveProgress);

    return () => {
      window.clearTimeout(timer);
      root.removeEventListener('scroll', saveProgress);
      window.removeEventListener('beforeunload', saveProgress);
    };
  }, [documentKey]);

  async function handleFiles(files: File[]) {
    const nextDocuments = await readMarkdownFiles(files);
    setDocuments(nextDocuments);
    setCurrentDocumentId(nextDocuments[0]?.id ?? null);
    setSearchQuery('');
    setRenderedToc([]);
    setActiveHitIndex(0);
    setActiveHeadingId('document');
    setMobilePanel(null);
    headingElementsRef.current = {};
    readerPaneRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleLoadText(text: string) {
    const document = createTextDocument(text);
    setDocuments([document]);
    setCurrentDocumentId(document.id);
    setSearchQuery('');
    setRenderedToc([]);
    setActiveHitIndex(0);
    setActiveHeadingId('document');
    setMobilePanel(null);
    headingElementsRef.current = {};
    readerPaneRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleOpenPicker() {
    fileInputRef.current?.click();
  }

  function handleDocumentChange(id: string) {
    if (id === currentDocumentId) {
      return;
    }

    setCurrentDocumentId(id);
    setRenderedToc([]);
    setActiveHitIndex(0);
    setActiveHeadingId('document');
    headingElementsRef.current = {};
    readerPaneRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleSelectHit(index: number) {
    const hit = searchHits[index];
    if (!hit) {
      return;
    }

    setActiveHitIndex(index);
    scrollToHeading(hit.id, readerPaneRef.current, headingElementsRef.current);
    setActiveHeadingId(hit.id);
    setMobilePanel(null);
  }

  function handlePrevHit() {
    if (!searchHits.length) {
      return;
    }

    const nextIndex = (activeHitIndex - 1 + searchHits.length) % searchHits.length;
    handleSelectHit(nextIndex);
  }

  function handleNextHit() {
    if (!searchHits.length) {
      return;
    }

    const nextIndex = (activeHitIndex + 1) % searchHits.length;
    handleSelectHit(nextIndex);
  }

  function handleScrollTop() {
    readerPaneRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReset() {
    setDocuments([]);
    setCurrentDocumentId(null);
    setSearchQuery('');
    setRenderedToc([]);
    setActiveHitIndex(0);
    setActiveHeadingId('document');
    setMobilePanel(null);
    setLeftCollapsed(false);
    setRightCollapsed(false);
    setSettings(defaultReaderSettings);
    headingElementsRef.current = {};
    readerPaneRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }

  function handleThemeToggle() {
    const order: ReaderSettings['theme'][] = ['light', 'sepia', 'dark'];
    const currentIndex = order.indexOf(settings.theme);
    const nextTheme = order[(currentIndex + 1) % order.length];
    setSettings({ ...settings, theme: nextTheme });
  }

  function handleTocVisibilityToggle() {
    if (window.innerWidth <= 1180) {
      setMobilePanel((current) => (current === 'toc' ? null : 'toc'));
      return;
    }

    setLeftCollapsed((current) => !current);
  }

  function handleSettingsVisibilityToggle() {
    if (window.innerWidth <= 1180) {
      setMobilePanel((current) => (current === 'settings' ? null : 'settings'));
      return;
    }

    setRightCollapsed((current) => !current);
  }

  return (
    <div className="app-shell">
      <TopBar
        fileName={fileName}
        activeSection={activeSectionLabel}
        progressText={progressText}
        progressValue={progressValue}
        searchQuery={searchQuery}
        searchMatches={searchHits.length}
        documentOptions={documentOptions}
        currentDocumentId={currentDocumentId}
        onDocumentChange={handleDocumentChange}
        onSearchQueryChange={setSearchQuery}
        onUploadClick={handleOpenPicker}
        onToggleToc={handleTocVisibilityToggle}
        onToggleSettings={handleSettingsVisibilityToggle}
        onToggleTheme={handleThemeToggle}
        onResetDocument={handleReset}
        tocVisible={!leftCollapsed}
        settingsVisible={!rightCollapsed}
        hasDocument={hasDocument}
      />

      <div
        className={`workspace ${hasDocument ? 'workspace--ready' : 'workspace--empty'} ${
          leftCollapsed ? 'workspace--left-hidden' : ''
        } ${
          rightCollapsed ? 'workspace--right-hidden' : ''
        } ${readerWide ? 'workspace--reader-wide' : ''} ${readerFull ? 'workspace--reader-full' : ''}`}
      >
        {hasDocument ? (
          <>
            {!leftCollapsed ? (
              <TOCSidebar
                items={toc}
                activeId={activeHeadingId}
                onSelect={(id) => {
                  scrollToHeading(id, readerPaneRef.current, headingElementsRef.current);
                  setActiveHeadingId(id);
                  setMobilePanel(null);
                }}
              />
            ) : null}

            <main className="reader-pane" ref={readerPaneRef}>
              <MarkdownViewer
                markdown={markdown}
                searchQuery={searchQuery}
                viewerRef={viewerRef}
                scrollRootRef={readerPaneRef}
                onHeadingRegister={(id, element) => {
                  headingElementsRef.current[id] = element;
                }}
                onTocChange={handleRenderedTocChange}
                onHeadingVisible={setActiveHeadingId}
              />
            </main>

            {!rightCollapsed ? (
              <aside className="support-pane">
                <SearchPanel
                  query={searchQuery}
                  hits={searchHits}
                  activeIndex={activeHitIndex}
                  onQueryChange={setSearchQuery}
                  onPrev={handlePrevHit}
                  onNext={handleNextHit}
                  onSelectHit={handleSelectHit}
                />

                <SettingsPanel
                  settings={settings}
                  onChange={setSettings}
                  onReset={() => setSettings(defaultReaderSettings)}
                />
              </aside>
            ) : null}
          </>
        ) : (
          <main className="reader-pane reader-pane--empty">
            <EmptyState onLoadFiles={handleFiles} onLoadText={handleLoadText} demoMarkdown={sampleMarkdown} />
          </main>
        )}
      </div>

      {hasDocument ? (
        <FloatingActions
          onToggleToc={handleTocVisibilityToggle}
          onToggleSettings={handleSettingsVisibilityToggle}
          onScrollTop={handleScrollTop}
        />
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        hidden
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) {
            await handleFiles(files);
          }
          event.target.value = '';
        }}
      />

      {mobilePanel ? (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer__backdrop" onClick={() => setMobilePanel(null)} />
          <div className="mobile-drawer__panel">
            {mobilePanel === 'toc' ? (
              <TOCSidebar
                items={toc}
                activeId={activeHeadingId}
                onSelect={(id) => {
                  scrollToHeading(id, readerPaneRef.current, headingElementsRef.current);
                  setActiveHeadingId(id);
                  setMobilePanel(null);
                }}
                compact
              />
            ) : (
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                onReset={() => setSettings(defaultReaderSettings)}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function areTocItemsEqual(left: TocItem[], right: TocItem[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => {
    const other = right[index];
    return item.id === other.id && item.text === other.text && item.level === other.level;
  });
}

function scrollToHeading(
  id: string,
  root: HTMLElement | null,
  headingElements: Record<string, HTMLElement | null>,
) {
  const target = headingElements[id] ?? document.getElementById(id);
  if (!target) {
    return;
  }

  if (!root) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const nextTop = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 16;
  root.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
}
