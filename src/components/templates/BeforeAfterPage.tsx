import type { BeforeAfterData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';

export function BeforeAfterPage({ data, scale = 1 }: PageProps<BeforeAfterData>) {
  return (
    <PageWrapper scale={scale}>
      {/* Background texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/assets/bg.png)',
          backgroundSize: '1080px 1350px',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#F7F7F7',
        }}
      />

      {/* Content centered vertically */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* Series label */}
        {data.series && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#8F54FF',
              lineHeight: 1.4,
            }}
          >
            {data.series}
          </div>
        )}

        {/* Situation */}
        {data.situation && (
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#111',
              lineHeight: 1.24,
              letterSpacing: '-0.02em',
            }}
          >
            {data.situation}
          </div>
        )}

        {/* Before card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '28px 36px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#aaa',
              marginBottom: 12,
            }}
          >
            3개월 전
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: '#222',
              lineHeight: 1.4,
            }}
          >
            {data.before_eng}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#888',
              lineHeight: 1.45,
              marginTop: 8,
            }}
          >
            {data.before_kor}
          </div>
        </div>

        {/* After card */}
        <div
          style={{
            background: '#111',
            borderRadius: 24,
            padding: '28px 36px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#8F54FF',
              marginBottom: 12,
            }}
          >
            지금
          </div>
          {data.after_items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < data.after_items.length - 1 ? 16 : 0 }}>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.4,
                }}
              >
                {item.eng}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.45,
                  marginTop: 8,
                }}
              >
                {item.kor}
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        {data.insight && (
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: '#666',
              lineHeight: 1.5,
            }}
          >
            {data.insight}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
