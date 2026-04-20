export type ComponentType =
  | 'cover' | 'intro' | 'text-card' | 'scene-card' | 'expression-card'
  | 'similar' | 'xo-card' | 'before-after-card' | 'dialog-card' | 'quote-card' | 'cta'
  | 'hook-reversal' | 'expression' | 'situation'; // aliases

export interface CarouselMeta {
  date: string;
  title: string;
  pillar?: number;
  format?: string;
  hypothesis?: string;
  target_save?: number;
  series_title?: string;
  category?: string;
  pda?: { persona: string; desire: string; awareness: string; angle: string; };
}

export interface CoverData { title: string; subtitle?: string; bg_prompt?: string; bg_image?: string; }
export interface IntroData { header: string; body: string; hook?: string; explanation?: string; }
export interface TextCardData { header: string; body: string; }
export interface SceneCardItem { label: string; eng?: string; kor?: string; title?: string; body?: string; }
export interface SceneCardData { headline?: string; header?: string; headline_label?: string; bg_prompt?: string; bg_image?: string; items: SceneCardItem[]; }
export interface ExpressionCardItem { title: string; body: string; }
export interface ExpressionCardData { title: string; items: ExpressionCardItem[]; }
export interface SimilarItem { eng: string; kor: string; }
export interface SimilarData { header?: string; title?: string; items: SimilarItem[]; }
export interface XoCardData { title: string; before: { label: string; lines: string[] }; after: { label: string; lines: string[] }; }
export interface BeforeAfterData { series?: string; situation?: string; before_eng: string; before_kor: string; after_items: { eng: string; kor: string }[]; insight?: string; }
export interface DialogCardData { title?: string; a: { eng: string; kor: string }; b: { eng: string; kor: string }; bg_prompt?: string; bg_image?: string; }
export interface QuoteCardData { quote: string; source?: string; }

export type PageData = CoverData | IntroData | TextCardData | SceneCardData | ExpressionCardData | SimilarData | XoCardData | BeforeAfterData | DialogCardData | QuoteCardData | Record<string, never>;

export interface CarouselPage {
  component: ComponentType;
  data: PageData;
  styles?: Record<string, string>;   // 프리셋 오버라이드 (field path → tpl-* class id)
  colors?: Record<string, string>;   // 색상 오버라이드 (field path → CSS var name)
}
export interface CarouselFile { meta: CarouselMeta; pages: CarouselPage[]; }
export interface PageProps<T = PageData> {
  data: T;
  styles?: Record<string, string>;
  colors?: Record<string, string>;
  editable?: boolean;
  scale?: number;
  selectedField?: string;
  onDataChange?: (data: T) => void;
  onSelect?: (field: string, defaultPreset: string, defaultColor?: string) => void;
}
