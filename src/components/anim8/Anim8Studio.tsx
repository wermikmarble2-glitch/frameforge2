"use client";
import React, { useEffect, useCallback, useState } from 'react';
import { useAnim8State, getInitialState } from '@/hooks/useAnim8State';
import Toolbar from './Toolbar';
import LayersPanel from './LayersPanel';
import Timeline from './Timeline';
import CanvasArea from './CanvasArea';
import { Button } from '@/components/ui/button';
import { Download, Upload, Play, Pause, FastForward, FileZip } from 'lucide-react';
import JSZip from 'jszip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Anim8Studio = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { state, dispatch, canvasRef, thumbnailRef } = useAnim8State(getInitialState(800, 600));

  const {
    animation,
    currentFrameId,
    currentLayerId,
    isPlaying,
    fps,
  } = state;

  useEffect(() => {
    setIsMounted(true);
    const initialCanvas = document.createElement('canvas');
    initialCanvas.width = animation.width;
    initialCanvas.height = animation.height;
    canvasRef.current[state.currentLayerId] = initialCanvas;
  }, []);

  const handleNextFrame = useCallback(() => {
    const currentIndex = animation.frames.findIndex(f => f.id === currentFrameId);
    const nextIndex = (currentIndex + 1) % animation.frames.length;
    dispatch({ type: 'SET_CURRENT_FRAME', frameId: animation.frames[nextIndex].id });
  }, [animation.frames, currentFrameId, dispatch]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(handleNextFrame, 1000 / fps);
      return () => clearInterval(interval);
    }
  }, [isPlaying, fps, handleNextFrame]);
  
  const handleExportSequence = async () => {
    const zip = new JSZip();
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = animation.width;
    tempCanvas.height = animation.height;
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) return;

    for (let i = 0; i < animation.frames.length; i++) {
        const frame = animation.frames[i];
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        for (const layer of frame.layers) {
            if (layer.isVisible && canvasRef.current[layer.id]) {
                ctx.drawImage(canvasRef.current[layer.id], 0, 0);
            }
        }
        
        const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        if (blob) {
            zip.file(`frame_${String(i).padStart(4, '0')}.png`, blob);
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${animation.name}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProject = async () => {
    const zip = new JSZip();
    const srcFolder = zip.folder('src');
    
    // This is a simplified example. In a real scenario, you would fetch file contents.
    // For this environment, we'll just add a placeholder.
    // In a real app, you would recursively fetch all files in the /src directory.
    const filesToInclude = [
      'app/layout.tsx',
      'app/page.tsx',
      'components/anim8/Anim8Studio.tsx',
      'components/anim8/CanvasArea.tsx',
      'components/anim8/LayersPanel.tsx',
      'components/anim8/Timeline.tsx',
      'components/anim8/Toolbar.tsx',
      'hooks/useAnim8State.ts',
      'lib/anim8-types.ts',
      'lib/utils.ts',
      'app/globals.css',
      'tailwind.config.ts',
      'next.config.ts',
      'package.json',
      'tsconfig.json',
      'README.md',
    ];

    const fileContents: Record<string, string> = {
      'app/layout.tsx': `import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Anim8',
  description: 'A simple animation tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}`,
      'app/page.tsx': `import Anim8Studio from '@/components/anim8/Anim8Studio';

export default function Home() {
  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
      <Anim8Studio />
    </div>
  );
}`,
      'components/anim8/Anim8Studio.tsx': document.querySelector('script[src*="Anim8Studio"]')?.innerText,
      'components/anim8/CanvasArea.tsx': document.querySelector('script[src*="CanvasArea"]')?.innerText,
      'components/anim8/LayersPanel.tsx': document.querySelector('script[src*="LayersPanel"]')?.innerText,
      'components/anim8/Timeline.tsx': document.querySelector('script[src*="Timeline"]')?.innerText,
      'components/anim8/Toolbar.tsx': document.querySelector('script[src*="Toolbar"]')?.innerText,
      'hooks/useAnim8State.ts': document.querySelector('script[src*="useAnim8State"]')?.innerText,
      'lib/anim8-types.ts': document.querySelector('script[src*="anim8-types"]')?.innerText,
    };

    // This is a simplified representation. A full implementation would need to fetch
    // all project files, which is beyond the scope of this environment.
    // We will add the current file and a few others as an example.
    const allFiles = {
      'src/app/page.tsx': (await import('!!raw-loader!@/app/page.tsx')).default,
      'src/app/layout.tsx': (await import('!!raw-loader!@/app/layout.tsx')).default,
      'src/components/anim8/Anim8Studio.tsx': (await import('!!raw-loader!@/components/anim8/Anim8Studio.tsx')).default,
      'src/components/anim8/CanvasArea.tsx': (await import('!!raw-loader!@/components/anim8/CanvasArea.tsx')).default,
      'src/components/anim8/LayersPanel.tsx': (await import('!!raw-loader!@/components/anim8/LayersPanel.tsx')).default,
      'src/components/anim8/Timeline.tsx': (await import('!!raw-loader!@/components/anim8/Timeline.tsx')).default,
      'src/components/anim8/Toolbar.tsx': (await import('!!raw-loader!@/components/anim8/Toolbar.tsx')).default,
      'src/hooks/useAnim8State.ts': (await import('!!raw-loader!@/hooks/useAnim8State.ts')).default,
      'src/lib/anim8-types.ts': (await import('!!raw-loader!@/lib/anim8-types.ts')).default,
       'src/lib/utils.ts': (await import('!!raw-loader!@/lib/utils.ts')).default,
       'src/app/globals.css': (await import('!!raw-loader!@/app/globals.css')).default,
       'tailwind.config.ts': (await import('!!raw-loader!../../../tailwind.config.ts')).default,
       'package.json': (await import('!!raw-loader!../../../package.json')).default,
       'tsconfig.json': (await import('!!raw-loader!../../../tsconfig.json')).default,
       'README.md': (await import('!!raw-loader!../../../README.md')).default,
    };

    for (const [path, content] of Object.entries(allFiles)) {
        zip.file(path, content);
    }
    
    zip.file("state.json", JSON.stringify(state, null, 2));


    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `anim8-project.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <TooltipProvider>
      <div className="grid h-full w-full grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] bg-background">
        <header className="col-span-3 flex h-14 items-center justify-between border-b px-4">
          <h1 className="text-xl font-headline font-bold text-primary">Anim8</h1>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => dispatch({ type: 'TOGGLE_PLAYING' })}>
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => {
                        const count = parseInt(prompt("How many in-between frames?", "2") || "0");
                        if(count > 0) dispatch({type: 'ADD_INBETWEENS', frameId: currentFrameId, count})
                    }}>
                        <FastForward />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Add In-betweens</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleExportSequence}>
                  <Download />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export PNG Sequence</TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => alert("This is a simplified example. In a real app, this would download all source files.")}>
                  <FileZip />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download Project (.zip)</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <aside className="row-start-2 flex flex-col border-r p-2">
          <Toolbar state={state} dispatch={dispatch} />
        </aside>

        <main className="row-start-2 overflow-hidden bg-muted/20 flex items-center justify-center p-4">
          <CanvasArea state={state} dispatch={dispatch} canvasRef={canvasRef} thumbnailRef={thumbnailRef} />
        </main>

        <aside className="row-start-2 border-l p-2">
          <LayersPanel state={state} dispatch={dispatch} />
        </aside>

        <footer className="col-span-3 row-start-3 border-t">
          <Timeline state={state} dispatch={dispatch} thumbnailRef={thumbnailRef} />
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default Anim8Studio;
