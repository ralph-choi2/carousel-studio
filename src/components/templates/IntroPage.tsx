import type { IntroData, PageProps } from '@/lib/types';
import { PageWrapper } from './PageWrapper';
import { htmlToText } from '@/lib/utils';

export function IntroPage({ data, editable = false, scale, onDataChange }: PageProps<IntroData>) {
  const header = data.header || data.hook || '';
  const body = data.body || data.explanation || '';

  const handleHeaderBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, header: htmlToText(e.currentTarget.innerHTML) });
    }
  };

  const handleBodyBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (onDataChange) {
      onDataChange({ ...data, body: htmlToText(e.currentTarget.innerHTML) });
    }
  };

  return (
    <PageWrapper scale={scale}>
      {/* Background texture */}
      <img
        src="/assets/bg.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div
          className="tpl-section-title"
          style={{ marginBottom: '50px' }}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? handleHeaderBlur : undefined}
        >
          {header}
        </div>

        <div
          className="tpl-body-text"
          style={{ maxWidth: '860px', marginBottom: '100px' }}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? handleBodyBlur : undefined}
        >
          {body}
        </div>
      </div>

      {/* Bottom logo */}
      <img
        src="/assets/bi_gray.png"
        alt="logo"
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          height: 'auto',
          zIndex: 3,
        }}
      />
    </PageWrapper>
  );
}
