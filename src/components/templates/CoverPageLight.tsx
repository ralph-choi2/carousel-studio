import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';
import type { PageProps, CoverData } from '@/lib/types';

export function CoverPageLight({ data, styles, colors, editable, scale, selectedField, onDataChange, onSelect }: PageProps<CoverData>) {
  const hasSubtitle = typeof data.subtitle === 'string' && data.subtitle.trim().length > 0;
  const showSubtitle = editable || hasSubtitle;

  return (
    <PageWrapper scale={scale}>
      {/* Light background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#F4F4F4',
        zIndex: 0,
      }} />

      {/* Top horizontal line */}
      <div style={{
        position: 'absolute',
        left: 70,
        top: 100,
        width: 940,
        height: 4,
        background: '#0F0F0F',
        zIndex: 1,
      }} />

      {/* Purple accent: left bar */}
      <div style={{
        position: 'absolute',
        left: 61,
        top: 606,
        width: 3,
        height: 69,
        background: '#9732FC',
        zIndex: 2,
      }} />

      {/* Purple accent: right bar */}
      <div style={{
        position: 'absolute',
        left: 402,
        top: 606,
        width: 3,
        height: 69,
        background: '#9732FC',
        zIndex: 2,
      }} />

      {/* Purple accent: highlight background */}
      <div style={{
        position: 'absolute',
        left: 63,
        top: 609,
        width: 340,
        height: 63,
        background: '#9732FC',
        opacity: 0.16,
        zIndex: 2,
      }} />

      {/* Content block */}
      <div style={{
        position: 'absolute',
        left: 70,
        top: 156,
        width: 880,
        zIndex: 3,
      }}>
        <EditableText
          field="title"
          defaultPreset="tpl-cover-light-title"
          defaultColor="--tpl-text-dark"
          value={data.title}
          onChange={(v) => onDataChange?.({ ...data, title: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'title'}
          onSelect={onSelect}
        />

        {showSubtitle && (
          <EditableText
            field="subtitle"
            defaultPreset="tpl-cover-light-subtitle"
            defaultColor="--tpl-text-dark"
            value={data.subtitle ?? ''}
            onChange={(v) => onDataChange?.({ ...data, subtitle: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'subtitle'}
            onSelect={onSelect}
            style={{ marginTop: 100 }}
          />
        )}
      </div>

      {/* BI Logo right-aligned at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        right: 100,
        zIndex: 4,
        opacity: 0.7,
      }}>
        <img
          src="/assets/bi_uphone.png"
          alt="Uphone"
          style={{ display: 'block', width: 240, height: 54, objectFit: 'contain', filter: 'invert(1)' }}
        />
      </div>
    </PageWrapper>
  );
}
