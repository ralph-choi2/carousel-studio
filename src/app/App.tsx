import { Routes, Route, Navigate } from 'react-router-dom';
import { EditorPage } from '@/pages/EditorPage';
import { ComponentPage } from '@/pages/ComponentPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/editor" replace />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/component" element={<ComponentPage />} />
    </Routes>
  );
}
