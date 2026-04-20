import type { BeforeAfterData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';

export function BeforeAfterPage({
  data,
  styles,
  colors,
  editable = false,
  scale = 1,
  selectedField,
  onDataChange,
  onSelect,
}: PageProps<BeforeAfterData>) {
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
          <EditableText
            field="series"
            defaultPreset="tpl-source-citation"
            defaultColor="--tpl-accent-purple"
            value={data.series}
            onChange={(v) => onDataChange?.({ ...data, series: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'series'}
            onSelect={onSelect}
          />
        )}

        {/* Situation */}
        {data.situation && (
          <EditableText
            field="situation"
            defaultPreset="tpl-cover-subtitle"
            defaultColor="#111"
            value={data.situation}
            onChange={(v) => onDataChange?.({ ...data, situation: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'situation'}
            onSelect={onSelect}
          />
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
          <EditableText
            field="before_eng"
            defaultPreset="tpl-card-english"
            defaultColor="#222"
            value={data.before_eng}
            onChange={(v) => onDataChange?.({ ...data, before_eng: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'before_eng'}
            onSelect={onSelect}
          />
          <EditableText
            field="before_kor"
            defaultPreset="tpl-card-korean"
            defaultColor="#888"
            value={data.before_kor}
            onChange={(v) => onDataChange?.({ ...data, before_kor: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'before_kor'}
            onSelect={onSelect}
            style={{ marginTop: 8 }}
          />
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
              <EditableText
                field={`after_items.${i}.eng`}
                defaultPreset="tpl-card-english"
                defaultColor="--tpl-text-white"
                value={item.eng}
                onChange={(v) => {
                  const newItems = [...data.after_items];
                  newItems[i] = { ...newItems[i], eng: v };
                  onDataChange?.({ ...data, after_items: newItems });
                }}
                styles={styles}
                colors={colors}
                editable={editable}
                selected={selectedField === `after_items.${i}.eng`}
                onSelect={onSelect}
              />
              <EditableText
                field={`after_items.${i}.kor`}
                defaultPreset="tpl-card-korean"
                defaultColor="rgba(255,255,255,0.6)"
                value={item.kor}
                onChange={(v) => {
                  const newItems = [...data.after_items];
                  newItems[i] = { ...newItems[i], kor: v };
                  onDataChange?.({ ...data, after_items: newItems });
                }}
                styles={styles}
                colors={colors}
                editable={editable}
                selected={selectedField === `after_items.${i}.kor`}
                onSelect={onSelect}
                style={{ marginTop: 8 }}
              />
            </div>
          ))}
        </div>

        {/* Insight */}
        {data.insight && (
          <EditableText
            field="insight"
            defaultPreset="tpl-source-citation"
            defaultColor="#666"
            value={data.insight}
            onChange={(v) => onDataChange?.({ ...data, insight: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'insight'}
            onSelect={onSelect}
            style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.5 }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
