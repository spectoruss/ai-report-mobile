import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';

interface CommentMatchScreenProps {
  navigation: any;
}

export function CommentMatchScreen({ navigation }: CommentMatchScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton
          name="xmark"
          iconColor="#052339"
          backgroundColor="rgba(0,0,0,0.05)"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Comment Match</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyText}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#052339',
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
