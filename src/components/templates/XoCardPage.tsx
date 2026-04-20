import type { XoCardData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';

export function XoCardPage({
  data,
  styles,
  colors,
  editable = false,
  scale = 1,
  selectedField,
  onDataChange,
  onSelect,
}: PageProps<XoCardData>) {
  const before = data.before;
  const after = data.after;

  const buildLines = (lines: string[], card: 'before' | 'after') =>
    lines.map((line, i) => (
      <EditableText
        key={i}
        field={`${card}.lines.${i}`}
        defaultPreset="tpl-body-secondary"
        defaultColor="#111"
        value={line}
        onChange={(v) => {
          const newLines = [...data[card].lines];
          newLines[i] = v;
          onDataChange?.({ ...data, [card]: { ...data[card], lines: newLines } });
        }}
        styles={styles}
        colors={colors}
        editable={editable}
        selected={selectedField === `${card}.lines.${i}`}
        onSelect={onSelect}
      />
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
        <EditableText
          field={`${cardKey}.label`}
          defaultPreset="tpl-card-korean"
          defaultColor="#111"
          value={cardData.label}
          onChange={(v) =>
            onDataChange?.({ ...data, [cardKey]: { ...data[cardKey], label: v } })
          }
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === `${cardKey}.label`}
          onSelect={onSelect}
          style={{ marginBottom: 8 }}
        />
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
        <EditableText
          field="title"
          defaultPreset="tpl-section-subtitle"
          defaultColor="#000"
          value={data.title}
          onChange={(v) => onDataChange?.({ ...data, title: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'title'}
          onSelect={onSelect}
          style={{ textAlign: 'center', width: '100%' }}
        />

        {/* Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
            width: '100%',
          }}
        >
          {cardEl(before, 'before')}
          {cardEl(after, 'after')}
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
