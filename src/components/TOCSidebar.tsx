import type { TocItem } from '../features/reader/reader-types';

type TOCSidebarProps = {
  items: TocItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
};

export function TOCSidebar({ items, activeId, onSelect, compact = false }: TOCSidebarProps) {
  return (
    <section className={`panel toc-panel ${compact ? 'toc-panel--compact' : ''}`}>
      <div className="panel__header">
        <div>
          <h2>{"\u76ee\u5f55"}</h2>
          <p className="panel__subtext">{"\u70b9\u51fb\u53ef\u5feb\u901f\u8df3\u8f6c\u3002"}</p>
        </div>
        <div className="panel__header-actions">
          <span className="panel__meta">{items.length} {"\u9879"}</span>
        </div>
      </div>

      <nav className="toc-list" aria-label={"\u6587\u7ae0\u76ee\u5f55"}>
        {!items.length ? (
          <p className="panel__empty">{"\u6682\u65e0\u76ee\u5f55\u3002"}</p>
        ) : (
          items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`toc-list__item toc-list__item--level-${item.level} ${
                item.id === activeId ? 'is-active' : ''
              }`}
              onClick={(event) => {
                event.preventDefault();
                onSelect(item.id);
              }}
            >
              {item.text}
            </a>
          ))
        )}
      </nav>
    </section>
  );
}
