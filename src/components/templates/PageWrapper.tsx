import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

const BASE_WIDTH = 1080;
const BASE_HEIGHT = 1350;

export function PageWrapper({ children, scale = 1, className = '' }: PageWrapperProps) {
  return (
    <div style={{ width: BASE_WIDTH * scale, height: BASE_HEIGHT * scale, overflow: 'hidden', flexShrink: 0 }}>
      <div className={className} style={{
        width: BASE_WIDTH, height: BASE_HEIGHT, position: 'relative', overflow: 'hidden',
        fontFamily: "'Pretendard', -apple-system, sans-serif", wordBreak: 'keep-all',
        color: '#111111', background: '#F7F7F7',
        transform: `scale(${scale})`, transformOrigin: 'top left',
      }}>
        {children}
      </div>
    </div>
  );
}
