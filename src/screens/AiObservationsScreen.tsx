import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { ProcessedBanner } from '../components/ProcessedBanner';
import { AudioBottomSheet } from '../components/AudioBottomSheet';
import { useAiQueue, AiCollection } from '../context/AiQueueContext';

interface AiObservationsScreenProps {
  navigation: any;
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

interface CollectionItemProps {
  collection: AiCollection;
  onPress: () => void;
  onAddAudio: () => void;
  onAddPhoto: () => void;
}

function CollectionItem({ collection, onPress, onAddAudio, onAddPhoto }: CollectionItemProps) {
  const hasAudio = collection.audio !== null;
  const hasPhoto = collection.photos.length > 0;

  return (
    <TouchableOpacity
      style={styles.itemRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Thumbnail pair */}
      <View style={styles.thumbnailGroup}>
        {/* Photo slot */}
        {hasPhoto ? (
          <View style={[styles.thumbnail, styles.thumbnailFilled]} />
        ) : (
          <TouchableOpacity
            style={[styles.thumbnail, styles.thumbnailEmpty]}
            onPress={onAddPhoto}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <FontAwesome7Pro name="camera" size={12} color="#9ca3af" />
            <Text style={styles.thumbnailEmptyPlus}>+</Text>
          </TouchableOpacity>
        )}

        {/* Audio slot */}
        {hasAudio ? (
          <View style={[styles.thumbnail, styles.thumbnailFilled]}>
            <View style={styles.playButton}>
              <FontAwesome7Pro name="play" size={8} color="#ffffff" />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.thumbnail, styles.thumbnailEmpty]}
            onPress={onAddAudio}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <FontAwesome7Pro name="microphone" size={12} color="#9ca3af" />
            <Text style={styles.thumbnailEmptyPlus}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {collection.subsectionTitle}
        </Text>
        <Text style={styles.itemTime}>{formatTime(collection.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function AiObservationsScreen({ navigation }: AiObservationsScreenProps) {
  const insets = useSafeAreaInsets();
  const { queue, processingBySection, addAudioToCollection, addPhotoToCollection, analyze } = useAiQueue();

  const [audioSheetVisible, setAudioSheetVisible] = useState(false);
  const targetCollectionId = useRef<string | null>(null);

  // All unique section IDs across both processing and pending queue
  const allSectionIds = Array.from(new Set([
    ...Object.keys(processingBySection),
    ...queue.map(col => col.sectionId),
  ]));

  // Section titles
  const sectionTitles: Record<string, string> = {};
  Object.entries(processingBySection).forEach(([id, p]) => { sectionTitles[id] = p.title; });
  queue.forEach(col => { sectionTitles[col.sectionId] = col.sectionTitle; });

  // Queue collections grouped by section
  const queueBySection = queue.reduce<Record<string, AiCollection[]>>((acc, col) => {
    if (!acc[col.sectionId]) acc[col.sectionId] = [];
    acc[col.sectionId].push(col);
    return acc;
  }, {});

  function handleAddAudio(collectionId: string) {
    targetCollectionId.current = collectionId;
    setAudioSheetVisible(true);
  }

  function handleAudioConfirm(transcript: string) {
    if (targetCollectionId.current) {
      addAudioToCollection(targetCollectionId.current, transcript);
      targetCollectionId.current = null;
    }
    setAudioSheetVisible(false);
  }

  function handleAddPhoto(collectionId: string) {
    navigation.navigate('Camera', { collectionId });
  }

  const isEmpty = allSectionIds.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          name="arrow-left"
          iconColor="#052339"
          backgroundColor="rgba(0,0,0,0.05)"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Ai Observations</Text>
        <IconButton
          name="sliders"
          iconColor="#052339"
          backgroundColor="rgba(0,0,0,0.05)"
        />
      </View>

      <ProcessedBanner />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {allSectionIds.map(sectionId => {
          const processingInfo = processingBySection[sectionId];
          const collections = queueBySection[sectionId] ?? [];
          const title = sectionTitles[sectionId] ?? '';

          return (
            <View key={sectionId} style={styles.sectionGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
                <View style={styles.sectionHeaderRight}>
                  {processingInfo && (
                    <View style={styles.processingTag}>
                      <Text style={styles.processingTagText}>
                        Processing ({processingInfo.count})
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                    <FontAwesome7Pro name="plus" size={12} color="#052339" />
                  </TouchableOpacity>
                </View>
              </View>
              {collections.map(col => (
                <CollectionItem
                  key={col.id}
                  collection={col}
                  onPress={() => navigation.navigate('CollectionDetail', { collectionId: col.id })}
                  onAddAudio={() => handleAddAudio(col.id)}
                  onAddPhoto={() => handleAddPhoto(col.id)}
                />
              ))}
            </View>
          );
        })}

        {isEmpty && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No observations queued</Text>
          </View>
        )}
      </ScrollView>

      {/* Analyze button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.analyzeButton, queue.length === 0 && styles.analyzeButtonDisabled]}
          activeOpacity={0.85}
          disabled={queue.length === 0}
          onPress={analyze}
        >
          <Text style={styles.analyzeButtonText}>Analyze</Text>
        </TouchableOpacity>
      </View>

      {/* Audio sheet for adding audio to an existing collection */}
      <AudioBottomSheet
        visible={audioSheetVisible}
        onCancel={() => { targetCollectionId.current = null; setAudioSheetVisible(false); }}
        onConfirm={handleAudioConfirm}
        inputType="mic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionGroup: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ebed',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#647382',
    letterSpacing: 2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingTag: {
    backgroundColor: '#effaf6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  processingTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#212731',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef1f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Collection item
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ebed',
  },
  thumbnailGroup: {
    flexDirection: 'row',
    gap: 4,
    height: 64,
    alignItems: 'center',
  },
  thumbnail: {
    width: 36,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbnailFilled: {
    backgroundColor: '#dae3e7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmpty: {
    backgroundColor: '#eef1f7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  thumbnailEmptyPlus: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
    lineHeight: 10,
  },
  playButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#052339',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 1,
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#09334b',
    lineHeight: 20,
  },
  itemTime: {
    fontSize: 12,
    color: '#647382',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#647382',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  analyzeButton: {
    height: 56,
    backgroundColor: '#052339',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.4,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
