import React from 'react';
import type { CoverData } from '@/lib/types';

export const THUMB_WIDTH = 432;
export const THUMB_HEIGHT = 243;

const FALLBACK_BG = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}"><rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" fill="#111"/></svg>`
);

interface B2bThumbPageProps {
  data: CoverData;
  scale?: number;
}

export function B2bThumbPage({ data, scale = 1 }: B2bThumbPageProps) {
  const bgSrc = data.bg_image || FALLBACK_BG;

  return (
    <div style={{
      width: THUMB_WIDTH * scale,
      height: THUMB_HEIGHT * scale,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div
        className="b2b-thumb-root"
        style={{
          width: THUMB_WIDTH,
          height: THUMB_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          fontFamily: "'Pretendard', -apple-system, sans-serif",
          wordBreak: 'keep-all',
        }}
      >
        <img
          src={bgSrc}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 34.774%, #000 100%)',
          zIndex: 1,
        }} />

        <img
          src="/assets/logo_u_mark.svg"
          alt=""
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 24,
            height: 24,
            opacity: 0.6,
            zIndex: 2,
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '18px 10px',
          zIndex: 3,
        }}>
          <p style={{
            width: 412,
            fontFamily: "'Pretendard', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.3,
            letterSpacing: '-0.64px',
            color: '#FFFFFF',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            margin: 0,
          }}>
            {data.title}
          </p>
        </div>
      </div>
    </div>
  );
}
