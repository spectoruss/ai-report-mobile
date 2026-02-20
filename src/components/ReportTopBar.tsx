import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  const { queue, processingBySection } = useAiQueue();
  const processingCount = Object.values(processingBySection).reduce((sum, s) => sum + s.count, 0);
  const totalCount = queue.length + processingCount;

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

      <TouchableOpacity
        style={styles.searchPill}
        activeOpacity={0.7}
        onPress={() => setSearchVisible(true)}
      >
        <FontAwesome7Pro name="magnifying-glass" size={18} color="#09334b" />
        <Text style={styles.searchPlaceholder}>Search</Text>
      </TouchableOpacity>

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

      <AiAssistOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />
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
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#647382',
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
});
