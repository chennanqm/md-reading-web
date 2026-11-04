import { Fragment, cloneElement, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';

export function createSlugger() {
  const seen = new Map<string, number>();

  return (value: string) => {
    const base = slugify(value);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

export function slugify(value: string) {
  return stripMarkdownSyntax(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80) || 'section';
}

export function stripMarkdownSyntax(value: string) {
  return value
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toPlainText(children: ReactNode): string {
  if (children === null || children === undefined || typeof children === 'boolean') {
    return '';
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => toPlainText(child)).join('');
  }

  if (typeof children === 'object' && children && 'props' in children) {
    const withProps = children as { props?: { children?: ReactNode } };
    return toPlainText(withProps.props?.children);
  }

  return '';
}

export function normalizeText(value: string) {
  return stripMarkdownSyntax(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerpt(value: string, limit = 120) {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= limit) {
    return compact;
  }
  return `${compact.slice(0, limit).trimEnd()}...`;
}

export function highlightNode(node: ReactNode, query: string): ReactNode {
  const needle = normalizeText(query);
  if (!needle) {
    return node;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return highlightText(String(node), needle);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => createElement(Fragment, { key: index }, highlightNode(child, query)));
  }

  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    if (element.props.children !== undefined) {
      return cloneElement(element, {
        children: highlightNode(element.props.children, query),
      });
    }
  }

  return node;
}

export function highlightText(value: string, query: string): ReactNode {
  const needle = normalizeText(query);
  if (!needle) {
    return value;
  }

  const lower = value.toLowerCase();
  const needleLower = needle.toLowerCase();
  const nodes: ReactNode[] = [];
  let cursor = 0;

  while (cursor < value.length) {
    const matchIndex = lower.indexOf(needleLower, cursor);
    if (matchIndex === -1) {
      nodes.push(value.slice(cursor));
      break;
    }

    if (matchIndex > cursor) {
      nodes.push(value.slice(cursor, matchIndex));
    }

    nodes.push(
      createElement(
        'mark',
        {
          key: `${matchIndex}-${cursor}`,
          className: 'md-highlight',
        },
        value.slice(matchIndex, matchIndex + needle.length),
      ),
    );
    cursor = matchIndex + needle.length;
  }

  return nodes;
}

export function parseHeadingLine(line: string) {
  const match = /^\s{0,3}(#{1,6})\s+(.+)$/.exec(line);
  if (!match) {
    return null;
  }

  return {
    level: match[1].length,
    text: stripMarkdownSyntax(match[2]),
  };
}

export function isFenceLine(line: string) {
  return /^\s{0,3}(`{3,}|~{3,})/.test(line);
}
