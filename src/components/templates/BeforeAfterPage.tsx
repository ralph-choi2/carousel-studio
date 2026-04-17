import type { BeforeAfterData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { htmlToText } from '@/lib/utils';

export function BeforeAfterPage({ data, scale = 1, editable = false, onDataChange }: PageProps<BeforeAfterData>) {
  const handleFieldBlur = (field: string, e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, [field]: htmlToText(e.currentTarget.innerHTML) });
    }
  };

  const handleAfterItemBlur = (index: number, field: 'eng' | 'kor', e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      const newItems = [...data.after_items];
      newItems[index] = { ...newItems[index], [field]: htmlToText(e.currentTarget.innerHTML) };
      onDataChange({ ...data, after_items: newItems });
    }
  };

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
          <div
            className="tpl-source-citation"
            style={{ color: '#8F54FF' }}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? (e) => handleFieldBlur('series', e) : undefined}
          >
            {data.series}
          </div>
        )}

        {/* Situation */}
        {data.situation && (
          <div
            className="tpl-cover-subtitle"
            style={{ color: '#111' }}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? (e) => handleFieldBlur('situation', e) : undefined}
          >
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
          <div
            className="tpl-card-english"
            style={{ color: '#222' }}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? (e) => handleFieldBlur('before_eng', e) : undefined}
          >
            {data.before_eng}
          </div>
          <div
            className="tpl-card-korean"
            style={{ color: '#888', marginTop: 8 }}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? (e) => handleFieldBlur('before_kor', e) : undefined}
          >
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
              <div
                className="tpl-card-english"
                style={{ color: '#FFFFFF' }}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={editable ? (e) => handleAfterItemBlur(i, 'eng', e) : undefined}
              >
                {item.eng}
              </div>
              <div
                className="tpl-card-korean"
                style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={editable ? (e) => handleAfterItemBlur(i, 'kor', e) : undefined}
              >
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
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? (e) => handleFieldBlur('insight', e) : undefined}
          >
            {data.insight}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
