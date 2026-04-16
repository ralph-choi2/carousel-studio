import { PageWrapper } from './PageWrapper';
import type { PageProps } from '@/lib/types';

export function CtaPage({ scale }: PageProps<Record<string, never>>) {
  return (
    <PageWrapper scale={scale}>
      <img src="/assets/cta.png" alt="CTA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </PageWrapper>
  );
}
