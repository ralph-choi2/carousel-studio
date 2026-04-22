import type {
  CoverData,
  IntroData,
  TextCardData,
  SceneCardData,
  ExpressionCardData,
  SimilarData,
  XoCardData,
  BeforeAfterData,
  DialogCardData,
  QuoteCardData,
} from '@/lib/types';

export const SAMPLE_COVER: CoverData = {
  title: '비즈니스 영어\n실전 표현 10선',
  subtitle: '회의에서 바로 쓰는 네이티브 표현',
  bg_prompt: 'modern office meeting room, professional atmosphere, soft natural light, minimal design',
};

export const SAMPLE_INTRO: IntroData = {
  header: '이런 상황, 어떻게 말하세요?',
  body: '회의에서 의견을 제시할 때\n"I think..."만 반복하고 계신가요?\n\n네이티브는 이렇게 말합니다.',
  hook: '당신의 영어가 어색한 이유',
  explanation: '표현의 다양성이 부족하면 아무리 문법이 맞아도 어색하게 들립니다. 이 카드로 자연스러운 비즈니스 영어를 익혀보세요.',
};

export const SAMPLE_TEXT_CARD: TextCardData = {
  header: '왜 "I think"만으로는 부족할까요?',
  body: '네이티브 스피커들은 강도에 따라 다른 표현을 씁니다.\n\n확신이 강할 때 → "I\'m convinced that..."\n의견 제시 시 → "From my perspective..."\n제안할 때 → "It might be worth considering..."',
};

export const SAMPLE_SCENE_CARD: SceneCardData = {
  headline: '회의에서 바로 쓰는 표현',
  header: '상황별 비즈니스 표현',
  headline_label: '핵심 패턴',
  items: [
    {
      label: '의견 제시',
      eng: 'From my perspective, we should prioritize customer retention.',
      kor: '제 관점에서는 고객 유지를 우선시해야 한다고 봅니다.',
    },
    {
      label: '동의하기',
      eng: 'That\'s a valid point. I\'d like to build on that.',
      kor: '타당한 지적입니다. 그 부분을 더 발전시켜 보겠습니다.',
    },
    {
      label: '반론하기',
      eng: 'I see where you\'re coming from, but have you considered...?',
      kor: '말씀하시는 바는 이해하지만, 이 부분은 고려해 보셨나요?',
    },
  ],
};

export const SAMPLE_EXPRESSION_CARD: ExpressionCardData = {
  title: '"동의"를 표현하는 5가지 방법',
  items: [
    {
      title: 'Absolutely.',
      body: '완전히 동의할 때. 열정적이고 강한 긍정.',
    },
    {
      title: 'That makes sense.',
      body: '논리적으로 납득될 때. 중립적이고 전문적인 인상.',
    },
    {
      title: 'You raise a good point.',
      body: '상대의 말을 인정하며 대화를 이어갈 때.',
    },
    {
      title: 'I couldn\'t agree more.',
      body: '강하게 동의하며 연대감을 표현할 때.',
    },
    {
      title: 'Fair enough.',
      body: '완전히 동의하진 않지만 수용할 때.',
    },
  ],
};

export const SAMPLE_SIMILAR: SimilarData = {
  header: '한국어로는 같아 보이지만 뉘앙스가 달라요',
  title: '"확인하다" 영어로는?',
  items: [
    { eng: 'Check', kor: '간단히 확인할 때 (상태 체크)' },
    { eng: 'Confirm', kor: '공식적으로 확정·확인할 때' },
    { eng: 'Verify', kor: '사실 여부를 검증할 때' },
    { eng: 'Review', kor: '꼼꼼히 검토할 때' },
    { eng: 'Make sure', kor: '확실히 하다 (구어체)' },
  ],
};

