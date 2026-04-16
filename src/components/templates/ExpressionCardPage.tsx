import type { PageProps, ExpressionCardData } from '@/lib/types';
import { PageWrapper } from './PageWrapper';

export function ExpressionCardPage({ data, scale = 1 }: PageProps<ExpressionCardData>) {
  const items = data.items ?? [];

  return (
    <PageWrapper scale={scale}>
      {/* Light background */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#F7F7F7', zIndex: 0 }} />

      {/* Centered content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          gap: 48,
          boxSizing: 'border-box',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 54,
            textAlign: 'center',
            color: '#111111',
            lineHeight: 1.25,
            width: '100%',
          }}
        >
          {data.title}
        </div>

        {/* Items list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            maxWidth: 920,
            width: '100%',
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: '48px 40px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#111111',
                  lineHeight: 1.3,
                  marginBottom: item.body ? 16 : 0,
                }}
              >
                {item.title}
              </div>
              {item.body && (
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 400,
                    color: '#888888',
                    lineHeight: 1.4,
                  }}
                >
                  {item.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
