import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';
import type { PageProps, CoverData } from '@/lib/types';

const FALLBACK_BG = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#f4ebe3"/></svg>'
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
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(67, 173, 255, 0.85)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 74%, rgba(255,255,255,0.3) 100%)',
        zIndex: 2,
      }} />

      {/* 텍스트: 수직 중앙 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        left: 100,
        width: 880,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
        alignItems: 'center',
        textAlign: 'center',
      }}>
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
          style={{ width: '100%', textAlign: 'center' }}
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
            style={{ width: '100%', textAlign: 'center' }}
          />
        )}
      </div>

      {/* BI 로고: 우하단 */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 100,
        right: 100,
        zIndex: 3,
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <img src="/assets/bi_uphone.png" alt="Uphone" style={{ display: 'block', width: 240, height: 54, objectFit: 'contain' }} />
      </div>
    </PageWrapper>
  );
}
