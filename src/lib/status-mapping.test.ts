import { describe, it, expect } from 'vitest';
import { statusToBadge, type PipelineStatus } from './status-mapping';

describe('statusToBadge', () => {
  it('maps empty to 기획중', () => {
    expect(statusToBadge('empty')).toEqual({ label: '기획중', dotColor: '#9ca3af' });
  });

  it('maps script_ready to 스크립트', () => {
    expect(statusToBadge('script_ready')).toEqual({ label: '스크립트', dotColor: '#3b82f6' });
  });

  it('maps image_ready to 제작중', () => {
    expect(statusToBadge('image_ready')).toEqual({ label: '제작중', dotColor: '#f97316' });
  });

  it('maps png_ready to 제작중 (same badge as image_ready)', () => {
    expect(statusToBadge('png_ready')).toEqual({ label: '제작중', dotColor: '#f97316' });
  });

  it('maps uploaded to 발행 준비', () => {
    expect(statusToBadge('uploaded')).toEqual({ label: '발행 준비', dotColor: '#8b5cf6' });
  });

  it('maps live to 라이브', () => {
    expect(statusToBadge('live')).toEqual({ label: '라이브', dotColor: '#10b981' });
  });

  it('falls back to 기획중 for unknown', () => {
    expect(statusToBadge('xxx' as PipelineStatus)).toEqual({ label: '기획중', dotColor: '#9ca3af' });
  });
});
