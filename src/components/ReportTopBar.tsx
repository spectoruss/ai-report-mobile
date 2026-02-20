import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from './IconButton';
import { useAiQueue } from '../context/AiQueueContext';

interface ReportTopBarProps {
  navigation: any;
  onBack?: () => void;
}

export function ReportTopBar({ navigation, onBack }: ReportTopBarProps) {
  const { queue, processingBySection } = useAiQueue();
  const processingCount = Object.values(processingBySection).reduce((sum, s) => sum + s.count, 0);
  const totalCount = queue.length + processingCount;

  return (
    <View style={styles.topBar}>
      {onBack && (
        <IconButton
          name="arrow-left"
          iconColor="#052339"
          backgroundColor="rgba(0,0,0,0.05)"
          onPress={onBack}
        />
      )}
      <Text style={styles.title}>Residential Report</Text>
      <View>
        <IconButton
          name="cloud-arrow-up"
          iconColor="#052339"
          onPress={() => navigation.navigate('AiObservations')}
        />
        {totalCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalCount}</Text>
          </View>
        )}
      </View>
      <IconButton name="bolt" iconColor="#09334b" backgroundColor="#eef1f7" />
      <IconButton
        name="ellipsis-vertical"
        iconColor="#052339"
        onPress={() => navigation.navigate('ToolbarConfig')}
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
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
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
