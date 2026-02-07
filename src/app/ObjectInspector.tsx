import { useState, useEffect, useMemo } from 'react';
import FileInput, { getFileInputHeightClass } from '@/components/FileInput';
import { runTask } from '../utils/workerClient';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import ToolLayout from '@/components/ToolLayout';
import { formatFileSize } from '@/utils/utils';
import { Progress } from '@/components/ui/progress';

type PdfObj = { xref: number; type: string; size: number };

const computeStats = (objects: PdfObj[], totalSizeFromWorker?: number) => {
  const totalObjects = objects.length;

  const totalSize =
    typeof totalSizeFromWorker === 'number'
      ? totalSizeFromWorker
      : objects.reduce((sum, o) => sum + (Number.isFinite(o.size) ? o.size : 0), 0);

  const byType: Record<string, number> = {};
  for (const o of objects) byType[o.type] = (byType[o.type] || 0) + 1;

  const bins: Record<string, number> = {
    '0-1KB': 0,
    '1-10KB': 0,
    '10-100KB': 0,
    '100KB-1MB': 0,
    '1-5MB': 0,
    '5-10MB': 0,
    '>10MB': 0,
  };

  for (const o of objects) {
    const s = o.size;
    if (!Number.isFinite(s) || s <= 0) continue;
    if (s < 1024) bins['0-1KB']++;
    else if (s < 10 * 1024) bins['1-10KB']++;
    else if (s < 100 * 1024) bins['10-100KB']++;
    else if (s < 1024 * 1024) bins['100KB-1MB']++;
    else if (s < 5 * 1024 * 1024) bins['1-5MB']++;
    else if (s < 10 * 1024 * 1024) bins['5-10MB']++;
    else bins['>10MB']++;
  }

  return { totalObjects, totalSize, byType, bins };
};

const ObjectInspector = () => {
  const { files, replaceFiles, removeFile } = usePdfFileManager();
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [objects, setObjects] = useState<PdfObj[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'xref' | 'type' | 'size'>('xref');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setObjects([]);
    setStats(null);
    setProgress(0);
    setProgressMessage('');
  }, [files]);

  const handleSort = (column: 'xref' | 'type' | 'size') => {
    if (sortBy === column) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const sortedObjects = useMemo(() => {
    return [...objects].sort((a, b) => {
      const aVal: any = a[sortBy];
      const bVal: any = b[sortBy];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [objects, sortBy, sortDir]);

  const handleInspect = async () => {
    if (files.length === 0) return;

    const buffer = await files[0].fileHandle.arrayBuffer();
    setObjects([]);

    runTask('getPdfObjectSizes', { buffer })
      .onProgress((p, m) => {
        setProgress(p);
        if (m) setProgressMessage(m);
      })
      .then((res: any) => {
        const raw = Array.isArray(res?.objects) ? res.objects : [];
        const mapped: PdfObj[] = raw.map((o: any) => ({
          xref: Number(o.xref),
          type: String(o.type),
          size: Number(o.size),
        }));

        setObjects(mapped);
        setStats(computeStats(mapped, res?.totalSize));
      })
      .catch((err: any) => {
        console.error('Object inspection failed', err);
      });
  };

  return (
    <ToolLayout
      title="Inspect PDF Objects"
      description={<p>List PDF objects, their type and byte size, and show distribution statistics.</p>}
    >
      <FileInput
        enablePageRange={false}
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
        onFilesChange={replaceFiles}
        className={`w-full ${getFileInputHeightClass(files)}`}
      />

      {files.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start mt-4">
          <MemoizedFileCard
            className="flex grow-0"
            file={files[0]}
            onDelete={() => removeFile(files[0].id)}
          />

          <div className="flex flex-col w-full sm:w-2/3 space-y-4 justify-between">
            <Button className="w-max" onClick={handleInspect}>
              Inspect Objects
            </Button>
            <Progress value={progress} className="w-full mb-2" />
            {progressMessage && (
                <p className="text-sm text-gray-500 mb-4">{progressMessage}</p>
            )}
          </div>
        </div>
      )}

      {stats && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Summary</h3>
            <p>Total objects: {stats.totalObjects}</p>
            <p>Total bytes: {formatFileSize(stats.totalSize)}</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold">By Type</h3>
            <ul>
              {Object.entries(stats.byType).map(([k, v]) => (
                <li key={k}>
                  {k}: {String(v)}
                </li>
              ))}
            </ul>

            <h3 className="font-semibold mt-3">Size distribution</h3>
            <ul>
              {Object.entries(stats.bins).map(([k, v]) => (
                <li key={k}>
                  {k}: {String(v)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {objects.length > 0 && (
        <div className="mt-6 overflow-auto max-h-96 border rounded">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2 cursor-pointer hover:bg-accent" onClick={() => handleSort('xref')}>
                  XRef {sortBy === 'xref' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 cursor-pointer hover:bg-accent" onClick={() => handleSort('type')}>
                  Type {sortBy === 'type' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 cursor-pointer hover:bg-accent text-right" onClick={() => handleSort('size')}>
                  Size {sortBy === 'size' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedObjects.map((o) => (
                <tr key={o.xref} className="border-t">
                  <td className="p-2">{o.xref}</td>
                  <td className="p-2">{o.type}</td>
                  <td className="p-2 text-right">{formatFileSize(o.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolLayout>
  );
};

export default ObjectInspector;
