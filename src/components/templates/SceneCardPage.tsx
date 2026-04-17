import type { PageProps, SceneCardData } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { htmlToText } from '@/lib/utils';

export function SceneCardPage({ data, scale = 1, editable = false, onDataChange }: PageProps<SceneCardData>) {
  const items = data.items ?? [];
  const iconColors = ['#AAAAAA', '#111111'];

  const hasBg = !!data.bg_image;

  const handleHeadlineBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, headline: htmlToText(e.currentTarget.innerHTML) });
    }
  };

  const handleItemBlur = (index: number, field: 'eng' | 'kor', e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: htmlToText(e.currentTarget.innerHTML) };
      onDataChange({ ...data, items: newItems });
    }
  };

  return (
    <PageWrapper scale={scale} className="scene-card-page">
      {/* Base background color */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000000', zIndex: 0 }} />

      {/* Background image */}
      {hasBg ? (
        <img
          src={data.bg_image}
          alt=""
          style={{
            position: 'absolute',
            top: -120,
            left: -40,
            width: 'calc(100% + 80px)',
            height: 'calc(100% + 200px)',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            zIndex: 0,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -40,
            width: 'calc(100% + 80px)',
            height: 'calc(100% + 200px)',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            zIndex: 0,
          }}
        />
      )}

      {/* Dim overlay */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: -40,
          width: 'calc(100% + 80px)',
          height: 'calc(100% + 200px)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content container */}
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          bottom: 110,
          left: 0,
          width: '100%',
          padding: '0 70px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Main headline */}
        {(data.headline || data.header) && (
          <div
            className="tpl-section-subtitle"
            style={{ color: '#FFFFFF', textAlign: 'center', marginBottom: 40, width: '100%' }}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? handleHeadlineBlur : undefined}
          >
            {data.headline ?? data.header}
          </div>
        )}

        {/* Card box */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 40,
            padding: '60px 50px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            boxSizing: 'border-box',
          }}
        >
          {items.map((item, i) => {
            const isIconImage = item.label === 'icon_x' || item.label === 'icon_check';
            const iconSrc = item.label === 'icon_x' ? '/assets/icon_x.png' : '/assets/icon_check.png';
            const iconColor = iconColors[i % iconColors.length];
            const isLast = i === items.length - 1;
            const engText = item.eng ?? item.title ?? '';
            const korText = item.kor ?? item.body ?? '';

            return (
              <div key={i}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 35,
                  }}
                >
                  {/* Icon */}
                  {isIconImage ? (
                    <img
                      src={iconSrc}
                      alt={item.label}
                      style={{ width: 52, height: 52, flexShrink: 0, marginTop: 5 }}
                    />
                  ) : (
                    <div
                      style={{
                        flexShrink: 0,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: iconColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: 32,
                        fontWeight: 800,
                        marginTop: 5,
                      }}
                    >
                      {item.label}
                    </div>
                  )}

                  {/* Text group */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    {engText && (
                      <div
                        className="tpl-card-english"
                        style={{ color: '#222222' }}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        onBlur={editable ? (e) => handleItemBlur(i, 'eng', e) : undefined}
                      >
                        {engText}
                      </div>
                    )}
                    {korText && (
                      <div
                        className="tpl-card-korean"
                        style={{ color: '#888888' }}
                        contentEditable={editable}
                        suppressContentEditableWarning
                        onBlur={editable ? (e) => handleItemBlur(i, 'kor', e) : undefined}
                      >
                        {korText}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider between items */}
                {!isLast && (
                  <div
                    style={{
                      width: '100%',
                      borderTop: '3px dashed #E0E0E0',
                      margin: '40px 0',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
