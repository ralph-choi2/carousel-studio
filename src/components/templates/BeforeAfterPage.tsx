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
          <div className="tpl-source-citation" style={{ color: '#8F54FF' }}>
            {data.series}
          </div>
        )}

        {/* Situation */}
        {data.situation && (
          <div className="tpl-cover-subtitle" style={{ color: '#111' }}>
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
          <div className="tpl-source-citation" style={{ color: '#aaa', marginBottom: 12 }}>
            3개월 전
          </div>
          <div className="tpl-card-english" style={{ color: '#222' }}>
            {data.before_eng}
          </div>
          <div className="tpl-card-korean" style={{ color: '#888', marginTop: 8 }}>
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
          <div className="tpl-source-citation" style={{ color: '#8F54FF', marginBottom: 12 }}>
            지금
          </div>
          {data.after_items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < data.after_items.length - 1 ? 16 : 0 }}>
              <div className="tpl-card-english" style={{ color: '#FFFFFF' }}>
                {item.eng}
              </div>
              <div className="tpl-card-korean" style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
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
