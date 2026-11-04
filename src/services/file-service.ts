import type { ImportedDocument } from '../features/reader/reader-types';

export async function readMarkdownFiles(files: Iterable<File>): Promise<ImportedDocument[]> {
  const candidates = Array.from(files).filter(isMarkdownLike);
  if (!candidates.length) {
    throw new Error('请选择 Markdown 文件');
  }

  const loaded = await Promise.all(
    candidates.map(async (file, index) => {
      const content = await readFileAsText(file);
      if (!content.trim()) {
        return null;
      }

      const path = getFilePath(file);
      return {
        id: `${path}::${file.lastModified}::${index}`,
        name: file.name,
        path,
        content,
      } satisfies ImportedDocument;
    }),
  );

  const documents = loaded
    .filter((item): item is ImportedDocument => item !== null)
    .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));

  if (!documents.length) {
    throw new Error('没有可读取的 Markdown 内容');
  }

  return documents;
}

export function createTextDocument(content: string, name = 'paste.md'): ImportedDocument {
  const normalized = content.trim();
  if (!normalized) {
    throw new Error('内容为空');
  }

  return {
    id: `${name}::text`,
    name,
    path: name,
    content: normalized,
  };
}

function isMarkdownLike(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith('.md') || name.endsWith('.markdown') || file.type === 'text/markdown' || file.type === 'text/plain';
}

function getFilePath(file: File) {
  const relativePath = 'webkitRelativePath' in file ? (file as File & { webkitRelativePath?: string }).webkitRelativePath : '';
  return relativePath && relativePath.trim() ? relativePath : file.name;
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file, 'utf-8');
  });
}
