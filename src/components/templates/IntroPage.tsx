import type { IntroData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';

export function IntroPage({ data, styles, colors, editable = false, scale, selectedField, onDataChange, onSelect }: PageProps<IntroData>) {
  const header = data.header || data.hook || '';
  const body = data.body || data.explanation || '';

  return (
    <PageWrapper scale={scale}>
      {/* Background texture */}
      <img
        src="/assets/bg.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <EditableText
          field="header"
          defaultPreset="tpl-body-primary"
          value={header}
          onChange={(v) => onDataChange?.({ ...data, header: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'header'}
          onSelect={onSelect}
          style={{ marginBottom: '50px', textAlign: 'center' }}
        />

        <EditableText
          field="body"
          defaultPreset="tpl-body-secondary"
          value={body}
          onChange={(v) => onDataChange?.({ ...data, body: v })}
          styles={styles}
          colors={colors}
          editable={editable}
          selected={selectedField === 'body'}
          onSelect={onSelect}
          style={{ maxWidth: '860px', marginBottom: '100px', textAlign: 'center' }}
        />
      </div>
    </PageWrapper>
  );
}
