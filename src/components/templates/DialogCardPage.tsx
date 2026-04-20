import { PageWrapper } from './PageWrapper';
import type { PageProps, DialogCardData } from '@/lib/types';
import { EditableText } from '@/components/common/EditableText';

export function DialogCardPage({ data, styles, colors, editable, scale, selectedField, onDataChange, onSelect }: PageProps<DialogCardData>) {
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
        gap: 40,
        padding: '80px 80px',
      }}>
        {/* Optional title */}
        {data.title != null && (
          <EditableText
            field="title"
            defaultPreset="tpl-section-title"
            defaultColor="#111"
            value={data.title}
            onChange={(v) => onDataChange?.({ ...data, title: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'title'}
            onSelect={onSelect}
            style={{ textAlign: 'center', width: '100%' }}
          />
        )}

        {/* Speaker A card */}
        <div style={{
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 24,
        }}>
          {/* Avatar A */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#AAAAAA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
          }}>
            A
          </div>
          {/* Text group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <EditableText
              field="a.eng"
              defaultPreset="tpl-card-english"
              defaultColor="#222"
              value={data.a.eng}
              onChange={(v) => onDataChange?.({ ...data, a: { ...data.a, eng: v } })}
              styles={styles}
              colors={colors}
              editable={editable}
              selected={selectedField === 'a.eng'}
              onSelect={onSelect}
            />
            <EditableText
              field="a.kor"
              defaultPreset="tpl-card-korean"
              defaultColor="#888"
              value={data.a.kor}
              onChange={(v) => onDataChange?.({ ...data, a: { ...data.a, kor: v } })}
              styles={styles}
              colors={colors}
              editable={editable}
              selected={selectedField === 'a.kor'}
              onSelect={onSelect}
            />
          </div>
        </div>

        {/* Speaker B card */}
        <div style={{
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: 24,
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 24,
        }}>
          {/* Avatar B */}
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
          }}>
            B
          </div>
          {/* Text group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <EditableText
              field="b.eng"
              defaultPreset="tpl-card-english"
              defaultColor="#222"
              value={data.b.eng}
              onChange={(v) => onDataChange?.({ ...data, b: { ...data.b, eng: v } })}
              styles={styles}
              colors={colors}
              editable={editable}
              selected={selectedField === 'b.eng'}
              onSelect={onSelect}
            />
            <EditableText
              field="b.kor"
              defaultPreset="tpl-card-korean"
              defaultColor="#888"
              value={data.b.kor}
              onChange={(v) => onDataChange?.({ ...data, b: { ...data.b, kor: v } })}
              styles={styles}
              colors={colors}
              editable={editable}
              selected={selectedField === 'b.kor'}
              onSelect={onSelect}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
