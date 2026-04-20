import type { SimilarData, SimilarItem, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';

export function SimilarPage({ data, styles, colors, editable, scale = 1, selectedField, onDataChange, onSelect }: PageProps<SimilarData>) {
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
        <EditableText
          field="title"
          defaultPreset="tpl-section-title"
          defaultColor="#111"
          value={data.title ?? data.header ?? ''}
          onChange={(v) => onDataChange?.({ ...data, title: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'title'}
          onSelect={onSelect}
          style={{ textAlign: 'center', width: '100%' }}
        />

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
              <EditableText
                field={`items.${i}.eng`}
                defaultPreset="tpl-card-english"
                defaultColor="var(--tpl-text-primary)"
                value={item.eng}
                onChange={(v) => {
                  const newItems = [...data.items];
                  newItems[i] = { ...item, eng: v };
                  onDataChange?.({ ...data, items: newItems });
                }}
                styles={styles}
                colors={colors}
                editable={editable}
                selected={selectedField === `items.${i}.eng`}
                onSelect={onSelect}
              />
              <EditableText
                field={`items.${i}.kor`}
                defaultPreset="tpl-card-korean"
                defaultColor="var(--tpl-text-secondary)"
                value={item.kor}
                onChange={(v) => {
                  const newItems = [...data.items];
                  newItems[i] = { ...item, kor: v };
                  onDataChange?.({ ...data, items: newItems });
                }}
                styles={styles}
                colors={colors}
                editable={editable}
                selected={selectedField === `items.${i}.kor`}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
