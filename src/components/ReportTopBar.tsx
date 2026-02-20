import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from './IconButton';
import { FontAwesome7Pro } from './FontAwesome7Pro';
import { useAiQueue } from '../context/AiQueueContext';
import { AiAssistOverlay } from './AiAssistOverlay';

interface ReportTopBarProps {
  navigation: any;
  onBack?: () => void;
  backIcon?: string;
}

export function ReportTopBar({ navigation, onBack, backIcon = 'arrow-left' }: ReportTopBarProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { queue, processingBySection } = useAiQueue();
  const processingCount = Object.values(processingBySection).reduce((sum, s) => sum + s.count, 0);
  const totalCount = queue.length + processingCount;

  function handleSearchSubmit() {
    if (searchQuery.trim()) {
      setSearchVisible(true);
    }
  }

  return (
    <View style={styles.topBar}>
      {/* Back button moved to bottom bar — restore by uncommenting:
      <IconButton
        name={backIcon}
        iconColor="#052339"
        backgroundColor="#eef1f7"
        borderRadius={16}
        onPress={onBack}
      />
      */}

      <View style={styles.searchPill}>
        <FontAwesome7Pro name="magnifying-glass" size={18} color="#09334b" />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#647382"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome7Pro name="xmark-circle" size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <View>
        <IconButton
          name="sparkles"
          iconColor="#052339"
          backgroundColor="#eef1f7"
          borderRadius={16}
          onPress={() => navigation.navigate('AiObservations')}
        />
        {totalCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalCount}</Text>
          </View>
        )}
      </View>

      <IconButton
        name="ellipsis-vertical"
        iconColor="#052339"
        backgroundColor="#eef1f7"
        borderRadius={16}
        onPress={() => navigation.navigate('ToolbarConfig')}
      />

      <AiAssistOverlay
        visible={searchVisible}
        initialQuery={searchQuery}
        onClose={() => { setSearchVisible(false); setSearchQuery(''); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#09334b',
    paddingVertical: 0,
    outlineWidth: 0,
    outline: 'none',
    boxShadow: 'none',
    borderWidth: 0,
  } as any,
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
});
