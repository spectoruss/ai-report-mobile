import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS, Rating, Comment, mockAiMatch } from '../data/mockData';
import { CaptureActionBar } from '../components/CaptureActionBar';
import { AudioBottomSheet } from '../components/AudioBottomSheet';
import { MatchedCommentBanner } from '../components/MatchedCommentBanner';

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
  const [inputType, setInputType] = useState<InputType>('mic');
  const [matchedComment, setMatchedComment] = useState<Comment | null>(null);
  const [activeSubsectionId, setActiveSubsectionId] = useState<string | null>(null);

  function setRating(subsectionId: string, rating: Rating) {
    setRatings(prev => ({ ...prev, [subsectionId]: rating }));
  }

  function openInput(type: InputType, subsectionId?: string) {
    setInputType(type);
    setActiveSubsectionId(subsectionId ?? section.subsections[0].id);
    setAudioSheetVisible(true);
  }

  function handleAudioConfirm(transcript: string) {
    setAudioSheetVisible(false);
    const matched = mockAiMatch(transcript);
    setMatchedComment(matched);
  }

  function handleAcceptComment(comment: Comment) {
    if (activeSubsectionId) {
      setComments(prev => ({
        ...prev,
        [activeSubsectionId]: [...(prev[activeSubsectionId] || []), comment],
      }));
    }
    setMatchedComment(null);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.dynamicIsland} />
        <Text style={styles.statusIcons}>▲ ■</Text>
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Residential Report</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.syncIcon}>↑☁</Text>
        </TouchableOpacity>
      </View>

      {/* Section content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {section.subsections.map(subsection => {
          const currentRating = ratings[subsection.id];
          const subsectionComments = comments[subsection.id] || [];

          return (
            <View key={subsection.id}>
              {/* Subsection row */}
              <TouchableOpacity
                style={styles.subsectionRow}
                onPress={() => openInput('mic', subsection.id)}
                activeOpacity={0.7}
              >
                <View style={styles.subsectionLeft}>
                  <View style={styles.checkCircle} />
                </View>
                <Text style={styles.subsectionTitle} numberOfLines={1}>
                  {subsection.title}
                </Text>
                <View style={styles.subsectionRight}>
                  <Text style={styles.chevron}>›</Text>
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

      {/* AI matched comment banner */}
      <MatchedCommentBanner
        comment={matchedComment}
        onAccept={handleAcceptComment}
        onDismiss={() => setMatchedComment(null)}
      />

      {/* Bottom action bar */}
      <CaptureActionBar
        onMicPress={() => openInput('mic')}
        onCameraAiPress={() => openInput('camera')}
        onPhotoPress={() => openInput('photo')}
      />

      {/* Section nav bar */}
      <View style={[styles.sectionNavBar, { paddingBottom: insets.bottom + 4 }]}>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchIcon}>⌕</Text>
        </TouchableOpacity>
        <View style={styles.sectionPill}>
          <Text style={styles.sectionPillText}>≡ {section.title}</Text>
        </View>
        <TouchableOpacity style={styles.navArrow}>
          <Text style={styles.navArrowText}>∧</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navArrow}>
          <Text style={styles.navArrowText}>∨</Text>
        </TouchableOpacity>
      </View>

      {/* Audio recording sheet */}
      <AudioBottomSheet
        visible={audioSheetVisible}
        onCancel={() => setAudioSheetVisible(false)}
        onConfirm={handleAudioConfirm}
        inputType={inputType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 20, color: '#052339', fontWeight: '600' },
  syncIcon: { fontSize: 14, color: '#052339' },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
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
  chevron: { fontSize: 22, color: '#6b7280', fontWeight: '300' },
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
  sectionNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  searchBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: { fontSize: 20, color: '#09334b' },
  sectionPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 100,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sectionPillText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#052339',
  },
  navArrow: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: { fontSize: 18, color: '#052339', fontWeight: '600' },
});
