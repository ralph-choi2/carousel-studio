import { PageWrapper } from './PageWrapper';
import type { PageProps, CoverData } from '@/lib/types';
import { nl2br, htmlToText } from '@/lib/utils';

const FALLBACK_BG = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2C3E50"/><stop offset="100%" stop-color="#4A6FA5"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#g)"/></svg>'
);

export function CoverPage({ data, editable, scale, onDataChange }: PageProps<CoverData>) {
  const bgSrc = data.bg_image || FALLBACK_BG;

  function handleTitleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, title: htmlToText(e.currentTarget.innerHTML) });
    }
  }

  function handleSubtitleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, subtitle: htmlToText(e.currentTarget.innerHTML) });
    }
  }

  return (
    <PageWrapper scale={scale}>
      {/* Background image */}
      <img
        src={bgSrc}
        alt=""
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 650,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute',
        bottom: 130,
        left: 110,
        right: 110,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <img
          src="/assets/bi_uphone.png"
          alt="Uphone"
          style={{ display: 'block', width: 220, height: 'auto', marginBottom: 40 }}
        />

        {editable ? (
          <div
            className="tpl-cover-title"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            style={{ marginBottom: 52, outline: 'none', minHeight: 90 }}
            dangerouslySetInnerHTML={{ __html: nl2br(data.title) }}
          />
        ) : (
          <div
            className="tpl-cover-title"
            style={{ marginBottom: 52 }}
            dangerouslySetInnerHTML={{ __html: nl2br(data.title) }}
          />
        )}

        {data.subtitle && (
          editable ? (
            <div
              className="tpl-cover-subtitle"
              contentEditable
              suppressContentEditableWarning
              onBlur={handleSubtitleBlur}
              style={{ outline: 'none' }}
              dangerouslySetInnerHTML={{ __html: nl2br(data.subtitle) }}
            />
          ) : (
            <div
              className="tpl-cover-subtitle"
              dangerouslySetInnerHTML={{ __html: nl2br(data.subtitle) }}
            />
          )
        )}
      </div>
    </PageWrapper>
  );
}
