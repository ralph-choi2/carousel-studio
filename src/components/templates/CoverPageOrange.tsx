import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';
import type { PageProps, CoverData } from '@/lib/types';

export function CoverPageOrange({ data, styles, colors, editable, scale, selectedField, onDataChange, onSelect }: PageProps<CoverData>) {
  const hasSubtitle = typeof data.subtitle === 'string' && data.subtitle.trim().length > 0;
  const showSubtitle = editable || hasSubtitle;

  return (
    <PageWrapper scale={scale}>
      {/* Orange gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #FFA100 0%, #FF7800 100%)',
        zIndex: 0,
      }} />

      {/* Content block */}
      <div style={{
        position: 'absolute',
        left: 100,
        top: 331,
        width: 880,
        zIndex: 2,
      }}>
        <EditableText
          field="title"
          defaultPreset="tpl-cover-orange-title"
          defaultColor="--tpl-text-white"
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
            defaultPreset="tpl-cover-orange-subtitle"
            defaultColor="--tpl-text-white"
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

      {/* BI Logo centered at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        zIndex: 3,
        display: 'flex',
        justifyContent: 'center',
        opacity: 0.7,
      }}>
        <img src="/assets/bi_uphone.png" alt="Uphone" style={{ display: 'block', width: 240, height: 54, objectFit: 'contain' }} />
      </div>
    </PageWrapper>
  );
}
