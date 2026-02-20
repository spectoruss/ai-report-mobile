import React, { createContext, useContext, useState } from 'react';

export type ToolbarItemId = 'torch' | 'cya' | 'gallery' | 'audio' | 'camera';

export type ToolbarVisibility = Record<ToolbarItemId, boolean>;

const DEFAULT_VISIBILITY: ToolbarVisibility = {
  torch: false,
  cya: false,
  gallery: true,
  audio: true,
  camera: true,
};

interface ToolbarContextValue {
  handedness: 'right' | 'left';
  setHandedness: (h: 'right' | 'left') => void;
  visibility: ToolbarVisibility;
  setVisibility: (id: ToolbarItemId, visible: boolean) => void;
  resetVisibility: () => void;
}

const ToolbarContext = createContext<ToolbarContextValue>({
  handedness: 'right',
  setHandedness: () => {},
  visibility: DEFAULT_VISIBILITY,
  setVisibility: () => {},
  resetVisibility: () => {},
});

export function ToolbarProvider({ children }: { children: React.ReactNode }) {
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [visibility, setVisibilityState] = useState<ToolbarVisibility>(DEFAULT_VISIBILITY);

  function setVisibility(id: ToolbarItemId, visible: boolean) {
    setVisibilityState(prev => ({ ...prev, [id]: visible }));
  }

  function resetVisibility() {
    setVisibilityState(DEFAULT_VISIBILITY);
  }

  return (
    <ToolbarContext.Provider value={{ handedness, setHandedness, visibility, setVisibility, resetVisibility }}>
      {children}
    </ToolbarContext.Provider>
  );
}

export function useToolbar() {
  return useContext(ToolbarContext);
}
