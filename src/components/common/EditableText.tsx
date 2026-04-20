import React from 'react';
import { nl2br, htmlToText } from '@/lib/utils';
import { resolveClassName, resolveColor } from '@/lib/styles';

interface EditableTextProps {
  field: string;                                     // e.g. "title", "items.0.body"
  defaultPreset: string;                             // e.g. "tpl-cover-title"
  defaultColor?: string;                             // CSS var name or hex (e.g. "--tpl-text-white", "#111")
  value: string;
  onChange?: (next: string) => void;
  styles?: Record<string, string>;
  colors?: Record<string, string>;
  editable?: boolean;
  selected?: boolean;
  onSelect?: (field: string, defaultPreset: string, defaultColor?: string) => void;
  style?: React.CSSProperties;                       // layout-only overrides (marginBottom, textAlign 등)
  as?: 'div' | 'span' | 'p';
}

export function EditableText({
  field,
  defaultPreset,
  defaultColor,
  value,
  onChange,
  styles,
  colors,
  editable = false,
  selected = false,
  onSelect,
  style,
  as: Tag = 'div',
}: EditableTextProps) {
  const className = resolveClassName(field, styles, defaultPreset);
  const resolvedColor = resolveColor(field, colors, defaultColor);

  const mergedStyle: React.CSSProperties = {
    ...(resolvedColor ? { color: resolvedColor } : {}),
    ...(editable ? { outline: 'none' } : {}),
    ...(selected && editable
      ? { boxShadow: '0 0 0 2px rgba(143, 84, 255, 0.6)', borderRadius: 4 }
      : {}),
    ...style,
  };

  if (!editable) {
    return (
      <Tag
        className={className}
        style={mergedStyle}
        dangerouslySetInnerHTML={{ __html: nl2br(value) }}
      />
    );
  }

  return (
    <Tag
      className={className}
      contentEditable
      suppressContentEditableWarning
      style={mergedStyle}
      onFocus={() => onSelect?.(field, defaultPreset, defaultColor)}
      onBlur={(e) => {
        const next = htmlToText((e.currentTarget as HTMLElement).innerHTML);
        if (next !== value) onChange?.(next);
      }}
      dangerouslySetInnerHTML={{ __html: nl2br(value) }}
    />
  );
}
