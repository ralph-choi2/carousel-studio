import type { ComponentType, PageProps } from '@/lib/types';
import { CoverPage } from './CoverPage';
import { IntroPage } from './IntroPage';
import { TextCardPage } from './TextCardPage';
import { SceneCardPage } from './SceneCardPage';
import { XoCardPage } from './XoCardPage';
import { CtaPage } from './CtaPage';
import type { FC } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPageComponent = FC<PageProps<any>>;

export const COMPONENT_MAP: Partial<Record<ComponentType, AnyPageComponent>> = {
  cover: CoverPage,
  intro: IntroPage,
  'text-card': TextCardPage,
  'scene-card': SceneCardPage,
  'xo-card': XoCardPage,
  cta: CtaPage,
  // aliases — mapped to nearest equivalent
  expression: IntroPage,
  situation: SceneCardPage,
  'hook-reversal': TextCardPage,
};
