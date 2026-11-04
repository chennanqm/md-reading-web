type TopBarProps = {
  fileName: string | null;
  activeSection: string;
  progressText: string;
  progressValue: number;
  searchQuery: string;
  searchMatches: number;
  documentOptions: Array<{ id: string; label: string }>;
  currentDocumentId: string | null;
  onDocumentChange: (id: string) => void;
  onSearchQueryChange: (value: string) => void;
  onUploadClick: () => void;
  onToggleToc: () => void;
  onToggleSettings: () => void;
  onToggleTheme: () => void;
  onResetDocument: () => void;
  tocVisible: boolean;
  settingsVisible: boolean;
  hasDocument: boolean;
};

export function TopBar({
  fileName,
  activeSection,
  progressText,
  progressValue,
  searchQuery,
  searchMatches,
  documentOptions,
  currentDocumentId,
  onDocumentChange,
  onSearchQueryChange,
  onUploadClick,
  onToggleToc,
  onToggleSettings,
  onToggleTheme,
  onResetDocument,
  tocVisible,
  settingsVisible,
  hasDocument,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__logo" />
        <div className="topbar__brand-copy">
          <strong>{"MD \u9605\u8bfb\u5668"}</strong>
          <span>{fileName ?? '\u672a\u6253\u5f00\u6587\u4ef6'}</span>
        </div>
      </div>

      <div className="topbar__status">
        <span className="status-chip status-chip--soft">{hasDocument ? activeSection : '\u5f85\u5bfc\u5165'}</span>
        <span className="status-chip">{progressText}</span>
        {searchQuery.trim() ? (
          <span className="status-chip status-chip--accent">
            {searchMatches}
            {' 条结果'}
          </span>
        ) : null}
      </div>

      <div className="topbar__search">
        <input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={'搜索当前文档'}
          aria-label={'搜索当前文档'}
        />
        <div className="topbar__progress" aria-hidden="true">
          <span style={{ width: `${progressValue}%` }} />
        </div>
      </div>

      <div className="topbar__actions">
        {documentOptions.length > 1 ? (
          <select
            className="topbar__select"
            value={currentDocumentId ?? ''}
            onChange={(event) => onDocumentChange(event.target.value)}
            aria-label="当前文档"
          >
            {documentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        ) : null}
        <button type="button" onClick={onUploadClick}>
          {'上传'}
        </button>
        <button type="button" onClick={onToggleTheme}>
          {'主题'}
        </button>
        <button
          type="button"
          className={tocVisible ? 'is-active' : ''}
          onClick={onToggleToc}
          disabled={!hasDocument}
          aria-pressed={tocVisible}
        >
          {'目录'}
        </button>
        <button
          type="button"
          className={settingsVisible ? 'is-active' : ''}
          onClick={onToggleSettings}
          disabled={!hasDocument}
          aria-pressed={settingsVisible}
        >
          {'设置'}
        </button>
        <button type="button" onClick={onResetDocument}>
          {'重置'}
        </button>
      </div>
    </header>
  );
}
