import type { PageProps, SceneCardData } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { EditableText } from '@/components/common/EditableText';

export function SceneCardPage({ data, styles, colors, editable = false, scale = 1, selectedField, onDataChange, onSelect }: PageProps<SceneCardData>) {
  const items = data.items ?? [];
  const iconColors = ['#AAAAAA', '#111111'];

  const hasBg = !!data.bg_image;

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
          <EditableText
            field="headline"
            defaultPreset="tpl-section-subtitle"
            defaultColor="--tpl-text-white"
            value={data.headline ?? data.header ?? ''}
            onChange={(v) => onDataChange?.({ ...data, headline: v })}
            styles={styles}
            colors={colors}
            editable={editable}
            selected={selectedField === 'headline'}
            onSelect={onSelect}
            style={{ textAlign: 'center', marginBottom: 40, width: '100%' }}
          />
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
                      <EditableText
                        field={`items.${i}.eng`}
                        defaultPreset="tpl-card-english"
                        defaultColor="#222222"
                        value={engText}
                        onChange={(v) => {
                          const newItems = [...items];
                          newItems[i] = { ...item, eng: v };
                          onDataChange?.({ ...data, items: newItems });
                        }}
                        styles={styles}
                        colors={colors}
                        editable={editable}
                        selected={selectedField === `items.${i}.eng`}
                        onSelect={onSelect}
                      />
                    )}
                    {korText && (
                      <EditableText
                        field={`items.${i}.kor`}
                        defaultPreset="tpl-card-korean"
                        defaultColor="#888888"
                        value={korText}
                        onChange={(v) => {
                          const newItems = [...items];
                          newItems[i] = { ...item, kor: v };
                          onDataChange?.({ ...data, items: newItems });
                        }}
                        styles={styles}
                        colors={colors}
                        editable={editable}
                        selected={selectedField === `items.${i}.kor`}
                        onSelect={onSelect}
                      />
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
