import { LEGEND_STATUSES, statusToBadge } from '@/lib/status-mapping';

export function Legend() {
  return (
    <div style={{
      display: 'flex', gap: 16, fontSize: 12, color: '#6b7280',
      marginBottom: 12, flexWrap: 'wrap',
    }}>
      {LEGEND_STATUSES.map(status => {
        const { label, dotColor } = statusToBadge(status);
        return (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: dotColor,
            }} />
            {label}
          </div>
        );
      })}
    </div>
  );
}
