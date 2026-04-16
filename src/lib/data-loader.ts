import type { CarouselFile } from '@/lib/types';

export async function listDataFiles(): Promise<string[]> {
  const res = await fetch('/api/files');
  if (!res.ok) throw new Error(`Failed to list files: ${res.statusText}`);
  return res.json() as Promise<string[]>;
}

export async function loadCarouselFile(filename: string): Promise<CarouselFile> {
  const res = await fetch(`/api/files/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error(`Failed to load file "${filename}": ${res.statusText}`);
  return res.json() as Promise<CarouselFile>;
}

export async function saveCarouselFile(filename: string, data: CarouselFile): Promise<void> {
  const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save file "${filename}": ${res.statusText}`);
}

export async function exportPng(filename: string, pages: number[]): Promise<void> {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, pages }),
  });
  if (!res.ok) throw new Error(`Failed to export "${filename}": ${res.statusText}`);
}
