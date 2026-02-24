import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome7Pro } from './FontAwesome7Pro';
import { FontAwesome7ProSolid } from './FontAwesome7ProSolid';
import { CaptureAiPill } from './CaptureAiPill';
import { useAiQueue } from '../context/AiQueueContext';
import { useAudioRecording } from '../context/AudioRecordingContext';

export interface SectionContext {
  id: string;
  title: string;
  icon: string;
}

interface AiAssistOverlayProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
  sectionContext?: SectionContext;
  onCameraPress?: () => void;
  onMicPress?: () => void;
  onPhotoPress?: () => void;
  onSparklesPress?: () => void;
}

type Rating = 'IN' | 'NI' | 'NP' | 'D';

interface MockOption {
  label: string;
  checked: boolean;
}

interface MockItem {
  id: string;
  subsectionTitle: string;
  rating: Rating;
  options: MockOption[];
}

interface MockSection {
  id: string;
  title: string;
  color: string;
  items: MockItem[];
}

const MOCK_RESULTS: MockSection[] = [
  {
    id: 'roof',
    title: 'Roof',
    color: '#4a7c6b',
    items: [
      {
        id: 'r1',
        subsectionTitle: 'Roof Coverings',
        rating: 'NI',
        options: [
          { label: 'Asphalt', checked: true },
          { label: 'Fiberglass', checked: false },
          { label: 'Metal', checked: false },
          { label: 'Tile', checked: false },
        ],
      },
      {
        id: 'r2',
        subsectionTitle: 'Flashings',
        rating: 'D',
        options: [
          { label: 'Step Flashing', checked: true },
          { label: 'Counter Flashing', checked: true },
          { label: 'Drip Edge', checked: false },
        ],
      },
      {
        id: 'r3',
        subsectionTitle: 'Skylights & Vents',
        rating: 'IN',
        options: [
          { label: 'Ridge Vent', checked: true },
          { label: 'Soffit Vents', checked: true },
          { label: 'Gable Vents', checked: false },
        ],
      },
    ],
  },
  {
    id: 'exterior',
    title: 'Exterior',
    color: '#52a869',
    items: [
      {
        id: 'e1',
        subsectionTitle: 'Siding & Trim',
        rating: 'NI',
        options: [
          { label: 'Vinyl', checked: true },
          { label: 'Fiber Cement', checked: false },
          { label: 'Wood', checked: false },
        ],
      },
      {
        id: 'e2',
        subsectionTitle: 'Gutters & Downspouts',
        rating: 'NI',
        options: [
          { label: 'Aluminum', checked: true },
          { label: 'Seamless', checked: true },
          { label: 'Copper', checked: false },
        ],
      },
    ],
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    color: '#3a9bb0',
    items: [
      {
        id: 'p1',
        subsectionTitle: 'Water Heating Equipment',
        rating: 'NI',
        options: [
          { label: 'Gas Tank', checked: true },
          { label: 'Tankless — Gas', checked: false },
          { label: 'Electric Tank', checked: false },
        ],
      },
      {
        id: 'p2',
        subsectionTitle: 'Water Supply & Distribution',
        rating: 'IN',
        options: [
          { label: 'PEX', checked: true },
          { label: 'Copper', checked: false },
          { label: 'Galvanized Steel', checked: false },
        ],
      },
    ],
  },
  {
    id: 'heating',
    title: 'Heating',
    color: '#d97b3f',
    items: [
      {
        id: 'h1',
        subsectionTitle: 'Equipment',
        rating: 'NI',
        options: [
          { label: 'Gas Furnace', checked: true },
          { label: 'Heat Pump', checked: false },
          { label: 'Boiler', checked: false },
        ],
      },
      {
        id: 'h2',
        subsectionTitle: 'Distribution Systems',
        rating: 'NI',
        options: [
          { label: 'Ductwork', checked: true },
          { label: 'Baseboard', checked: false },
          { label: 'In-floor Radiant', checked: false },
        ],
      },
    ],
  },
];

const RATING_CONFIG: Record<Rating, { label: string; bg: string; text: string }> = {
  IN: { label: 'IN', bg: '#d1fae5', text: '#065f46' },
  NI: { label: 'NI', bg: '#fef3c7', text: '#92400e' },
  NP: { label: 'NP', bg: '#f3f4f6', text: '#374151' },
  D:  { label: 'DEF', bg: '#fee2e2', text: '#991b1b' },
};

