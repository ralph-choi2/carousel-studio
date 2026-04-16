import { PageWrapper } from './PageWrapper';
import type { PageProps, QuoteCardData } from '@/lib/types';
import { htmlToText } from '@/lib/utils';

export function QuotePage({ data, editable, scale, onDataChange }: PageProps<QuoteCardData>) {
  function handleQuoteBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, quote: htmlToText(e.currentTarget.innerHTML) });
    }
  }

  function handleSourceBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, source: htmlToText(e.currentTarget.innerHTML) });
    }
  }

  return (
    <PageWrapper scale={scale}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#F7F7F7',
        backgroundImage: 'url(/assets/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Centered content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 100px',
        textAlign: 'center',
      }}>
        {/* Quote */}
        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleQuoteBlur}
            style={{
              fontSize: 50,
              fontWeight: 600,
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              color: '#111',
              outline: 'none',
              width: '100%',
            }}
          >
            {data.quote}
          </div>
        ) : (
          <div style={{
            fontSize: 50,
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '-0.02em',
            color: '#111',
            width: '100%',
          }}>
            {data.quote}
          </div>
        )}

        {/* Source */}
        {data.source != null && (
          editable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={handleSourceBlur}
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: '#888',
                marginTop: 48,
                outline: 'none',
                width: '100%',
              }}
            >
              {data.source}
            </div>
          ) : (
            <div style={{
              fontSize: 28,
              fontWeight: 400,
              color: '#888',
              marginTop: 48,
              width: '100%',
            }}>
              {data.source}
            </div>
          )
        )}
      </div>
    </PageWrapper>
  );
}
