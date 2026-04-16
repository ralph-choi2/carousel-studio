import type { SimilarData, SimilarItem, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';

export function SimilarPage({ data, scale = 1 }: PageProps<SimilarData>) {
  const title = data.title || data.header || '';

  return (
    <PageWrapper scale={scale}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#F7F7F7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          gap: 48,
        }}
      >
        {/* Title */}
        <div
          contentEditable
          suppressContentEditableWarning
          style={{
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.2,
            color: '#111',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {title}
        </div>

        {/* Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            width: '100%',
            maxWidth: 920,
          }}
        >
          {data.items.map((item: SimilarItem, i: number) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                padding: '48px 40px',
              }}
            >
              <div
                className="tpl-card-english"
                style={{ color: 'var(--tpl-text-primary)' }}
              >
                {item.eng}
              </div>
              <div
                className="tpl-card-korean"
                style={{ color: 'var(--tpl-text-secondary)' }}
              >
                {item.kor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
