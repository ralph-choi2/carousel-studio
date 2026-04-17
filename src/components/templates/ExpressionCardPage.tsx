import type { PageProps, ExpressionCardData } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { htmlToText } from '@/lib/utils';

export function ExpressionCardPage({ data, scale = 1, editable = false, onDataChange }: PageProps<ExpressionCardData>) {
  const items = data.items ?? [];

  const handleTitleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, title: htmlToText(e.currentTarget.innerHTML) });
    }
  };

  const handleItemBlur = (index: number, field: 'title' | 'body', e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: htmlToText(e.currentTarget.innerHTML) };
      onDataChange({ ...data, items: newItems });
    }
  };

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
        <div
          className="tpl-section-title"
          style={{ textAlign: 'center', width: '100%' }}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? handleTitleBlur : undefined}
        >
          {data.title}
        </div>

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
              <div
                className="tpl-scene-bold"
                style={{ color: '#111111', marginBottom: item.body ? 16 : 0 }}
                contentEditable={editable}
                suppressContentEditableWarning
                onBlur={editable ? (e) => handleItemBlur(i, 'title', e) : undefined}
              >
                {item.title}
              </div>
              {item.body && (
                <div
                  className="tpl-scene-regular"
                  style={{ color: '#888888' }}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={editable ? (e) => handleItemBlur(i, 'body', e) : undefined}
                >
                  {item.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
