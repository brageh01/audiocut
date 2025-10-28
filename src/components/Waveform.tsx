'use client';
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer, { type WaveSurferOptions } from 'wavesurfer.js';

interface WaveformProps {
  file: File;
}

const formatTime = (t: number) => {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60).toString();
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * Waveform component
 * ------------------
 * Uses wavesurfer.js to visualize and control playback of an uploaded audio file.
 */
export default function Waveform({ file }: WaveformProps) {
  // Ref to the HTML container where the waveform will be rendered
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref to store the WaveSurfer instance, so we can access it between renders
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // UI state
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pxPerSec, setPxPerSec] = useState(80); // “zoom” (pixels per second)

  // bounds + wheel sensitivity
  const MIN_PX_PER_SEC = 10;
  const MAX_PX_PER_SEC = 500;
  const WHEEL_SCALE = 1.05; // ≈5% per wheel tick for smoothness

 useEffect(() => {
    // Guard clause — exit if the container doesn't exist or file is missing
    if (!containerRef.current || !file) return;

    // Destroy any existing WaveSurfer instance before creating a new one
    wavesurferRef.current?.destroy();

    // Configure visual options for the waveform
    const options: WaveSurferOptions = {
      container: containerRef.current!, // non-null assertion
      waveColor: '#60A5FA', // waveform base color
      progressColor: '#2563EB', // color of played part
      cursorColor: '#FFFFFF', // playback cursor color
      height: 100, // waveform height in pixels
      minPxPerSec: pxPerSec,  // initial zoom
      fillParent: true,
    };

    // Create a new WaveSurfer instance
    const ws = WaveSurfer.create(options);
    wavesurferRef.current = ws;
    
    ws.on('ready', () => {
      setReady(true);
      setDuration(ws.getDuration());
      setCurrent(0);
    });
    
    ws.on('timeupdate', (t) => setCurrent(t));
    ws.on('error', (e) => console.error('WaveSurfer error:', e));
    
    // Load the audio directly from the uploaded File (Blob)
    ws.loadBlob(file);

    return () => ws.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // apply zoom whenever pxPerSec changes
  useEffect(() => {
    if (!ready || !wavesurferRef.current) return;
    wavesurferRef.current.zoom(pxPerSec);
  }, [pxPerSec, ready]);

  // keyboard shortcuts (still useful)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ws = wavesurferRef.current;
      if (!ws) return;

      if (e.code === 'Space') {
        e.preventDefault();
        ws.playPause();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.shiftKey ? 5 : 1;
        ws.setTime(Math.min(ws.getDuration(), ws.getCurrentTime() + delta));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const delta = e.shiftKey ? 5 : 1;
        ws.setTime(Math.max(0, ws.getCurrentTime() - delta));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Cmd + mousewheel zoom (FL Studio–style)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only intercept when holding Cmd (Meta on macOS)
      if (!e.metaKey) return;

      // prevent page scroll while zooming
      e.preventDefault();

      setPxPerSec((prev) => {
        // deltaY > 0 = scroll down  -> zoom IN (more px/s)
        // deltaY < 0 = scroll up    -> zoom OUT (fewer px/s)
        const factor = e.deltaY > 0 ? WHEEL_SCALE : 1 / WHEEL_SCALE;
        const next = Math.min(
          MAX_PX_PER_SEC,
          Math.max(MIN_PX_PER_SEC, prev * factor)
        );
        return next;
      });
    };

    // passive: false is required to call preventDefault() on wheel events
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as EventListener);
  }, []);

  const togglePlay = () => wavesurferRef.current?.playPause();

  // Optional: keep +/- buttons as an alternative control
  const zoomIn = () =>
    setPxPerSec((v) => Math.min(MAX_PX_PER_SEC, Math.round(v * WHEEL_SCALE)));
  const zoomOut = () =>
    setPxPerSec((v) => Math.max(MIN_PX_PER_SEC, Math.round(v / WHEEL_SCALE)));

  return (
    <div className="mx-auto w-[min(90vw,900px)]">
      {/* Transport header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-white/80">
          {formatTime(current)} / {formatTime(duration)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            title="Zoom out"
          >
            −
          </button>
          <span className="w-16 text-center text-xs text-white/60">
            {Math.round(pxPerSec)} px/s
          </span>
          <button
            onClick={zoomIn}
            className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={togglePlay}
            className="ml-3 rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            {wavesurferRef.current?.isPlaying() ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      {/* Big waveform area (Cmd + wheel to zoom) */}
      <div
        ref={containerRef}
        className="h-[160px] w-full overflow-x-auto rounded-lg bg-black/30"
        title="Hold ⌘ and scroll to zoom"
      />
      <p className="mt-2 text-xs text-white/50">
        Tips: ⌘ + scroll = zoom, Space = Play/Pause, ←/→ = ±1s (Shift for ±5s)
      </p>
    </div>
  );
}
