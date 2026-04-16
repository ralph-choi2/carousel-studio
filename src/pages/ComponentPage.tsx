import { useNavigate } from 'react-router-dom';
import { COMPONENT_MAP, TEMPLATE_TYPES } from '@/components/templates';
import { SAMPLE_DATA_MAP } from '@/lib/sample-data';
import { Toolbar } from '@/components/toolbar/Toolbar';

const SCALE = 200 / 1080;

const COLORS = [
  { name: 'bg-light', hex: '#F7F7F7' },
  { name: 'bg-dark', hex: '#141420' },
  { name: 'text-primary', hex: '#111111' },
  { name: 'text-secondary', hex: '#545454' },
  { name: 'text-tertiary', hex: '#999999' },
  { name: 'accent-purple', hex: '#8F54FF' },
  { name: 'white', hex: '#FFFFFF' },
];

const TYPOGRAPHY_STYLES = [
  { name: 'Cover Title', size: '90px', weight: 'Bold 800' },
  { name: 'Cover Subtitle', size: '48px', weight: 'SemiBold 600' },
  { name: 'Section Title', size: '42px', weight: 'Bold 700' },
  { name: 'Body Text', size: '42px', weight: 'ExtraLight 200' },
  { name: 'Card English', size: '44px', weight: 'Noto Sans Bold' },
  { name: 'Card Korean', size: '42px', weight: 'SemiBold 600' },
  { name: 'Quote', size: '50px', weight: 'SemiBold 600' },
  { name: 'Source', size: '24px', weight: 'SemiBold 600' },
];

export function ComponentPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Toolbar
        files={[]}
        currentFile={null}
        onFileSelect={() => {}}
        zoom={50}
        onZoomChange={() => {}}
        isDirty={false}
        onSave={() => {}}
        onExport={() => {}}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        {/* Templates section */}
        <section>
          <h2 className="text-base font-semibold mb-4">
            Templates ({TEMPLATE_TYPES.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {TEMPLATE_TYPES.map((type) => {
              const Component = COMPONENT_MAP[type];
              const data = SAMPLE_DATA_MAP[type];
              if (!Component || !data) return null;
              return (
                <button
                  key={type}
                  onClick={() => navigate('/editor')}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div
                    className="overflow-hidden rounded-lg ring-1 ring-border group-hover:ring-2 group-hover:ring-primary transition-all"
                    style={{ width: 200, height: 200 }}
                  >
                    <Component
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      data={data as any}
                      scale={SCALE}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{type}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Design Tokens section */}
        <section>
          <h2 className="text-base font-semibold mb-4">Design Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors card */}
            <div className="rounded-lg border bg-card p-5 space-y-3">
              <h3 className="text-sm font-medium">Colors</h3>
              <div className="space-y-2">
                {COLORS.map(({ name, hex }) => (
                  <div key={name} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-md shrink-0 border border-border"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="flex gap-2 text-xs">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">{hex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography card */}
            <div className="rounded-lg border bg-card p-5 space-y-3">
              <h3 className="text-sm font-medium">Typography</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left pb-2 font-medium">Style</th>
                    <th className="text-left pb-2 font-medium">Size</th>
                    <th className="text-left pb-2 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TYPOGRAPHY_STYLES.map(({ name, size, weight }) => (
                    <tr key={name}>
                      <td className="py-1.5 font-medium">{name}</td>
                      <td className="py-1.5 text-muted-foreground">{size}</td>
                      <td className="py-1.5 text-muted-foreground">{weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
