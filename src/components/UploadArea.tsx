import { useRef, useState } from 'react';

type UploadAreaProps = {
  onLoadFiles: (files: File[]) => Promise<void> | void;
  onLoadText: (text: string) => void;
};

export function UploadArea({ onLoadFiles, onLoadText }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState('');
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={`upload-area ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (event) => {
        event.preventDefault();
        setDragging(false);
        const files = Array.from(event.dataTransfer.files ?? []);
        if (files.length) {
          await onLoadFiles(files);
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        hidden
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) {
            await onLoadFiles(files);
          }
          event.target.value = '';
        }}
      />

      <input
        ref={directoryInputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        multiple
        hidden
        {...({ webkitdirectory: 'true', directory: 'true' } as unknown as Record<string, string>)}
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) {
            await onLoadFiles(files);
          }
          event.target.value = '';
        }}
      />

      <div className="upload-area__header">
        <p className="upload-area__eyebrow">导入</p>
        <h2>{"\u5bfc\u5165 Markdown"}</h2>
        <p>{"\u652f\u6301\u591a\u4e2a\u6587\u4ef6\u3001\u6587\u4ef6\u5939\u91cc\u7684\u6240\u6709 MD\uff0c\u4e5f\u53ef\u4ee5\u76f4\u63a5\u7c98\u8d34\u6587\u672c\u3002"}</p>
      </div>

      <div className="upload-area__actions">
        <button type="button" className="button button--primary" onClick={() => fileInputRef.current?.click()}>
          {"\u9009\u62e9\u6587\u4ef6"}
        </button>
        <button type="button" className="button button--ghost" onClick={() => directoryInputRef.current?.click()}>
          {"\u9009\u62e9\u6587\u4ef6\u5939"}
        </button>
        <button type="button" className="button button--ghost" onClick={() => onLoadText(draft)}>
          {"\u8f7d\u5165\u6587\u672c"}
        </button>
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={"\u5728\u8fd9\u91cc\u7c98\u8d34 Markdown \u5185\u5bb9"}
      />
    </div>
  );
}
