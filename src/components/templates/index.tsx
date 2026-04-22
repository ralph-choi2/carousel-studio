import type { ComponentType as ReactComponentType, FC } from 'react';
import type { ComponentType, PageProps } from '@/lib/types';
import { CoverPage } from './CoverPage';
import { CoverPageOrange } from './CoverPageOrange';
import { CoverPageDark } from './CoverPageDark';
import { CoverPageLight } from './CoverPageLight';
import { IntroPage } from './IntroPage';
import { TextCardPage } from './TextCardPage';
import { SceneCardPage } from './SceneCardPage';
import { ExpressionCardPage } from './ExpressionCardPage';
import { SimilarPage } from './SimilarPage';
import { XoCardPage } from './XoCardPage';
import { BeforeAfterPage } from './BeforeAfterPage';
import { DialogCardPage } from './DialogCardPage';
import { QuotePage } from './QuotePage';
import { CtaPage } from './CtaPage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPageComponent = FC<PageProps<any>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const COMPONENT_MAP: Record<string, ReactComponentType<PageProps<any>>> = {
  'cover': CoverPage,
  'cover-orange': CoverPageOrange,
  'cover-dark': CoverPageDark,
  'cover-light': CoverPageLight,
  'intro': IntroPage,
  'hook-reversal': IntroPage,
  'text-card': TextCardPage,
  'expression': TextCardPage,
  'summary': TextCardPage,
  'situation': TextCardPage,
  'scene-card': SceneCardPage,
  'expression-card': ExpressionCardPage,
  'similar': SimilarPage,
  'xo-card': XoCardPage,
  'before-after-card': BeforeAfterPage,
  'dialog-card': DialogCardPage,
  'quote-card': QuotePage,
  'cta': CtaPage,
};

export const TEMPLATE_TYPES = [
  'cover', 'cover-orange', 'cover-dark', 'cover-light',
  'intro', 'text-card', 'scene-card', 'expression-card',
  'similar', 'xo-card', 'before-after-card', 'dialog-card', 'quote-card', 'cta',
] as const;

export function getPageComponent(type: ComponentType): AnyPageComponent {
  return COMPONENT_MAP[type] ?? COMPONENT_MAP['intro'];
}

export { CoverPage, CoverPageOrange, CoverPageDark, CoverPageLight, IntroPage, TextCardPage, SceneCardPage, ExpressionCardPage, SimilarPage, XoCardPage, BeforeAfterPage, DialogCardPage, QuotePage, CtaPage };
