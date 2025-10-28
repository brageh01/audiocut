'use client';
import React, { useEffect, useRef } from 'react';
import WaveSurfer, { type WaveSurferOptions } from 'wavesurfer.js';

/**
 * Props interface defining what the component expects.
 * In this case, a single File object representing an audio file.
 */
interface WaveformProps {
  file: File;
}

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

  /**
   * useEffect runs whenever a new file is provided.
   * It initializes a new WaveSurfer instance, loads the audio blob,
   * and cleans up when the component unmounts or file changes.
   */
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
    };

    // Create a new WaveSurfer instance
    const ws = WaveSurfer.create(options);
    wavesurferRef.current = ws;

    // Load the audio directly from the uploaded File (Blob)
    ws.loadBlob(file);

    // Optional: log any loading errors to the console
    ws.on('error', (e) => {
      console.error('WaveSurfer error:', e);
    });

    // Cleanup function — destroys the WaveSurfer instance on unmount
    return () => ws.destroy();
  }, [file]);

  /**
   * Toggle play/pause when the button is clicked.
   */
  const togglePlay = () => wavesurferRef.current?.playPause();

  return (
    <div className="mt-6 w-full max-w-xl">
      {/* The container where the waveform will be drawn */}
      <div ref={containerRef} className="w-full" />

      {/* Simple play/pause control */}
      <button
        onClick={togglePlay}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Play / Pause
      </button>
    </div>
  );
}
