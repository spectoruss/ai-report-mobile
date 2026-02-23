import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS, Comment } from '../data/mockData';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { IconButton } from '../components/IconButton';
import { ReportTopBar } from '../components/ReportTopBar';
import { CaptureActionBar } from '../components/CaptureActionBar';
import { AudioBottomSheet } from '../components/AudioBottomSheet';
import { AppBottomSheet } from '../components/AppBottomSheet';
import { AttachMediaSheet } from '../components/AttachMediaSheet';
import { ProcessedBanner } from '../components/ProcessedBanner';
import { SectionPickerModal } from '../components/SectionPickerModal';
import { CoachmarkOverlay } from '../components/CoachmarkOverlay';
import { AiAssistOverlay } from '../components/AiAssistOverlay';
import { useAiQueue } from '../context/AiQueueContext';

interface ItemDetailScreenProps {
  navigation: any;
  route: { params: { sectionId: string; subsectionId: string } };
}

type InputType = 'mic' | 'camera' | 'photo';

export function ItemDetailScreen({ navigation, route }: ItemDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { sectionId, subsectionId } = route.params;

  const section = REPORT_SECTIONS.find(s => s.id === sectionId)!;
  const sectionIndex = REPORT_SECTIONS.findIndex(s => s.id === sectionId);
  const subsection = section.subsections.find(ss => ss.id === subsectionId)!;
  const subsectionIndex = section.subsections.findIndex(ss => ss.id === subsectionId);

  const hasPrevItem = subsectionIndex > 0;
  const hasNextItem = subsectionIndex < section.subsections.length - 1;
  const hasPrevSection = sectionIndex > 0;
  const hasNextSection = sectionIndex < REPORT_SECTIONS.length - 1;

  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Comment[]>(subsection.comments ?? []);
  const [sectionPickerVisible, setSectionPickerVisible] = useState(false);
  const [audioSheetVisible, setAudioSheetVisible] = useState(false);
  const [attachMediaVisible, setAttachMediaVisible] = useState(false);
  const [inputType, setInputType] = useState<InputType>('mic');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingTranscript = useRef<string>('');

  const { addToQueue, showCoachmark, dismissCoachmark, showItemCoachmark, triggerItemCoachmark, dismissItemCoachmark } = useAiQueue();

  useEffect(() => {
    triggerItemCoachmark();
    const unsubscribe = navigation.addListener('blur', () => {
      dismissItemCoachmark();
      dismissCoachmark();
    });
    return unsubscribe;
  }, [navigation]);

  function toggleOption(optionId: string) {
    setCheckedOptions(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  }

  // ── Capture handlers ────────────────────────────────────────────────────

  function openInput(type: InputType) {
    setInputType(type);
    setAudioSheetVisible(true);
  }

  function handleAudioConfirm(transcript: string) {
    pendingTranscript.current = transcript;
    setAudioSheetVisible(false);
    setAttachMediaVisible(true);
  }

  function handleNotNow() {
    const isAudio = inputType === 'mic';
    addToQueue({
      id: Date.now().toString(),
      sectionId: section.id,
      sectionTitle: section.title,
      subsectionId: subsection.id,
      subsectionTitle: subsection.title,
      timestamp: new Date(),
      audio: isAudio ? { transcript: pendingTranscript.current } : null,
      photos: !isAudio ? [{ id: `photo-${Date.now()}` }] : [],
    });
    pendingTranscript.current = '';
    setAttachMediaVisible(false);
  }

  async function handleDirectCamera() {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      addToQueue({
        id: Date.now().toString(),
        sectionId: section.id,
        sectionTitle: section.title,
        subsectionId: subsection.id,
        subsectionTitle: subsection.title,
        timestamp: new Date(),
        audio: null,
        photos: result.assets.map((_, i) => ({ id: `photo-${Date.now()}-${i}` })),
      });
    }
  }

  async function handleDirectGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) {
      addToQueue({
        id: Date.now().toString(),
        sectionId: section.id,
        sectionTitle: section.title,
        subsectionId: subsection.id,
        subsectionTitle: subsection.title,
        timestamp: new Date(),
        audio: null,
        photos: result.assets.map((_, i) => ({ id: `photo-${Date.now()}-${i}` })),
      });
    }
  }

  async function handleOpenGallery() {
    setAttachMediaVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
    const photos = result.canceled ? [] : result.assets.map((_, i) => ({ id: `photo-${Date.now()}-${i}` }));
    addToQueue({
      id: Date.now().toString(),
      sectionId: section.id,
      sectionTitle: section.title,
      subsectionId: subsection.id,
      subsectionTitle: subsection.title,
      timestamp: new Date(),
      audio: pendingTranscript.current ? { transcript: pendingTranscript.current } : null,
      photos,
    });
    pendingTranscript.current = '';
  }

  async function handleTakePhotos() {
    setAttachMediaVisible(false);
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    const photos = result.canceled ? [] : result.assets.map((_, i) => ({ id: `photo-${Date.now()}-${i}` }));
    addToQueue({
      id: Date.now().toString(),
      sectionId: section.id,
      sectionTitle: section.title,
      subsectionId: subsection.id,
      subsectionTitle: subsection.title,
      timestamp: new Date(),
      audio: pendingTranscript.current ? { transcript: pendingTranscript.current } : null,
      photos,
    });
    pendingTranscript.current = '';
  }

  // ── Navigation handlers ─────────────────────────────────────────────────

  function handlePrevItem() {
    if (hasPrevItem) {
      navigation.replace('ItemDetail', { sectionId, subsectionId: section.subsections[subsectionIndex - 1].id });
    } else if (hasPrevSection) {
      const prevSection = REPORT_SECTIONS[sectionIndex - 1];
      navigation.replace('ItemDetail', { sectionId: prevSection.id, subsectionId: prevSection.subsections[prevSection.subsections.length - 1].id });
    }
  }

  function handleNextItem() {
    if (hasNextItem) {
      navigation.replace('ItemDetail', { sectionId, subsectionId: section.subsections[subsectionIndex + 1].id });
    } else if (hasNextSection) {
      const nextSection = REPORT_SECTIONS[sectionIndex + 1];
      navigation.replace('ItemDetail', { sectionId: nextSection.id, subsectionId: nextSection.subsections[0].id });
    }
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
    navigation.replace('SectionDetail', { sectionId: id });
  }

  const prevDisabled = !hasPrevItem && !hasPrevSection;
  const nextDisabled = !hasNextItem && !hasNextSection;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ReportTopBar
        navigation={navigation}
        onBack={() => navigation.goBack()}
        onSearchOpen={(q) => { setSearchQuery(q); setSearchVisible(true); }}
      />
      <ProcessedBanner />

      <View style={styles.scrollWrapper}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.itemTitle}>{subsection.title}</Text>

          {/* Comment chips — AI-generated observations for this item */}
          {comments.length > 0 && (
            <View style={styles.commentsGroup}>
              {comments.map((comment, idx) => (
                <View key={idx} style={styles.commentChip}>
                  <Text style={styles.commentChipIcon}>✦</Text>
                  <Text style={styles.commentChipText} numberOfLines={3}>
                    {comment.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Options checklist */}
          {subsection.options && subsection.options.length > 0 ? (
            <View style={styles.optionsGroup}>
              <Text style={styles.optionsLabel}>Select all that apply</Text>
              {subsection.options.map(option => {
                const checked = !!checkedOptions[option.id];
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => toggleOption(option.id)}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <FontAwesome7Pro name="check" size={11} color="#ffffff" />}
                    </View>
                    <Text style={[styles.optionLabel, checked && styles.optionLabelChecked]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No options defined for this item</Text>
            </View>
          )}
        </ScrollView>

        {/* Floating capture bar */}
        <View style={styles.floatingBar}>
          <CaptureActionBar
            onMicPress={() => openInput('mic')}
            onCameraAiPress={handleDirectCamera}
            onPhotoPress={handleDirectGallery}
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
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumb} numberOfLines={1}>{subsection.title}</Text>
        </TouchableOpacity>

        <View style={styles.navGroup}>
          <TouchableOpacity
            style={[styles.navButton, prevDisabled && styles.navButtonDisabled]}
            activeOpacity={0.7}
            onPress={handlePrevItem}
            onLongPress={handlePrevSection}
            delayLongPress={1000}
            disabled={prevDisabled}
          >
            <FontAwesome7Pro name="chevron-left" size={16} color="#052339" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, nextDisabled && styles.navButtonDisabled]}
            activeOpacity={0.7}
            onPress={handleNextItem}
            onLongPress={handleNextSection}
            delayLongPress={1000}
            disabled={nextDisabled}
          >
            <FontAwesome7Pro name="chevron-right" size={16} color="#052339" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionPickerModal
        visible={sectionPickerVisible}
        currentSectionId={sectionId}
        onSelect={handleSectionSelect}
        onClose={() => setSectionPickerVisible(false)}
        onAddSection={() => navigation.navigate('NewSection')}
      />

      {/* Coachmark — explain tap vs press & hold */}
      <CoachmarkOverlay
        show={showItemCoachmark}
        onDismiss={dismissItemCoachmark}
        variant="bottom"
        bottomOffset={insets.bottom + 73}
        caretRight={40}
        title="Using the arrows"
        items={[
          { iconName: 'arrow-pointer', description: 'Tap to move to the next or previous item' },
          { iconName: 'hand', description: 'Press & hold to jump to a different section' },
        ]}
      />

      {/* Coachmark — Ai queue added */}
      <CoachmarkOverlay
        show={showCoachmark}
        onDismiss={dismissCoachmark}
        topOffset={insets.top + 72}
        title="You've added an input to the Ai Queue!"
        items={[{ iconName: 'arrow-pointer', description: 'Go back to the queue when ready to process' }]}
      />

      <AudioBottomSheet
        visible={audioSheetVisible}
        onCancel={() => setAudioSheetVisible(false)}
        onConfirm={handleAudioConfirm}
        inputType={inputType}
      />

      <AppBottomSheet visible={attachMediaVisible} onClose={() => setAttachMediaVisible(false)}>
        <AttachMediaSheet
          onOpenGallery={handleOpenGallery}
          onTakePhotos={handleTakePhotos}
          onNotNow={handleNotNow}
        />
      </AppBottomSheet>

      {/* Search overlay — rendered here so absoluteFillObject fills the full screen */}
      <AiAssistOverlay
        visible={searchVisible}
        initialQuery={searchQuery}
        onClose={() => setSearchVisible(false)}
        sectionContext={{ id: section.id, title: section.title, icon: section.icon }}
        onMicPress={() => openInput('mic')}
        onCameraPress={handleDirectCamera}
        onPhotoPress={handleDirectGallery}
        onSparklesPress={() => navigation.navigate('AiObservations')}
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
  scrollWrapper: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 96 },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#052339',
    marginBottom: 20,
  },

  // ── Comment chips ──────────────────────────────────────────────────────────
  commentsGroup: {
    gap: 6,
    marginBottom: 20,
  },
  commentChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
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

  // ── Options checklist ─────────────────────────────────────────────────────
  optionsGroup: {
    gap: 4,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#0779ac',
    borderColor: '#0779ac',
  },
  optionLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
  },
  optionLabelChecked: {
    color: '#052339',
    fontWeight: '500',
  },
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
  },

  // ── Bottom bar ────────────────────────────────────────────────────────────
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
    overflow: 'hidden',
  },
  breadcrumb: {
    flex: 1,
    fontSize: 14,
    color: '#052339',
    fontWeight: '500',
  },
  breadcrumbSep: {
    fontSize: 14,
    color: '#9ca3af',
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
