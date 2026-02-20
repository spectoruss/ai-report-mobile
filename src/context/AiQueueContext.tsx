import React, { createContext, useContext, useState } from 'react';

export interface PhotoAttachment {
  id: string;
}

export interface AiCollection {
  id: string;
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
  timestamp: Date;
  audio: { transcript: string } | null;
  photos: PhotoAttachment[];
}

export interface ProcessingSection {
  title: string;
  count: number;
}

interface AiQueueContextValue {
  queue: AiCollection[];
  processingBySection: Record<string, ProcessingSection>;
  addToQueue: (collection: AiCollection) => void;
  addAudioToCollection: (collectionId: string, transcript: string) => void;
  addPhotoToCollection: (collectionId: string) => void;
  analyze: () => void;
  clearQueue: () => void;
}

const AiQueueContext = createContext<AiQueueContextValue>({
  queue: [],
  processingBySection: {},
  addToQueue: () => {},
  addAudioToCollection: () => {},
  addPhotoToCollection: () => {},
  analyze: () => {},
  clearQueue: () => {},
});

export function AiQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<AiCollection[]>([]);
  const [processingBySection, setProcessingBySection] = useState<Record<string, ProcessingSection>>({});

  function addToQueue(collection: AiCollection) {
    setQueue(prev => [...prev, collection]);
  }

  function addAudioToCollection(collectionId: string, transcript: string) {
    setQueue(prev =>
      prev.map(col =>
        col.id === collectionId ? { ...col, audio: { transcript } } : col
      )
    );
  }

  function addPhotoToCollection(collectionId: string) {
    setQueue(prev =>
      prev.map(col =>
        col.id === collectionId
          ? { ...col, photos: [...col.photos, { id: `photo-${Date.now()}` }] }
          : col
      )
    );
  }

  function analyze() {
    setProcessingBySection(prev => {
      const next = { ...prev };
      queue.forEach(col => {
        if (next[col.sectionId]) {
          next[col.sectionId] = { ...next[col.sectionId], count: next[col.sectionId].count + 1 };
        } else {
          next[col.sectionId] = { title: col.sectionTitle, count: 1 };
        }
      });
      return next;
    });
    setQueue([]);
  }

  function clearQueue() {
    setQueue([]);
    setProcessingBySection({});
  }

  return (
    <AiQueueContext.Provider value={{ queue, processingBySection, addToQueue, addAudioToCollection, addPhotoToCollection, analyze, clearQueue }}>
      {children}
    </AiQueueContext.Provider>
  );
}

export function useAiQueue() {
  return useContext(AiQueueContext);
}
