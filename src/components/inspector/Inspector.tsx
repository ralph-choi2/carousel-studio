import { useState, useMemo } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { TYPOGRAPHY_PRESETS, groupedPresets, getPresetById } from '@/lib/typography-presets';
import { COLOR_TOKENS, groupedTokens, getTokenById } from '@/lib/color-tokens';

export interface InspectorSelection {
  field: string;
  defaultPreset: string;
  defaultColor?: string;
}

interface InspectorProps {
  selection: InspectorSelection | null;
  currentPreset: string | undefined;        // styles[field]
  currentColor: string | undefined;         // colors[field]
  onPresetChange: (field: string, preset: string | null) => void;  // null = reset
  onColorChange: (field: string, token: string | null) => void;
  onResetAll: (field: string) => void;
}

export function Inspector({
  selection,
  currentPreset,
  currentColor,
  onPresetChange,
  onColorChange,
  onResetAll,
}: InspectorProps) {
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = groupedPresets();
    if (!q) return all;
    const result: Record<string, typeof TYPOGRAPHY_PRESETS> = {};
    for (const [group, presets] of Object.entries(all)) {
      const filtered = presets.filter((p) => p.name.toLowerCase().includes(q));
      if (filtered.length > 0) result[group] = filtered;
    }
    return result;
  }, [search]);

  if (!selection) {
    return (
      <aside
        style={{
          width: 280,
          flexShrink: 0,
          background: '#1a1a1a',
          borderLeft: '1px solid #2a2a2a',
          padding: 20,
          color: '#888',
          fontSize: 13,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        텍스트를 선택해주세요
      </aside>
    );
  }

  const { field, defaultPreset, defaultColor } = selection;
  const activePresetId = currentPreset ?? defaultPreset;
  const activePreset = getPresetById(activePresetId);
  const activeColorId = currentColor;
  const activeColor = activeColorId ? getTokenById(activeColorId) : undefined;

  const tokenGroups = groupedTokens();

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: '#1a1a1a',
        borderLeft: '1px solid #2a2a2a',
        padding: 20,
        color: '#ddd',
        fontSize: 13,
        overflowY: 'auto',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Field path */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          Field
        </div>
        <div style={{ fontFamily: 'monospace', color: '#9cb8e0' }}>{field}</div>
      </div>

      {/* Typography section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Typography
        </div>
        <button
          onClick={() => setTypographyOpen((o) => !o)}
          style={{
            width: '100%',
            background: '#222',
            border: '1px solid #333',
            borderRadius: 4,
            padding: '8px 10px',
            color: '#ddd',
            fontFamily: 'monospace',
            fontSize: 12,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{activePreset?.name ?? activePresetId}</span>
          <ChevronDown size={14} />
        </button>

        {typographyOpen && (
          <div style={{ marginTop: 6, background: '#222', border: '1px solid #333', borderRadius: 4, maxHeight: 300, overflowY: 'auto' }}>
            <div style={{ padding: 8, borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={12} color="#666" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ddd',
                  fontSize: 12,
                  flex: 1,
                }}
              />
            </div>
            {Object.entries(filteredGroups).map(([group, presets]) => (
              <div key={group}>
                <div style={{ padding: '6px 10px', fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group}
                </div>
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onPresetChange(field, p.id === defaultPreset ? null : p.id);
                      setTypographyOpen(false);
                      setSearch('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 10px',
                      background: p.id === activePresetId ? '#2f3a55' : 'transparent',
                      border: 'none',
                      color: '#ddd',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { if (p.id !== activePresetId) e.currentTarget.style.background = '#2a2a2a'; }}
                    onMouseLeave={(e) => { if (p.id !== activePresetId) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{p.name}</span>
                    <span
                      style={{
                        fontFamily: p.family === 'Pretendard' ? 'Pretendard, sans-serif' : 'Noto Sans KR, sans-serif',
                        fontWeight: p.weight,
                        fontSize: Math.min(20, Math.max(11, p.size / 5)),
                        color: '#fff',
                        marginLeft: 10,
                      }}
                    >
                      가
                    </span>
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(filteredGroups).length === 0 && (
              <div style={{ padding: 12, color: '#666', fontSize: 12 }}>일치하는 프리셋 없음</div>
            )}
          </div>
        )}
      </div>

      {/* Color section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Color
        </div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
          {activeColor?.name ?? (defaultColor ? `기본 (${defaultColor})` : '기본')}
        </div>
        {Object.entries(tokenGroups).map(([group, tokens]) => (
          <div key={group} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {group}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tokens.map((t) => {
                const selected = activeColorId === t.id;
                return (
                  <button
                    key={t.id}
                    title={t.name}
                    onClick={() => onColorChange(field, selected ? null : t.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: t.hex,
                      border: selected ? '2px solid #8F54FF' : '1px solid #333',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Reset */}
      {(currentPreset || currentColor) && (
        <button
          onClick={() => onResetAll(field)}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #444',
            borderRadius: 4,
            padding: '8px 10px',
            color: '#ccc',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <X size={12} /> Reset
        </button>
      )}
    </aside>
  );
}
