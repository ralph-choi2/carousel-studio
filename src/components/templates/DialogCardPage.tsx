import { PageWrapper } from './PageWrapper';
import type { PageProps, DialogCardData } from '@/lib/types';

export function DialogCardPage({ data, editable, scale, onDataChange }: PageProps<DialogCardData>) {
  function handleTitleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, title: e.currentTarget.innerText });
    }
  }

  function handleAEngBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, a: { ...data.a, eng: e.currentTarget.innerText } });
    }
  }

  function handleAKorBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, a: { ...data.a, kor: e.currentTarget.innerText } });
    }
  }

  function handleBEngBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, b: { ...data.b, eng: e.currentTarget.innerText } });
    }
  }

  function handleBKorBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (onDataChange) {
      onDataChange({ ...data, b: { ...data.b, kor: e.currentTarget.innerText } });
    }
  }

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
          editable ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#111',
                textAlign: 'center',
                outline: 'none',
                width: '100%',
              }}
            >
              {data.title}
            </div>
          ) : (
            <div style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#111',
              textAlign: 'center',
              width: '100%',
            }}>
              {data.title}
            </div>
          )
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
            {editable ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={handleAEngBlur}
                style={{ fontSize: 38, fontWeight: 700, color: '#222', outline: 'none', minHeight: 46 }}
              >
                {data.a.eng}
              </div>
            ) : (
              <div style={{ fontSize: 38, fontWeight: 700, color: '#222' }}>{data.a.eng}</div>
            )}
            {editable ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={handleAKorBlur}
                style={{ fontSize: 32, fontWeight: 400, color: '#888', outline: 'none', minHeight: 40 }}
              >
                {data.a.kor}
              </div>
            ) : (
              <div style={{ fontSize: 32, fontWeight: 400, color: '#888' }}>{data.a.kor}</div>
            )}
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
            {editable ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBEngBlur}
                style={{ fontSize: 38, fontWeight: 700, color: '#222', outline: 'none', minHeight: 46 }}
              >
                {data.b.eng}
              </div>
            ) : (
              <div style={{ fontSize: 38, fontWeight: 700, color: '#222' }}>{data.b.eng}</div>
            )}
            {editable ? (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBKorBlur}
                style={{ fontSize: 32, fontWeight: 400, color: '#888', outline: 'none', minHeight: 40 }}
              >
                {data.b.kor}
              </div>
            ) : (
              <div style={{ fontSize: 32, fontWeight: 400, color: '#888' }}>{data.b.kor}</div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
