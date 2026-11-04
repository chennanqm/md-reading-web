import { UploadArea } from './UploadArea';

type EmptyStateProps = {
  onLoadFiles: (files: File[]) => Promise<void> | void;
  onLoadText: (text: string) => void;
  demoMarkdown: string;
};

const featureNotes = [
  '\u4e0a\u4f20\u540e\u81ea\u52a8\u6e32\u67d3 Markdown',
  '\u652f\u6301\u4e00\u6b21\u6027\u5bfc\u5165\u591a\u4e2a md \u6587\u4ef6',
  '\u652f\u6301\u9009\u62e9\u6587\u4ef6\u5939\u5e76\u81ea\u52a8\u8bfb\u53d6 md',
  '\u5207\u6362\u6587\u6863\u540e\u4ecd\u53ef\u76ee\u5f55\u8df3\u8f6c\u548c\u641c\u7d22',
];

export function EmptyState({ onLoadFiles, onLoadText, demoMarkdown }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div className="empty-state__copy">
        <p className="eyebrow">Markdown Reader</p>
        <h1>
          {'上传文件'}
          <br />
          {'立即开始阅读'}
        </h1>
        <p>
          {'这是一个偏阅读的 Markdown 网页，支持本地导入、目录导航、搜索定位、批量文件导入和阅读设置。'}
        </p>

        <div className="empty-state__actions">
          <button className="button button--primary" onClick={() => onLoadText(demoMarkdown)}>
            {'载入示例'}
          </button>
          <span className="empty-state__hint">{'支持拖拽多个文件、选择文件夹、粘贴文本。'}</span>
        </div>

        <div className="feature-list">
          {featureNotes.map((note) => (
            <span key={note} className="feature-list__item">
              {note}
            </span>
          ))}
        </div>
      </div>

      <UploadArea onLoadFiles={onLoadFiles} onLoadText={onLoadText} />
    </section>
  );
}
