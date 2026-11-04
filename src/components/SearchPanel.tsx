import type { SearchHit } from '../features/reader/reader-types';
import { highlightText } from '../services/markdown-service';

type SearchPanelProps = {
  query: string;
  hits: SearchHit[];
  activeIndex: number;
  onQueryChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectHit: (index: number) => void;
};

export function SearchPanel({
  query,
  hits,
  activeIndex,
  onQueryChange,
  onPrev,
  onNext,
  onSelectHit,
}: SearchPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>{"\u641c\u7d22"}</h2>
          <p className="panel__subtext">{"\u5728\u5f53\u524d\u6587\u6863\u5185\u5b9e\u65f6\u67e5\u627e\u3002"}</p>
        </div>
        <span className="panel__meta">{hits.length} {"\u6761"}</span>
      </div>

      <div className="search-box">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={"\u8f93\u5165\u5173\u952e\u8bcd"}
          aria-label={"\u641c\u7d22\u5173\u952e\u8bcd"}
        />
        <div className="search-box__actions">
          <button type="button" onClick={onPrev} disabled={!hits.length}>
            {"\u4e0a\u4e00\u6761"}
          </button>
          <button type="button" onClick={onNext} disabled={!hits.length}>
            {"\u4e0b\u4e00\u6761"}
          </button>
        </div>
      </div>

      <div className="search-results">
        {!query.trim() ? (
          <p className="panel__empty">{"\u8f93\u5165\u5173\u952e\u8bcd\u540e\u663e\u793a\u547d\u4e2d\u7ed3\u679c\u3002"}</p>
        ) : !hits.length ? (
          <p className="panel__empty">{"\u6ca1\u6709\u627e\u5230\u5339\u914d\u5185\u5bb9\u3002"}</p>
        ) : (
          hits.map((hit, index) => (
            <button
              key={`${hit.id}-${index}`}
              className={`search-results__item ${index === activeIndex ? 'is-active' : ''}`}
              type="button"
              onClick={() => onSelectHit(index)}
            >
              <strong>{highlightText(hit.heading, query)}</strong>
              <span>{highlightText(hit.snippet, query)}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
