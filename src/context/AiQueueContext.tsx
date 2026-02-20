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
  showItemCoachmark: boolean;
  addToQueue: (collection: AiCollection) => void;
  addAudioToCollection: (collectionId: string, transcript: string) => void;
  addPhotoToCollection: (collectionId: string) => void;
  analyze: () => void;
  clearQueue: () => void;
  clearProcessed: () => void;
  dismissCoachmark: () => void;
  triggerItemCoachmark: () => void;
  dismissItemCoachmark: () => void;
}

const AiQueueContext = createContext<AiQueueContextValue>({
  queue: [],
  processingBySection: {},
  processedCount: 0,
  showCoachmark: false,
  showItemCoachmark: false,
  addToQueue: () => {},
  addAudioToCollection: () => {},
  addPhotoToCollection: () => {},
  analyze: () => {},
  clearQueue: () => {},
  clearProcessed: () => {},
  dismissCoachmark: () => {},
  triggerItemCoachmark: () => {},
  dismissItemCoachmark: () => {},
});

export function AiQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<AiCollection[]>([]);
  const [processingBySection, setProcessingBySection] = useState<Record<string, ProcessingSection>>({});
  const [processedCount, setProcessedCount] = useState(0);
  const [showCoachmark, setShowCoachmark] = useState(false);
  const [showItemCoachmark, setShowItemCoachmark] = useState(false);
  const hasShownCoachmark = useRef(false);
  const hasShownItemCoachmark = useRef(false);
  const processingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function addToQueue(collection: AiCollection) {
    if (!hasShownCoachmark.current) {
      hasShownCoachmark.current = true;
      setShowCoachmark(true);
    }
    setQueue(prev => [...prev, collection]);
  }

  function dismissCoachmark() {
    setShowCoachmark(false);
  }

  function triggerItemCoachmark() {
    if (!hasShownItemCoachmark.current) {
      hasShownItemCoachmark.current = true;
      setShowItemCoachmark(true);
    }
  }

  function dismissItemCoachmark() {
    setShowItemCoachmark(false);
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
    const totalCount = queue.length;
    if (totalCount === 0) return;

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

    if (processingTimeout.current) clearTimeout(processingTimeout.current);
    processingTimeout.current = setTimeout(() => {
      setProcessingBySection({});
      setProcessedCount(prev => prev + totalCount);
    }, 6000);
  }

  function clearQueue() {
    setQueue([]);
    setProcessingBySection({});
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current);
      processingTimeout.current = null;
    }
  }

  return (
    <AiQueueContext.Provider value={{
      queue,
      processingBySection,
      processedCount,
      showCoachmark,
      showItemCoachmark,
      addToQueue,
      addAudioToCollection,
      addPhotoToCollection,
      analyze,
      clearQueue,
      clearProcessed,
      dismissCoachmark,
      triggerItemCoachmark,
      dismissItemCoachmark,
    }}>
      {children}
    </AiQueueContext.Provider>
  );
}

export function useAiQueue() {
  return useContext(AiQueueContext);
}
