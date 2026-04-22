import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statusToBadge, type PipelineStatus } from '@/lib/status-mapping';

interface CalendarItemProps {
  row: number;
  title: string;
  status: PipelineStatus;
  /** 'calendar' (발행 이력) 도 동일하게 /editor?row=<음수> 로 이동. 에디터가 graceful-empty 처리. */
  source?: 'script' | 'calendar';
  /** 현재 사용 안 함. 추후 'View published' 버튼 등으로 활용 예정. */
  driveUrl?: string;
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
        overflow: 'hidden',
        // 부모 cell(minWidth:0) 안에서 자기도 min-width:0 유지
        minWidth: 0, maxWidth: '100%',
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
        minWidth: 0,
      }}>{title}</span>
    </div>
  );
}
