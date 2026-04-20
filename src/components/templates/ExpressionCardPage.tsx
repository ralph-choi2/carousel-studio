import type { PageProps, ExpressionCardData } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';

export function ExpressionCardPage({ data, styles, colors, editable, scale = 1, selectedField, onDataChange, onSelect }: PageProps<ExpressionCardData>) {
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
        <EditableText
          field="title"
          defaultPreset="tpl-section-title"
          value={data.title}
          onChange={(v) => onDataChange?.({ ...data, title: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'title'}
          onSelect={onSelect}
          style={{ textAlign: 'center', width: '100%' }}
        />

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
              <EditableText
                field={`items.${i}.title`}
                defaultPreset="tpl-scene-bold"
                defaultColor="#111111"
                value={item.title}
                onChange={(v) => {
                  const newItems = [...items];
                  newItems[i] = { ...item, title: v };
                  onDataChange?.({ ...data, items: newItems });
                }}
                styles={styles}
                colors={colors}
                editable={editable}
                selected={selectedField === `items.${i}.title`}
                onSelect={onSelect}
                style={{ marginBottom: item.body ? 16 : 0 }}
              />
              {item.body && (
                <EditableText
                  field={`items.${i}.body`}
                  defaultPreset="tpl-scene-regular"
                  defaultColor="#888888"
                  value={item.body}
                  onChange={(v) => {
                    const newItems = [...items];
                    newItems[i] = { ...item, body: v };
                    onDataChange?.({ ...data, items: newItems });
                  }}
                  styles={styles}
                  colors={colors}
                  editable={editable}
                  selected={selectedField === `items.${i}.body`}
                  onSelect={onSelect}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
