import type { XoCardData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { htmlToText } from '@/lib/utils';

export function XoCardPage({ data, scale = 1, editable = false, onDataChange }: PageProps<XoCardData>) {
  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, title: htmlToText(e.currentTarget.innerHTML) });
    }
  };

  const handleCardLabelBlur = (card: 'before' | 'after', e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, [card]: { ...data[card], label: htmlToText(e.currentTarget.innerHTML) } });
    }
  };

  const handleCardLineBlur = (card: 'before' | 'after', lineIndex: number, e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      const newLines = [...data[card].lines];
      newLines[lineIndex] = htmlToText(e.currentTarget.innerHTML);
      onDataChange({ ...data, [card]: { ...data[card], lines: newLines } });
    }
  };

  const buildLines = (lines: string[], card: 'before' | 'after') =>
    lines.map((line, i) => (
      <div
        key={i}
        className="tpl-body-secondary"
        style={{ color: '#111' }}
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? (e) => handleCardLineBlur(card, i, e) : undefined}
      >
        {line}
      </div>
    ));

  const cardEl = (cardData: { label: string; lines: string[] }, cardKey: 'before' | 'after') => (
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
        <div
          className="tpl-card-korean"
          style={{ color: '#111', marginBottom: 8 }}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? (e) => handleCardLabelBlur(cardKey, e) : undefined}
        >
          {cardData.label}
        </div>
        {buildLines(cardData.lines, cardKey)}
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
          style={{ color: '#000', textAlign: 'center', width: '100%' }}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? handleTitleBlur : undefined}
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
          {cardEl(data.before, 'before')}
          {cardEl(data.after, 'after')}
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
