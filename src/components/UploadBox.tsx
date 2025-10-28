'use client';
import React, { useState } from 'react';
import Waveform from './Waveform';

/**
 * UploadBox component
 * -------------------
 * Handles audio file selection from the user and passes
 * the selected file to the Waveform component for visualization.
 */
export default function UploadBox() {
  // React state to hold the uploaded file
  const [file, setFile] = useState<File | null>(null);

  /**
   * Event handler for <input type="file">
   * Triggered whenever the user selects a file.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]); // store the selected file in state
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 p-6 rounded-xl text-white">
      {/* File input (accepts only audio files) */}
      <input type="file" accept="audio/*" onChange={handleChange} />

      {/* Once a file is selected, display its name and render the waveform */}
      {file && (
        <>
          <p className="mt-3">Valgt fil: {file.name}</p>
          {/* Pass the file down to the Waveform component */}
          <Waveform file={file} />
        </>
      )}
    </div>
  );
}
