import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Agentation } from 'agentation';
import { EditorPage } from '@/pages/EditorPage';
import { ComponentPage } from '@/pages/ComponentPage';
import { useCarouselData } from '@/hooks/useCarouselData';
import { listDataFiles } from '@/lib/data-loader';

export default function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [zoom, setZoom] = useState(50);
  const carousel = useCarouselData();

  useEffect(() => {
    listDataFiles().then(setFiles).catch(console.error);
  }, []);

  const handleExport = useCallback(async () => {
    alert('Export not yet implemented');
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/editor" replace />} />
        <Route
          path="/editor"
          element={
            <EditorPage
              files={files}
              zoom={zoom}
              onZoomChange={setZoom}
              carousel={carousel}
              onExport={handleExport}
            />
          }
        />
        <Route
          path="/component"
          element={
            <ComponentPage
              files={files}
              zoom={zoom}
              onZoomChange={setZoom}
              carousel={carousel}
            />
          }
        />
      </Routes>
      <Agentation />
    </>
  );
}