export const SAMPLE_XO_CARD: XoCardData = {
  title: '이메일에서 자주 하는 실수',
  before: {
    label: '어색한 표현',
    lines: [
      'I want to tell you that the meeting is canceled.',
      'Please do the report by tomorrow.',
      'Sorry for inconvenience.',
    ],
  },
  after: {
    label: '자연스러운 표현',
    lines: [
      'I\'d like to inform you that the meeting has been canceled.',
      'Could you please submit the report by tomorrow?',
      'We apologize for any inconvenience caused.',
    ],
  },
};

export const SAMPLE_BEFORE_AFTER: BeforeAfterData = {
  series: '비즈니스 영어 클리닉',
  situation: '프로젝트 지연을 보고해야 할 때',
  before_eng: 'The project is late because of many problems.',
  before_kor: '여러 문제로 프로젝트가 늦어졌습니다.',
  after_items: [
    {
      eng: 'We\'ve encountered some unforeseen challenges that have impacted our timeline.',
      kor: '예상치 못한 문제들로 인해 일정에 영향이 생겼습니다.',
    },
    {
      eng: 'We\'re currently exploring solutions to get back on track.',
      kor: '일정을 만회하기 위한 해결책을 검토 중입니다.',
    },
  ],
  insight: '부정적인 상황을 전문적으로 전달하려면 구체적이면서도 해결 지향적 표현을 사용하세요.',
};

export const SAMPLE_DIALOG: DialogCardData = {
  title: '면접 영어 — 강점 소개하기',
  a: {
    eng: 'What would you say is your greatest strength?',
    kor: '가장 큰 강점은 무엇인가요?',
  },
  b: {
    eng: 'I\'d say my ability to stay calm under pressure and find practical solutions quickly.',
    kor: '압박 상황에서도 침착함을 유지하며 실용적인 해결책을 빠르게 찾는 능력이라고 생각합니다.',
  },
  bg_prompt: 'professional job interview setting, two people across a desk, warm office lighting',
};

export const SAMPLE_QUOTE: QuoteCardData = {
  quote: 'The limits of my language mean the limits of my world.',
  source: 'Ludwig Wittgenstein',
};

export const SAMPLE_COVER_ORANGE: CoverData = {
  title: '그 언니는\n왜 승진이 빠를까?',
  subtitle: 'AI가 다 해주는 시대에도,\n그녀의 이력서엔 \'영어\'가 있었다.',
};

export const SAMPLE_COVER_DARK: CoverData = {
  title: '로키가 Good이\n아니라 Amaze\n라고 한 이유?',
  subtitle: '영어로 말하는 방법?',
  keyword: 'Amaze',
  bg_image: '/images/test_img.png',
};

export const SAMPLE_COVER_LIGHT: CoverData = {
  title: '당신이 지금 영어를\n시작해야하는 이유',
  subtitle: '더 이상 증명하기 위한 영어가 아니다. \n일하기 위한 영어. \n그리고 그 상대는 AI다.',
};

export const SAMPLE_DATA_MAP: Record<string, unknown> = {
  cover: SAMPLE_COVER,
  'cover-orange': SAMPLE_COVER_ORANGE,
  'cover-dark': SAMPLE_COVER_DARK,
  'cover-light': SAMPLE_COVER_LIGHT,
  intro: SAMPLE_INTRO,
  'text-card': SAMPLE_TEXT_CARD,
  'scene-card': SAMPLE_SCENE_CARD,
  'expression-card': SAMPLE_EXPRESSION_CARD,
  expression: SAMPLE_EXPRESSION_CARD,
  similar: SAMPLE_SIMILAR,
  'xo-card': SAMPLE_XO_CARD,
  'before-after-card': SAMPLE_BEFORE_AFTER,
  situation: SAMPLE_BEFORE_AFTER,
  'dialog-card': SAMPLE_DIALOG,
  'quote-card': SAMPLE_QUOTE,
  'hook-reversal': SAMPLE_INTRO,
  cta: SAMPLE_COVER,
};
