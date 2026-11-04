type FloatingActionsProps = {
  onToggleToc: () => void;
  onToggleSettings: () => void;
  onScrollTop: () => void;
};

export function FloatingActions({ onToggleToc, onToggleSettings, onScrollTop }: FloatingActionsProps) {
  return (
    <div className="floating-actions" aria-label={"\u9605\u8bfb\u8f85\u52a9\u64cd\u4f5c"}>
      <button className="floating-actions__button" onClick={onToggleToc} type="button">
        {"\u76ee\u5f55"}
      </button>
      <button className="floating-actions__button" onClick={onToggleSettings} type="button">
        {"\u8bbe\u7f6e"}
      </button>
      <button className="floating-actions__button" onClick={onScrollTop} type="button">
        {"\u9876\u90e8"}
      </button>
    </div>
  );
}
