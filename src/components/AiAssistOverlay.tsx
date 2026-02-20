import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome7Pro } from './FontAwesome7Pro';

interface AiAssistOverlayProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
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

export function AiAssistOverlay({ visible, onClose, initialQuery = '' }: AiAssistOverlayProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MockSection[] | null>(null);

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      if (initialQuery.trim()) {
        setResults(MOCK_RESULTS);
      }
    } else {
      setResults(null);
    }
  }, [visible, initialQuery]);

  function handleClear() {
    setQuery('');
    setResults(null);
    onClose();
  }

  function handleSubmit() {
    if (query.trim()) {
      setResults(MOCK_RESULTS);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Search field — transposed from the top bar */}
        <View style={styles.searchHeader}>
          <View style={styles.searchPill}>
            <FontAwesome7Pro name="magnifying-glass" size={18} color="#09334b" />
            <TextInput
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
                onPress={handleClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome7Pro name="xmark-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {results ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
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
          <View style={styles.emptyState}>
            <FontAwesome7Pro name="magnifying-glass" size={28} color="#d1d5db" />
            <Text style={styles.emptyText}>Search across all report sections</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f9',
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
  cancelButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 15,
    color: '#0779ac',
    fontWeight: '500',
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
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
  },
});
