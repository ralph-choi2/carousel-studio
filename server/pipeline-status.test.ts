import { describe, it, expect } from 'vitest';
import { determineStatus } from './pipeline-status';

describe('determineStatus', () => {
  const baseFs = { imagesExist: false, pngExist: false };
  const baseItem = { pages: [] as unknown[], calendar_status: '', drive_url: '' };

  it('returns live when calendar_status = 라이브', () => {
    expect(determineStatus({ ...baseItem, calendar_status: '라이브' }, baseFs)).toBe('live');
  });

  it('returns uploaded when drive_url present', () => {
    expect(determineStatus({ ...baseItem, drive_url: 'https://drive.google.com/x' }, baseFs)).toBe('uploaded');
  });

  it('returns png_ready when output PNG exist', () => {
    expect(determineStatus(baseItem, { imagesExist: true, pngExist: true })).toBe('png_ready');
  });

  it('returns image_ready when only images exist', () => {
    expect(determineStatus(baseItem, { imagesExist: true, pngExist: false })).toBe('image_ready');
  });

  it('returns script_ready when pages is non-empty but no images', () => {
    expect(determineStatus({ ...baseItem, pages: [{ component: 'cover' }] }, baseFs)).toBe('script_ready');
  });

  it('returns empty otherwise', () => {
    expect(determineStatus(baseItem, baseFs)).toBe('empty');
  });

  it('live takes precedence over drive_url', () => {
    expect(determineStatus(
      { ...baseItem, calendar_status: '라이브', drive_url: 'https://x' },
      { imagesExist: true, pngExist: true },
    )).toBe('live');
  });
});
