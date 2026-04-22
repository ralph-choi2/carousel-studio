import { useCallback, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import type { CarouselFile, CoverData } from '@/lib/types';
import { COMPONENT_MAP } from '@/components/templates';
import { B2bThumbPage } from '@/components/templates/B2bThumbPage';
import templatesCss from '@/styles/templates.css?raw';

const BASE_CSS = `
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraLight.woff2') format('woff2'); font-weight: 200; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Light.woff2') format('woff2'); font-weight: 300; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: swap; }
@font-face { font-family: 'Noto Sans KR'; src: url('https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuozeLTq8H4hGPNdCCehzJE.0.woff2') format('woff2'); font-weight: 700; font-display: swap; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px;
  height: 1350px;
  overflow: hidden;
  font-family: 'Pretendard', -apple-system, sans-serif;
  word-break: keep-all;
  color: #111111;
  background: #F7F7F7;
}
:root {
  --tpl-bg-light: #F7F7F7;
  --tpl-bg-dark: #141420;
  --tpl-text-primary: #111111;
  --tpl-text-secondary: #545454;
  --tpl-text-tertiary: #999999;
  --tpl-text-white: #FFFFFF;
  --tpl-accent-purple: #8F54FF;
}
`;

const THUMB_CSS = `
@font-face { font-family: 'Pretendard'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 432px; height: 243px; overflow: hidden; font-family: 'Pretendard', -apple-system, sans-serif; word-break: keep-all; background: #FFFFFF; }
`;

function wrapHtml(markup: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BASE_CSS}\n${templatesCss}</style></head><body>${markup}</body></html>`;
}

function wrapThumbHtml(markup: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${THUMB_CSS}</style></head><body>${markup}</body></html>`;
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const doExport = useCallback(async (filename: string, data: CarouselFile) => {
    setIsExporting(true);
    try {
      const htmlPages = data.pages.map((page, index) => {
        const Component = COMPONENT_MAP[page.component];
        if (!Component) return { index, component: page.component, html: '' };
        const markup = ReactDOMServer.renderToStaticMarkup(
          <Component
            data={page.data}
            styles={page.styles}
            colors={page.colors}
            scale={1}
          />
        );
        return { index, component: page.component, html: wrapHtml(markup) };
      });

      const coverPage = data.pages.find(p => p.component === 'cover');
      const thumbHtml = coverPage
        ? wrapThumbHtml(
            ReactDOMServer.renderToStaticMarkup(
              <B2bThumbPage data={coverPage.data as CoverData} scale={1} />
            )
          )
        : undefined;

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, htmlPages, thumbHtml }),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const result = await res.json();
      return result.outputDir as string;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { isExporting, doExport };
}
