import { Routes, Route, Navigate } from 'react-router-dom';

function EditorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas-bg text-foreground">
      <h1 className="text-2xl font-semibold">EditorPage</h1>
    </div>
  );
}

function ComponentPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas-bg text-foreground">
      <h1 className="text-2xl font-semibold">ComponentPage</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/editor" replace />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/component" element={<ComponentPage />} />
    </Routes>
  );
}
