import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const MOCK_TRANSCRIPTS = [
  'The furnace filter is dirty and needs to be replaced',
  'Heat exchanger shows rust and corrosion needs evaluation',
  'Thermostat is functional and working properly',
  'Ductwork is disconnected in crawlspace needs repair',
  'Carbon monoxide detector is missing recommend installing',
  'Gutters are clogged with debris need cleaning',
  'Foundation has minor cracks typical of settling',
  'Water staining on basement walls past moisture intrusion',
];

interface AudioRecordingContextValue {
  isRecording: boolean;
  recordingSectionId: string | null;
  elapsed: number;
  isSearchOpen: boolean;
  startRecording: (sectionId: string, onConfirm: (transcript: string) => void) => void;
  cancelRecording: () => void;
  confirmRecording: () => void;
  setSearchOpen: (open: boolean) => void;
}

const AudioRecordingContext = createContext<AudioRecordingContextValue | null>(null);

export function AudioRecordingProvider({ children }: { children: React.ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSectionId, setRecordingSectionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const onConfirmRef = useRef<((transcript: string) => void) | null>(null);

  const setSearchOpen = useCallback((open: boolean) => setIsSearchOpen(open), []);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = useCallback((sectionId: string, onConfirm: (transcript: string) => void) => {
    onConfirmRef.current = onConfirm;
    setElapsed(0);
    setIsRecording(true);
    setRecordingSectionId(sectionId);
  }, []);

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingSectionId(null);
    onConfirmRef.current = null;
  }, []);

  const confirmRecording = useCallback(() => {
    const transcript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
    onConfirmRef.current?.(transcript);
    setIsRecording(false);
    setRecordingSectionId(null);
    onConfirmRef.current = null;
  }, []);

  return (
    <AudioRecordingContext.Provider
      value={{ isRecording, recordingSectionId, elapsed, isSearchOpen, startRecording, cancelRecording, confirmRecording, setSearchOpen }}
    >
      {children}
    </AudioRecordingContext.Provider>
  );
}

export function useAudioRecording(): AudioRecordingContextValue {
  const ctx = useContext(AudioRecordingContext);
  if (!ctx) throw new Error('useAudioRecording must be used within AudioRecordingProvider');
  return ctx;
}
