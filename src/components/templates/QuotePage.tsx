import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';
import type { PageProps, QuoteCardData } from '@/lib/types';

export function QuotePage({ data, styles, colors, editable, scale, selectedField, onDataChange, onSelect }: PageProps<QuoteCardData>) {
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
        <EditableText
          field="quote"
          defaultPreset="tpl-quote-text"
          defaultColor="#111"
          value={data.quote}
          onChange={(v) => onDataChange?.({ ...data, quote: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'quote'}
          onSelect={onSelect}
          style={{ width: '100%' }}
        />

        {/* Source */}
        {data.source != null && (
          <EditableText
            field="source"
            defaultPreset="tpl-source-citation"
            defaultColor="#888"
            value={data.source}
            onChange={(v) => onDataChange?.({ ...data, source: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'source'}
            onSelect={onSelect}
            style={{ marginTop: 48, width: '100%' }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
