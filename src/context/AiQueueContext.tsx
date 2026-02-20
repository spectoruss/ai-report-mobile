import React, { createContext, useContext, useRef, useState } from 'react';

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
  processedCount: number;
  showCoachmark: boolean;
  addToQueue: (collection: AiCollection) => void;
  addAudioToCollection: (collectionId: string, transcript: string) => void;
  addPhotoToCollection: (collectionId: string) => void;
  analyze: () => void;
  clearQueue: () => void;
  clearProcessed: () => void;
  dismissCoachmark: () => void;
}

const AiQueueContext = createContext<AiQueueContextValue>({
  queue: [],
  processingBySection: {},
  processedCount: 0,
  showCoachmark: false,
  addToQueue: () => {},
  addAudioToCollection: () => {},
  addPhotoToCollection: () => {},
  analyze: () => {},
  clearQueue: () => {},
  clearProcessed: () => {},
  dismissCoachmark: () => {},
});

export function AiQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<AiCollection[]>([]);
  const [processingBySection, setProcessingBySection] = useState<Record<string, ProcessingSection>>({});
  const [processedCount, setProcessedCount] = useState(0);
  const [showCoachmark, setShowCoachmark] = useState(false);
  const hasShownCoachmark = useRef(false);
  const pendingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function addToQueue(collection: AiCollection) {
    // Show coachmark once on the very first input added
    if (!hasShownCoachmark.current) {
      hasShownCoachmark.current = true;
      setShowCoachmark(true);
    }

    setQueue(prev => [...prev, collection]);
    const timeoutId = setTimeout(() => {
      pendingTimeouts.current.delete(collection.id);
      setQueue(prev => prev.filter(c => c.id !== collection.id));
      setProcessedCount(prev => prev + 1);
    }, 6000);
    pendingTimeouts.current.set(collection.id, timeoutId);
  }

  function dismissCoachmark() {
    setShowCoachmark(false);
  }

  function clearProcessed() {
    setProcessedCount(0);
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
    pendingTimeouts.current.forEach(id => clearTimeout(id));
    pendingTimeouts.current.clear();

    const totalCount = queue.length;

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

    setTimeout(() => {
      setProcessingBySection({});
      setProcessedCount(prev => prev + totalCount);
    }, 6000);
  }

  function clearQueue() {
    pendingTimeouts.current.forEach(id => clearTimeout(id));
    pendingTimeouts.current.clear();
    setQueue([]);
    setProcessingBySection({});
  }

  return (
    <AiQueueContext.Provider value={{ queue, processingBySection, processedCount, showCoachmark, addToQueue, addAudioToCollection, addPhotoToCollection, analyze, clearQueue, clearProcessed, dismissCoachmark }}>
      {children}
    </AiQueueContext.Provider>
  );
}

export function useAiQueue() {
  return useContext(AiQueueContext);
}
