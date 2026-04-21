import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';
import type { PageProps, CoverData } from '@/lib/types';

const FALLBACK_BG = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2C3E50"/><stop offset="100%" stop-color="#4A6FA5"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#g)"/></svg>'
);

export function CoverPage({ data, styles, colors, editable, scale, selectedField, onDataChange, onSelect }: PageProps<CoverData>) {
  const bgSrc = data.bg_image || FALLBACK_BG;
  const hasSubtitle = typeof data.subtitle === 'string' && data.subtitle.trim().length > 0;
  const showSubtitle = editable || hasSubtitle;

  return (
    <PageWrapper scale={scale}>
      <img
        src={bgSrc}
        alt=""
        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center bottom', zIndex: 0 }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 650,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 140, left: 110, right: 110,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <img src="/assets/bi_uphone.png" alt="Uphone" style={{ display: 'block', width: 220, height: 'auto', marginBottom: 40 }} />

        <EditableText
          field="title"
          defaultPreset="tpl-cover-title"
          defaultColor="--tpl-text-white"
          value={data.title}
          onChange={(v) => onDataChange?.({ ...data, title: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'title'}
          onSelect={onSelect}
          style={{ marginBottom: showSubtitle ? 52 : 0, minHeight: 90 }}
        />

        {showSubtitle && (
          <EditableText
            field="subtitle"
            defaultPreset="tpl-cover-subtitle"
            defaultColor="--tpl-text-white"
            value={data.subtitle ?? ''}
            onChange={(v) => onDataChange?.({ ...data, subtitle: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'subtitle'}
            onSelect={onSelect}
          />
        )}
      </div>
    </PageWrapper>
  );
}
