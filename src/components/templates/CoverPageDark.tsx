import { useRef } from 'react';
import { PageWrapper } from './PageWrapper';
import { htmlToText } from '@/lib/utils';
import type { PageProps, CoverData } from '@/lib/types';

const KEYWORD_GRADIENT = 'linear-gradient(180deg, #FFFFFF 0%, #FF7801 100%)';

/** "keyword" 단어를 오렌지 그라디언트로 감싼 innerHTML 생성 */
function buildTitleHtml(title: string, keyword: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = title.split('\n');
  return lines
    .map((line) => {
      if (!keyword || !line.includes(keyword)) return esc(line);
      const idx = line.indexOf(keyword);
      const before = esc(line.slice(0, idx));
      const kw = esc(keyword);
      const after = esc(line.slice(idx + keyword.length));
      const gradStyle = [
        'background:' + KEYWORD_GRADIENT,
        '-webkit-background-clip:text',
        '-webkit-text-fill-color:transparent',
        'background-clip:text',
        'display:inline',
      ].join(';');
      return `${before}<span style="${gradStyle}">${kw}</span>${after}`;
    })
    .join('<br/>');
}

export function CoverPageDark({
  data, editable, scale, selectedField, onDataChange, onSelect,
}: PageProps<CoverData>) {
  const keyword = data.keyword ?? '';
  const titleRef = useRef<HTMLDivElement>(null);

  const titleHtml = buildTitleHtml(data.title, keyword);

  return (
    <PageWrapper scale={scale}>
      {/* ── 배경 ── */}
      <div style={{ position: 'absolute', inset: 0, background: '#030002', zIndex: 0 }} />

      {/* ── 사진 (캔버스 전체) ── */}
      {data.bg_image && (
        <img
          src={data.bg_image}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />
      )}

      {/* ── 타이틀 (키워드 그라디언트 포함) ── */}
      <div
        ref={titleRef}
        className="tpl-cover-dark-title"
        contentEditable={editable}
        suppressContentEditableWarning
        style={{
          position: 'absolute',
          left: 100, top: 150,
          width: 880,
          zIndex: 4,
          outline: 'none',
          ...(editable && selectedField === 'title'
            ? { boxShadow: '0 0 0 2px rgba(143,84,255,0.6)', borderRadius: 4 }
            : {}),
        }}
        dangerouslySetInnerHTML={{ __html: titleHtml }}
        onFocus={() => onSelect?.('title', 'tpl-cover-dark-title', '--tpl-text-white')}
        onBlur={(e) => {
          const next = htmlToText((e.currentTarget as HTMLElement).innerHTML);
          if (next !== data.title) onDataChange?.({ ...data, title: next });
        }}
      />

      {/* ── BI 로고 우하단 ── */}
      <div style={{
        position: 'absolute',
        right: 100, bottom: 100,
        zIndex: 5,
        opacity: 0.7,
      }}>
        <img
          src="/assets/bi_uphone.png"
          alt="Uphone"
          style={{ display: 'block', width: 240, height: 54, objectFit: 'contain' }}
        />
      </div>
    </PageWrapper>
  );
}
