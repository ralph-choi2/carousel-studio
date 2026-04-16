import type { XoCardData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';

export function XoCardPage({ data, scale = 1 }: PageProps<XoCardData>) {
  const buildLines = (lines: string[]) =>
    lines.map((line, i) => (
      <div
        key={i}
        className="tpl-body-secondary"
        style={{ color: '#111' }}
      >
        {line}
      </div>
    ));

  const card = (cardData: { label: string; lines: string[] }) => (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 30,
        padding: '60px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: '100%',
        }}
      >
        <div className="tpl-card-korean" style={{ color: '#111', marginBottom: 8 }}>
          {cardData.label}
        </div>
        {buildLines(cardData.lines)}
      </div>
    </div>
  );

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

      {/* Centered content */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: '50%',
          transform: 'translateY(calc(-50% - 28px))',
          width: 840,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 80,
        }}
      >
        {/* Title */}
        <div
          className="tpl-section-subtitle"
          contentEditable
          suppressContentEditableWarning
          style={{ color: '#000', textAlign: 'center', width: '100%' }}
        >
          {data.title}
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
            width: '100%',
          }}
        >
          {card(data.before)}
          {card(data.after)}
        </div>
      </div>

      {/* Bottom logo */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 221,
          height: 50,
          backgroundImage: 'url(/assets/bi_uphone.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </PageWrapper>
  );
}