function RatingBadge({ rating }: { rating: Rating }) {
  const cfg = RATING_CONFIG[rating];
  return (
    <View style={[styles.ratingBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.ratingText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function SearchResultRow({ item }: { item: MockItem }) {
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultRowHeader}>
        <Text style={styles.resultTitle}>{item.subsectionTitle}</Text>
        <RatingBadge rating={item.rating} />
      </View>
      <View style={styles.optionChips}>
        {item.options.map(opt => (
          <View
            key={opt.label}
            style={[styles.optionChip, opt.checked && styles.optionChipChecked]}
          >
            {opt.checked && (
              <FontAwesome7Pro name="check" size={9} color="#0779ac" />
            )}
            <Text
              style={[styles.optionChipText, opt.checked && styles.optionChipTextChecked]}
            >
              {opt.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AiAssistOverlay({
  visible,
  onClose,
  initialQuery = '',
  sectionContext,
  onCameraPress,
  onMicPress,
  onPhotoPress,
  onSparklesPress,
}: AiAssistOverlayProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MockSection[] | null>(null);
  const [scopeDismissed, setScopeDismissed] = useState(false);

  const { queue, processingBySection } = useAiQueue();
  const processingCount = Object.values(processingBySection).reduce((sum, s) => sum + s.count, 0);
  const totalCount = queue.length + processingCount;

  const { isRecording } = useAudioRecording();

  const isScoped = !!sectionContext && !scopeDismissed;
  const hasCaptureCallbacks = !!(onCameraPress || onMicPress || onPhotoPress) && !isRecording;

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setScopeDismissed(false);
      if (initialQuery.trim()) {
        setResults(MOCK_RESULTS);
      }
    } else {
      setResults(null);
      setScopeDismissed(false);
    }
  }, [visible, initialQuery]);

  function handleSubmit() {
    if (query.trim()) {
      setResults(MOCK_RESULTS);
    }
  }

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { paddingTop: insets.top }]}>
      {/* Search header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchPill}>
          <FontAwesome7Pro name="magnifying-glass" size={18} color="#09334b" />
          <TextInput
            autoFocus
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            placeholder="Search..."
            placeholderTextColor="#647382"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome7Pro name="xmark-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <View>
          <TouchableOpacity
            style={styles.sparklesButton}
            activeOpacity={0.7}
            onPress={onSparklesPress}
          >
            <FontAwesome7ProSolid name="sparkle" size={18} color="#052339" />
          </TouchableOpacity>
          {totalCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Section scope chip — contextual only, does not filter results */}
      {isScoped && (
        <View style={styles.scopeRow}>
          <View style={styles.scopeChip}>
            <FontAwesome7Pro name={sectionContext!.icon} size={12} color="#0779ac" />
            <Text style={styles.scopeChipText}>{sectionContext!.title}</Text>
            <TouchableOpacity
              onPress={() => setScopeDismissed(true)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <FontAwesome7Pro name="xmark" size={10} color="#0779ac" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {results ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: (hasCaptureCallbacks ? 72 : 0) + insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {results.map(section => (
            <View key={section.id} style={styles.sectionGroup}>
              <View style={[styles.sectionBanner, { backgroundColor: section.color }]}>
                <Text style={styles.sectionBannerText}>{section.title.toUpperCase()}</Text>
              </View>
              {section.items.map(item => (
                <SearchResultRow key={item.id} item={item} />
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.emptyState, { paddingBottom: hasCaptureCallbacks ? 72 : 0 }]}>
          <FontAwesome7Pro name="magnifying-glass" size={28} color="#d1d5db" />
          <Text style={styles.emptyText}>
            {isScoped
              ? `Search in ${sectionContext!.title}`
              : 'Search across all report sections'}
          </Text>
        </View>
      )}

      {/* Capture pill — pinned to bottom, non-interrupting */}
      {hasCaptureCallbacks && (
        <View style={[styles.captureBar, { paddingBottom: insets.bottom + 10 }]}>
          <CaptureAiPill
            showCamera={!!onCameraPress}
            showMic={!!onMicPress}
            showPhoto={!!onPhotoPress}
            onCameraPress={onCameraPress ?? (() => {})}
            onMicPress={onMicPress ?? (() => {})}
            onPhotoPress={onPhotoPress ?? (() => {})}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f6f8f9',
    zIndex: 999,
  },
  // Search header
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f6f8f9',
  },
  searchPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#09334b',
    paddingVertical: 0,
    outlineWidth: 0,
    outline: 'none',
    boxShadow: 'none',
    borderWidth: 0,
  } as any,
  sparklesButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0779ac',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  // Scope chip
  scopeRow: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  scopeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0779ac',
  },
  // Results
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  sectionGroup: {
    marginBottom: 8,
  },
  sectionBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  resultRow: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 10,
  },
  resultRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#09334b',
  },
  ratingBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  optionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
  },
  optionChipChecked: {
    backgroundColor: '#e0f2fe',
  },
  optionChipText: {
    fontSize: 12,
    color: '#647382',
  },
  optionChipTextChecked: {
    color: '#0779ac',
    fontWeight: '500',
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
  },
  // Capture bar
  captureBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f6f8f9',
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
  },
});
