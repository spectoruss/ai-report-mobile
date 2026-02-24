import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS, Comment } from '../data/mockData';
import { FontAwesome7Pro } from '../components/FontAwesome7Pro';
import { IconButton } from '../components/IconButton';
import { ReportTopBar } from '../components/ReportTopBar';
import { CaptureActionBar } from '../components/CaptureActionBar';
import { AppBottomSheet } from '../components/AppBottomSheet';
import { AttachMediaSheet } from '../components/AttachMediaSheet';
import { ProcessedBanner } from '../components/ProcessedBanner';
import { SectionPickerModal } from '../components/SectionPickerModal';
import { CoachmarkOverlay } from '../components/CoachmarkOverlay';
import { AiAssistOverlay } from '../components/AiAssistOverlay';
import { useAiQueue } from '../context/AiQueueContext';
import { useAudioRecording } from '../context/AudioRecordingContext';

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
  const [attachMediaVisible, setAttachMediaVisible] = useState(false);
  const [recordingWarningVisible, setRecordingWarningVisible] = useState(false);
  const [inputType, setInputType] = useState<InputType>('mic');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingTranscript = useRef<string>('');
  const pendingSectionId = useRef<string | null>(null);
  const { isRecording, recordingSectionId, startRecording, cancelRecording } = useAudioRecording();
  const isRecordingRef = useRef(false);

  const { addToQueue, showCoachmark, dismissCoachmark, showItemCoachmark, triggerItemCoachmark, dismissItemCoachmark } = useAiQueue();

  useEffect(() => { isRecordingRef.current = isRecording && recordingSectionId === sectionId; }, [isRecording, recordingSectionId]);

  useEffect(() => {
    triggerItemCoachmark();
    const unsubscribe = navigation.addListener('blur', () => {
      dismissItemCoachmark();
      dismissCoachmark();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isRecordingRef.current) return;
      const action = e.data.action;
      // Allow going back to SectionDetailScreen of the same section
      if (action.type === 'GO_BACK' || action.type === 'POP') return;
      // Allow replacing with another ItemDetail in the same section
      if (
        action.type === 'REPLACE' &&
        action.payload?.name === 'ItemDetail' &&
        action.payload?.params?.sectionId === sectionId
      ) return;
      // Allow replacing with SectionDetail of the same section
      if (
        action.type === 'REPLACE' &&
        action.payload?.name === 'SectionDetail' &&
        action.payload?.params?.sectionId === sectionId
      ) return;
      e.preventDefault();
      Alert.alert(
        'Recording in progress',
        'Navigating away will stop the recording.',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Stop Recording',
            style: 'destructive',
            onPress: () => {
              cancelRecording();
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation]);

  function toggleOption(optionId: string) {
    setCheckedOptions(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  }

  // ── Capture handlers ────────────────────────────────────────────────────

  function openInput(type: InputType) {
    setInputType(type);
    startRecording(sectionId, handleAudioConfirm);
  }

  function handleAudioConfirm(transcript: string) {
    pendingTranscript.current = transcript;
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.replace('ItemDetail', { sectionId, subsectionId: section.subsections[subsectionIndex - 1].id });
    } else if (hasPrevSection) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const prevSection = REPORT_SECTIONS[sectionIndex - 1];
      navigation.replace('ItemDetail', { sectionId: prevSection.id, subsectionId: prevSection.subsections[prevSection.subsections.length - 1].id });
    }
  }

  function handleNextItem() {
    if (hasNextItem) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.replace('ItemDetail', { sectionId, subsectionId: section.subsections[subsectionIndex + 1].id });
    } else if (hasNextSection) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextSection = REPORT_SECTIONS[sectionIndex + 1];
      navigation.replace('ItemDetail', { sectionId: nextSection.id, subsectionId: nextSection.subsections[0].id });
    }
  }

  function handlePrevSection() {
    if (!hasPrevSection) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace('SectionDetail', { sectionId: REPORT_SECTIONS[sectionIndex - 1].id });
  }

  function handleNextSection() {
    if (!hasNextSection) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace('SectionDetail', { sectionId: REPORT_SECTIONS[sectionIndex + 1].id });
  }

  function handleSectionSelect(id: string) {
    if (isRecording && recordingSectionId === sectionId && id !== sectionId) {
      pendingSectionId.current = id;
      setRecordingWarningVisible(true);
    } else {
      navigation.replace('SectionDetail', { sectionId: id });
    }
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
          <View style={styles.itemTitleRow}>
            <FontAwesome7Pro name={section.icon} size={20} color="#052339" />
            <Text style={styles.itemTitle}>{subsection.title}</Text>
          </View>

          {/* Information section */}
          {subsection.options && subsection.options.length > 0 && (
            <View style={styles.contentSection}>
              <View style={[styles.contentSectionHeader, { backgroundColor: '#22c55e' }]}>
                <Text style={styles.contentSectionTitle}>Information</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <FontAwesome7Pro name="plus" size={15} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.optionsGrid}>
                {subsection.options.map(option => {
                  const checked = !!checkedOptions[option.id];
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionCell}
                      activeOpacity={0.7}
                      onPress={() => toggleOption(option.id)}
                    >
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && <FontAwesome7Pro name="check" size={11} color="#ffffff" />}
                      </View>
                      <Text style={[styles.optionCellLabel, checked && styles.optionCellLabelChecked]} numberOfLines={2}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.optionCell} activeOpacity={0.7}>
                  <View style={styles.otherCircle}>
                    <FontAwesome7Pro name="plus" size={10} color="#9ca3af" />
                  </View>
                  <Text style={styles.optionCellLabel}>Other</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.itemActionRow}>
                {(['flag', 'location-dot', 'copy', 'trash'] as const).map((icon, i, arr) => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.actionButton, i < arr.length - 1 && styles.actionButtonBorder]}
                    activeOpacity={0.7}
                  >
                    <FontAwesome7Pro name={icon} size={17} color="#6b7280" />
                    <Text style={styles.actionButtonLabel}>{['Flag', 'Location', 'Copy', 'Delete'][i]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.itemActionRow}>
                {(['images', 'camera', 'video', 'photo-film', 'film'] as const).map((icon, i, arr) => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.actionButton, i < arr.length - 1 && styles.actionButtonBorder]}
                    activeOpacity={0.7}
                  >
                    <FontAwesome7Pro name={icon} size={17} color="#6b7280" />
                    <Text style={styles.actionButtonLabel}>{['+ Photos', '+ Photo', '+ Video', 'Gallery', 'Gallery'][i]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Deficiencies section */}
          <View style={styles.contentSection}>
            <View style={[styles.contentSectionHeader, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.contentSectionTitle}>Deficiencies</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <FontAwesome7Pro name="plus" size={15} color="#ffffff" />
              </TouchableOpacity>
            </View>
            {comments.length > 0 ? (
              comments.map((comment, idx) => (
                <View key={idx} style={[styles.deficiencyRow, idx < comments.length - 1 && styles.deficiencyRowDivider]}>
                  <View style={styles.deficiencyCheckbox} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deficiencyTitle}>{comment.title ?? comment.text}</Text>
                    {comment.title && (
                      <Text style={styles.deficiencyDesc} numberOfLines={3}>{comment.text}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No deficiencies noted</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating capture bar — slides right when audio sheet is active */}
        <View style={styles.floatingBar}>
          <CaptureActionBar
            sectionId={sectionId}
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

      {/* Coachmark — Ai queue added */}
      <CoachmarkOverlay
        show={showCoachmark}
        onDismiss={dismissCoachmark}
        topOffset={insets.top + 72}
        title="You've added an input to the Ai Queue!"
        items={[{ iconName: 'arrow-pointer', description: 'Go back to the queue when ready to process' }]}
      />


      {/* Recording warning sheet */}
      <AppBottomSheet
        visible={recordingWarningVisible}
        onClose={() => setRecordingWarningVisible(false)}
      >
        <View style={styles.warningSheet}>
          <Text style={styles.warningTitle}>Stop recording?</Text>
          <Text style={styles.warningBody}>
            Navigating to a different section will stop your current recording.
          </Text>
          <TouchableOpacity
            style={styles.warningLeaveButton}
            activeOpacity={0.8}
            onPress={() => {
              const target = pendingSectionId.current;
              pendingSectionId.current = null;
              setRecordingWarningVisible(false);
              if (target) {
                isRecordingRef.current = false;
                cancelRecording();
                navigation.replace('SectionDetail', { sectionId: target });
              }
            }}
          >
            <Text style={styles.warningLeaveText}>Stop Recording & Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.warningStayButton}
            activeOpacity={0.8}
            onPress={() => setRecordingWarningVisible(false)}
          >
            <Text style={styles.warningStayText}>Stay & Finish</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

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
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 96 },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#052339',
  },

  // ── Content sections (Information / Deficiencies) ─────────────────────────
  contentSection: {
    borderRadius: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: -16,
  },
  contentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  contentSectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Options grid ──────────────────────────────────────────────────────────
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
  },
  optionCell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#0779ac',
    borderColor: '#0779ac',
  },
  optionCellLabel: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  optionCellLabelChecked: {
    color: '#052339',
    fontWeight: '500',
  },
  otherCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Action button rows ────────────────────────────────────────────────────
  itemActionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  actionButtonBorder: {
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  actionButtonLabel: {
    fontSize: 11,
    color: '#6b7280',
  },

  // ── Deficiency rows ───────────────────────────────────────────────────────
  deficiencyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  deficiencyRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  deficiencyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    marginTop: 2,
    flexShrink: 0,
  },
  deficiencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#052339',
    marginBottom: 2,
  },
  deficiencyDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 17,
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  emptySectionText: {
    fontSize: 14,
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
  warningSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#052339',
  },
  warningBody: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  warningLeaveButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  warningLeaveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  warningStayButton: {
    backgroundColor: '#eef1f7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  warningStayText: {
    color: '#052339',
    fontSize: 15,
    fontWeight: '500',
  },
});
