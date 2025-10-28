'use client';
import React, { useState } from 'react';
import Waveform from './Waveform';

/**
 * Lets the user pick an audio file, then shows the waveform section
 * below in a larger, comfortable area (separate from the small dashed box).
 */
export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const f = e.target.files[0];
    if (!f.type.startsWith('audio/')) {
      alert('Please choose an audio file (audio/*).');
      return;
    }
    setFile(f);
  };

  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-6">
      {/* Small, simple picker */}
      <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-500 p-6 text-white">
        <input type="file" accept="audio/*" onChange={handleChange} />
        {file && <p className="mt-3 opacity-80">Valgt fil: {file.name}</p>}
      </div>

      {/* Large, comfortable working area */}
      {file && (
        <div className="w-full rounded-2xl bg-black/20 p-5 shadow-xl ring-1 ring-white/10">
          <Waveform file={file} />
        </div>
      )}
    </div>
  );
}
