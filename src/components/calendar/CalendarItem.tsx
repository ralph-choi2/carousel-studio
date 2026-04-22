import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statusToBadge, type PipelineStatus } from '@/lib/status-mapping';

interface CalendarItemProps {
  row: number;
  title: string;
  status: PipelineStatus;
}

export function CalendarItem({ row, title, status }: CalendarItemProps) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const { dotColor } = statusToBadge(status);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/editor?row=${row}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 8px', borderRadius: 5,
        fontSize: 11.5, cursor: 'pointer',
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
