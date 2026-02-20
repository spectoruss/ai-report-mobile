import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS, Rating, Comment } from '../data/mockData'; // Comment kept for future use
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { IconButton } from '../components/IconButton';
import { ReportTopBar } from '../components/ReportTopBar';
import { CaptureActionBar } from '../components/CaptureActionBar';
import { AudioBottomSheet } from '../components/AudioBottomSheet';
import { AppBottomSheet } from '../components/AppBottomSheet';
import { AttachMediaSheet } from '../components/AttachMediaSheet';
import { SectionPickerModal } from '../components/SectionPickerModal';
import { ProcessedBanner } from '../components/ProcessedBanner';
import { CoachmarkOverlay } from '../components/CoachmarkOverlay';
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
  const hasPrevSection = sectionIndex > 0;
  const hasNextSection = sectionIndex < REPORT_SECTIONS.length - 1;

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
  const [sectionPickerVisible, setSectionPickerVisible] = useState(false);
  const [inputType, setInputType] = useState<InputType>('mic');
  const [activeSubsectionId, setActiveSubsectionId] = useState<string | null>(null);

  const pendingTranscript = useRef<string>('');

  const { addToQueue, showCoachmark, dismissCoachmark } = useAiQueue();

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      dismissCoachmark();
    });
    return unsubscribe;
  }, [navigation]);

  function setRating(subsectionId: string, rating: Rating) {
    setRatings(prev => ({ ...prev, [subsectionId]: rating }));
  }

  function openInput(type: InputType) {
    setInputType(type);
    setActiveSubsectionId(section.subsections[0].id);
    setAudioSheetVisible(true);
  }

  function handleAudioConfirm(transcript: string) {
    pendingTranscript.current = transcript;
    setAudioSheetVisible(false);
    setAttachMediaVisible(true);
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

  function handlePrevSection() {
    if (!hasPrevSection) return;
    navigation.replace('SectionDetail', { sectionId: REPORT_SECTIONS[sectionIndex - 1].id });
  }

  function handleNextSection() {
    if (!hasNextSection) return;
    navigation.replace('SectionDetail', { sectionId: REPORT_SECTIONS[sectionIndex + 1].id });
  }

  function handleSectionSelect(id: string) {
    if (id !== sectionId) {
      navigation.replace('SectionDetail', { sectionId: id });
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ReportTopBar
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <ProcessedBanner />
      {/* Scroll area + floating action bar */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {section.subsections.map((subsection) => {
            const currentRating = ratings[subsection.id];
            const subsectionComments = comments[subsection.id] || [];

            return (
              <View key={subsection.id}>
                {/* Subsection row — taps into ItemDetail */}
                <TouchableOpacity
                  style={styles.subsectionRow}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ItemDetail', { sectionId, subsectionId: subsection.id })}
                >
                  <View style={styles.subsectionLeft}>
                    <View style={styles.checkCircle} />
                  </View>
                  <Text style={styles.subsectionTitle} numberOfLines={1}>
                    {subsection.title}
                  </Text>
                  <View style={styles.subsectionRight}>
                    <FontAwesome7Pro name="chevron-right" size={12} color="#6b7280" />
                  </View>
                </TouchableOpacity>

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
                {subsectionComments.map((comment, commentIdx) => (
                  <View key={commentIdx} style={styles.commentChip}>
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

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <IconButton
          name="arrow-left"
          iconColor="#052339"
          backgroundColor="#eef1f7"
          borderRadius={16}
          onPress={() => navigation.goBack()}
        />
        <TouchableOpacity
          style={styles.sectionPill}
          activeOpacity={0.7}
          onPress={() => setSectionPickerVisible(true)}
        >
          <FontAwesome7Pro name={section.icon} size={16} color="#052339" />
          <Text style={styles.sectionPillText} numberOfLines={1}>{section.title}</Text>
        </TouchableOpacity>

        <View style={styles.navGroup}>
          <TouchableOpacity
            style={[styles.navButton, !hasPrevSection && styles.navButtonDisabled]}
            activeOpacity={0.7}
            onPress={handlePrevSection}
            disabled={!hasPrevSection}
          >
            <FontAwesome7Pro name="chevron-left" size={16} color="#052339" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, !hasNextSection && styles.navButtonDisabled]}
            activeOpacity={0.7}
            onPress={handleNextSection}
            disabled={!hasNextSection}
          >
            <FontAwesome7Pro name="chevron-right" size={16} color="#052339" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Section picker */}
      <SectionPickerModal
        visible={sectionPickerVisible}
        currentSectionId={sectionId}
        onSelect={handleSectionSelect}
        onClose={() => setSectionPickerVisible(false)}
      />

      {/* Coachmark — shown on first input added, points at sparkles button */}
      <CoachmarkOverlay
        show={showCoachmark}
        onDismiss={dismissCoachmark}
        topOffset={insets.top + 72}
        title="You've added an input to the Ai Queue!"
        description="Go back to the queue when ready to process"
        iconName="arrow-pointer"
      />

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
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
    backgroundColor: '#ffffff',
  },
  sectionPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionPillText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#052339',
  },
  navGroup: {
    flexDirection: 'row',
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    overflow: 'hidden',
  },
  navButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
});
