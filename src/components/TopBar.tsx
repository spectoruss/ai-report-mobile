import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  rightIconName?: string;
  onRightPress?: () => void;
}

export function TopBar({ title, onBack, rightIconName = 'cloud-arrow-up', onRightPress }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Status bar row */}
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.dynamicIsland} />
        <View style={styles.statusIcons}>
          <Text style={styles.statusIcon}>▲▲▲</Text>
          <Text style={styles.statusIcon}>■</Text>
        </View>
      </View>

      {/* Title row */}
      <View style={styles.titleRow}>
        <IconButton
          name={onBack ? 'arrow-left' : 'arrow-left'}
          onPress={onBack}
          iconColor="#052339"
          style={onBack ? undefined : styles.invisible}
        />
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <IconButton
          name={rightIconName}
          onPress={onRightPress}
          iconColor="#052339"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    minWidth: 40,
  },
  dynamicIsland: {
    width: 122,
    height: 30,
    backgroundColor: '#000000',
    borderRadius: 9999,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  statusIcon: {
    fontSize: 10,
    color: '#1f2937',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
  invisible: {
    opacity: 0,
  },
});
