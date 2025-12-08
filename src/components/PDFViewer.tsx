import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Maximize,
  RotateCw,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  url: string;
  title?: string;
}

export function PDFViewer({ url, title = "PDF Document" }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    console.error('PDF load error:', err);
    setError('无法加载PDF文件');
    setLoading(false);
  }, []);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const openFullscreen = () => {
    window.open(url, '_blank');
  };

  const zoomPercentage = Math.round(scale * 100);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-6 bg-card rounded-lg border border-border">
        <FileText className="w-20 h-20 text-destructive" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{error}</h2>
          <p className="text-muted-foreground max-w-md">
            请尝试直接下载或在新窗口中打开PDF文件。
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild size="lg" className="gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Maximize className="w-5 h-5" />
              在新窗口打开
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href={url} download>
              <Download className="w-5 h-5" />
              下载PDF
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border flex-wrap gap-2">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= numPages) {
                  setPageNumber(page);
                }
              }}
              className="w-12 h-8 text-center bg-background border border-border rounded-md text-foreground"
            />
            <span className="text-muted-foreground">/ {numPages || '?'}</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm font-medium w-14 text-center">
            {zoomPercentage}%
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={rotate}
            className="h-8 w-8"
            title="旋转"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={openFullscreen}
            className="h-8 w-8"
            title="全屏"
          >
            <Maximize className="w-4 h-4" />
          </Button>
          
          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="下载">
            <a href={url} download>
              <Download className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        className={cn(
          "flex-1 overflow-auto bg-muted/30 flex justify-center",
          "min-h-[500px] max-h-[calc(100vh-300px)]"
        )}
        style={{ padding: '20px' }}
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        )}
        
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className={cn(loading && 'hidden')}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-muted/50 border-t border-border text-center text-sm text-muted-foreground">
        {title}
      </div>
    </div>
  );
}
