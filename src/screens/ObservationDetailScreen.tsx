import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { FontAwesome7ProSolid } from '../components/FontAwesome7ProSolid';
import { IconButton } from '../components/IconButton';
import { useAiQueue, AiCollection } from '../context/AiQueueContext';

interface ObservationDetailScreenProps {
  navigation: any;
  route: { params: { collectionId: string } };
}

const AUDIO_DURATION = 43; // mock seconds

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ObservationDetailScreen({ navigation, route }: ObservationDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { queue } = useAiQueue();
  const { collectionId } = route.params;

  const collection: AiCollection | undefined = queue.find(c => c.id === collectionId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(0.47); // mock progress: 0–1

  const currentSeconds = Math.round(progress * AUDIO_DURATION);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <IconButton
          name="arrow-left"
          iconColor="#052339"
          backgroundColor="#eef1f7"
          borderRadius={16}
          onPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>
          {collection?.subsectionTitle ?? 'Observation'}
        </Text>

        {/* Photo grid */}
        <View style={styles.photoGrid}>
          {(collection?.photos ?? []).map((photo, index) => (
            <View key={photo.id} style={styles.photoCard}>
              <View style={styles.photoThumb}>
                <View style={styles.photoPlaceholder} />
                <TouchableOpacity style={styles.removeBtn} activeOpacity={0.7}>
                  <FontAwesome7ProSolid name="xmark" size={10} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.photoCaption}>Photo {index + 1}</Text>
            </View>
          ))}

          {/* Add photo button */}
          <TouchableOpacity style={styles.addPhotoBtn} activeOpacity={0.7}>
            <Text style={styles.addPhotoBtnPlus}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Audio player — pinned to bottom */}
      <View style={[styles.playerWrap, { paddingBottom: insets.bottom + 16 }]}>
        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { flex: progress }]} />
            <View style={[styles.progressRemainder, { flex: 1 - progress }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` as any }]} />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>
              {formatDuration(currentSeconds)} / {formatDuration(AUDIO_DURATION)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.7}>
            <FontAwesome7Pro name="rotate-left" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playBtn}
            activeOpacity={0.85}
            onPress={() => setIsPlaying(p => !p)}
          >
            <FontAwesome7ProSolid
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.7}>
            <FontAwesome7Pro name="rotate-right" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#052339',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  photoCard: {
    alignItems: 'center',
    gap: 4,
  },
  photoThumb: {
    width: 88,
    height: 88,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPlaceholder: {
    width: 88,
    height: 88,
    backgroundColor: '#d1dde6',
    borderRadius: 24,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#052339',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  photoCaption: {
    fontSize: 12,
    color: '#787086',
  },
  addPhotoBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(25, 0, 66, 0.12)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  addPhotoBtnPlus: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '400',
    lineHeight: 24,
  },
  playerWrap: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  progressSection: {
    width: '100%',
    gap: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 100,
    flexDirection: 'row',
    overflow: 'visible',
    position: 'relative',
    alignItems: 'center',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1771b8',
    borderRadius: 100,
  },
  progressRemainder: {
    height: 4,
    backgroundColor: '#d9d9d9',
    borderRadius: 100,
  },
  progressThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1771b8',
    marginLeft: -6,
    top: -4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#647382',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 12,
  },
  controlBtn: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1771b8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
