import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS, Rating, Comment } from '../data/mockData'; // Comment kept for future use
import { IconButton } from '../components/IconButton';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { ReportTopBar } from '../components/ReportTopBar';
import { CaptureActionBar } from '../components/CaptureActionBar';
import { AudioBottomSheet } from '../components/AudioBottomSheet';
import { AppBottomSheet } from '../components/AppBottomSheet';
import { AttachMediaSheet } from '../components/AttachMediaSheet';
import { useAiQueue } from '../context/AiQueueContext';

interface SectionDetailScreenProps {
  navigation: any;
  route: { params: { sectionId: string } };
}

type InputType = 'mic' | 'camera' | 'photo';

const RATING_LABELS: Rating[] = ['IN', 'NI', 'NP', 'D'];

export function SectionDetailScreen({ navigation, route }: SectionDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { sectionId } = route.params;

  const section = REPORT_SECTIONS.find(s => s.id === sectionId)!;
  const sectionIndex = REPORT_SECTIONS.findIndex(s => s.id === sectionId);
  const hasPrev = sectionIndex > 0;
  const hasNext = sectionIndex < REPORT_SECTIONS.length - 1;;

  // Local state for ratings
  const [ratings, setRatings] = useState<Record<string, Rating>>(() => {
    const initial: Record<string, Rating> = {};
    section.subsections.forEach(ss => { initial[ss.id] = ss.rating; });
    return initial;
  });

  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    const initial: Record<string, Comment[]> = {};
    section.subsections.forEach(ss => { initial[ss.id] = ss.comments; });
    return initial;
  });

  const [audioSheetVisible, setAudioSheetVisible] = useState(false);
  const [attachMediaVisible, setAttachMediaVisible] = useState(false);
  const [inputType, setInputType] = useState<InputType>('mic');
  const [activeSubsectionId, setActiveSubsectionId] = useState<string | null>(null);
  const pendingTranscript = useRef<string>('');
  const { addToQueue } = useAiQueue();

  function setRating(subsectionId: string, rating: Rating) {
    setRatings(prev => ({ ...prev, [subsectionId]: rating }));
  }

  function openInput(type: InputType, subsectionId?: string) {
    setInputType(type);
    setActiveSubsectionId(subsectionId ?? section.subsections[0].id);
    setAudioSheetVisible(true);
  }

  function handleAudioConfirm(transcript: string) {
    pendingTranscript.current = transcript;
    setAudioSheetVisible(false);
    setAttachMediaVisible(true);
  }

  function goToPrev() {
    if (hasPrev) navigation.replace('SectionDetail', { sectionId: REPORT_SECTIONS[sectionIndex - 1].id });
  }

  function goToNext() {
    if (hasNext) navigation.replace('SectionDetail', { sectionId: REPORT_SECTIONS[sectionIndex + 1].id });
  }

  function handleNotNow() {
    const subsection = section.subsections.find(ss => ss.id === activeSubsectionId);
    const isAudio = inputType === 'mic';
    addToQueue({
      id: Date.now().toString(),
      sectionId: section.id,
      sectionTitle: section.title,
      subsectionId: activeSubsectionId ?? section.subsections[0].id,
      subsectionTitle: subsection?.title ?? '',
      timestamp: new Date(),
      audio: isAudio ? { transcript: pendingTranscript.current } : null,
      photos: !isAudio ? [{ id: `photo-${Date.now()}` }] : [],
    });
    pendingTranscript.current = '';
    setAttachMediaVisible(false);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.dynamicIsland} />
        <Text style={styles.statusIcons}>▲ ■</Text>
      </View>

      <ReportTopBar navigation={navigation} onBack={() => navigation.goBack()} />

      {/* Scroll area + floating action bar */}
      <View style={styles.scrollWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {section.subsections.map(subsection => {
            const currentRating = ratings[subsection.id];
            const subsectionComments = comments[subsection.id] || [];

            return (
              <View key={subsection.id}>
                {/* Subsection row */}
                <View style={styles.subsectionRow}>
                  <View style={styles.subsectionLeft}>
                    <View style={styles.checkCircle} />
                  </View>
                  <Text style={styles.subsectionTitle} numberOfLines={1}>
                    {subsection.title}
                  </Text>
                  <View style={styles.subsectionRight}>
                    <FontAwesome7Pro name="chevron-right" size={12} color="#6b7280" />
                  </View>
                </View>

                {/* Rating segmented control */}
                <View style={styles.ratingRow}>
                  {RATING_LABELS.map(rating => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingButton,
                        currentRating === rating && styles.ratingButtonActive,
                      ]}
                      onPress={() => setRating(subsection.id, rating)}
                    >
                      <Text
                        style={[
                          styles.ratingText,
                          currentRating === rating && styles.ratingTextActive,
                        ]}
                      >
                        {rating}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Added comments */}
                {subsectionComments.map((comment, idx) => (
                  <View key={idx} style={styles.commentChip}>
                    <Text style={styles.commentChipIcon}>✦</Text>
                    <Text style={styles.commentChipText} numberOfLines={2}>
                      {comment.text}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}

          {/* Add Item button */}
          <TouchableOpacity style={styles.addItemButton}>
            <Text style={styles.addItemText}>+ Add Item</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Floating action bar */}
        <View style={styles.floatingBar}>
          <CaptureActionBar
            onMicPress={() => openInput('mic')}
            onCameraAiPress={() => openInput('camera')}
            onPhotoPress={() => openInput('photo')}
          />
        </View>
      </View>

      {/* Search-focused bottom nav */}
      <View style={[styles.searchNavBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.searchPill} activeOpacity={0.7}>
          <FontAwesome7Pro name="magnifying-glass" size={16} color="#052339" />
        </TouchableOpacity>
        <IconButton
          name="chevron-left"
          iconColor="#052339"
          onPress={goToPrev}
          style={!hasPrev ? styles.navDisabled : undefined}
        />
        <IconButton
          name="chevron-right"
          iconColor="#052339"
          onPress={goToNext}
          style={!hasNext ? styles.navDisabled : undefined}
        />
      </View>

      {/* Audio recording sheet */}
      <AudioBottomSheet
        visible={audioSheetVisible}
        onCancel={() => setAudioSheetVisible(false)}
        onConfirm={handleAudioConfirm}
        inputType={inputType}
      />

      {/* Attach media sheet */}
      <AppBottomSheet
        visible={attachMediaVisible}
        onClose={() => setAttachMediaVisible(false)}
      >
        <AttachMediaSheet
          onOpenGallery={() => setAttachMediaVisible(false)}
          onTakePhotos={() => setAttachMediaVisible(false)}
          onNotNow={handleNotNow}
        />
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  time: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  dynamicIsland: {
    width: 122,
    height: 30,
    backgroundColor: '#000',
    borderRadius: 9999,
  },
  statusIcons: { fontSize: 11, color: '#1f2937' },
  scrollWrapper: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 96 },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  subsectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    minHeight: 52,
  },
  subsectionLeft: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  subsectionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
  },
  subsectionRight: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  ratingButtonActive: {
    backgroundColor: '#e07b39',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  ratingTextActive: {
    color: '#ffffff',
  },
  commentChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#0779ac',
  },
  commentChipIcon: {
    fontSize: 10,
    color: '#0779ac',
    marginTop: 2,
  },
  commentChipText: {
    flex: 1,
    fontSize: 13,
    color: '#052339',
    lineHeight: 18,
  },
  addItemButton: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
  },
  addItemText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  searchPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 100,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  navDisabled: {
    opacity: 0.4,
  },
});
