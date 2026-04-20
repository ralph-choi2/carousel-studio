import { describe, it, expect } from 'vitest';
import { resolveClassName, resolveColor } from './styles';

describe('resolveClassName', () => {
  it('returns defaultPreset when styles is undefined', () => {
    expect(resolveClassName('title', undefined, 'tpl-cover-title')).toBe('tpl-cover-title');
  });

  it('returns defaultPreset when field missing in styles', () => {
    expect(resolveClassName('title', { subtitle: 'tpl-body' }, 'tpl-cover-title')).toBe('tpl-cover-title');
  });

  it('returns styles[field] when present', () => {
    expect(resolveClassName('title', { title: 'tpl-section-title' }, 'tpl-cover-title')).toBe('tpl-section-title');
  });
});

describe('resolveColor', () => {
  it('returns undefined when no override and no defaultColor', () => {
    expect(resolveColor('title', undefined, undefined)).toBeUndefined();
  });

  it('returns hex defaultColor as-is', () => {
    expect(resolveColor('title', undefined, '#111')).toBe('#111');
  });

  it('wraps CSS var name defaultColor in var()', () => {
    expect(resolveColor('title', undefined, '--tpl-text-white')).toBe('var(--tpl-text-white)');
  });

  it('returns CSS var() when override present', () => {
    expect(resolveColor('title', { title: '--tpl-text-primary' }, '#111')).toBe('var(--tpl-text-primary)');
  });

  it('falls back to defaultColor when field missing in colors', () => {
    expect(resolveColor('title', { subtitle: '--tpl-text-secondary' }, '#111')).toBe('#111');
  });
});
