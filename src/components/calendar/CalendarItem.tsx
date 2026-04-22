import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statusToBadge, type PipelineStatus } from '@/lib/status-mapping';

interface CalendarItemProps {
  row: number;
  title: string;
  status: PipelineStatus;
  /** 'calendar' 이면 editor 로 이동하지 않음 (row 가 음수 합성이라 편집 불가). */
  source?: 'script' | 'calendar';
  /** calendar-only 아이템 클릭 시 열 Drive URL (새 탭). */
  driveUrl?: string;
}

export function CalendarItem({ row, title, status, source, driveUrl }: CalendarItemProps) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const { dotColor } = statusToBadge(status);

  const handleClick = () => {
    if (source === 'calendar') {
      if (driveUrl) window.open(driveUrl, '_blank', 'noopener,noreferrer');
      return; // editor 이동 없음
    }
    navigate(`/editor?row=${row}`);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 8px', borderRadius: 5,
        fontSize: 11.5,
        cursor: source === 'calendar' && !driveUrl ? 'default' : 'pointer',
        background: hover ? '#d1d5db' : '#f3f4f6',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'background 0.12s',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: dotColor,
        flexShrink: 0,
      }} />
      <span style={{
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: '#111', fontWeight: 500,
      }}>{title}</span>
    </div>
  );
}
