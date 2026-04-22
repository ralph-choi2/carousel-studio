import { describe, it, expect } from 'vitest';
import ReactDOMServer from 'react-dom/server';
import { B2bThumbPage, THUMB_WIDTH, THUMB_HEIGHT } from './B2bThumbPage';

describe('B2bThumbPage', () => {
  it('exports 432 x 243 canvas dimensions', () => {
    expect(THUMB_WIDTH).toBe(432);
    expect(THUMB_HEIGHT).toBe(243);
  });

  it('renders title from cover data', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 'Hello\nWorld' }} />
    );
    expect(html).toContain('Hello');
    expect(html).toContain('World');
  });

  it('includes bg_image src when provided', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't', bg_image: 'https://x.com/a.png' }} />
    );
    expect(html).toContain('src="https://x.com/a.png"');
  });

  it('falls back to empty bg when bg_image is absent', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't' }} />
    );
    expect(html).toContain('b2b-thumb-root');
  });

  it('renders logo image from /assets/logo_u_mark.svg', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't' }} />
    );
    expect(html).toContain('/assets/logo_u_mark.svg');
  });

  it('does not render subtitle', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <B2bThumbPage data={{ title: 't', subtitle: '서브타이틀' }} />
    );
    expect(html).not.toContain('서브타이틀');
  });
});
