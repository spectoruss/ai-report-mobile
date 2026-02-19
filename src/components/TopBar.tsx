import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
}

export function TopBar({ title, onBack, rightIcon }: TopBarProps) {
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
        {onBack ? (
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Text style={styles.iconButtonText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {rightIcon ? (
          <View style={styles.iconButton}>{rightIcon}</View>
        ) : (
          <View style={styles.iconButton} />
        )}
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
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 20,
    color: '#052339',
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
});
