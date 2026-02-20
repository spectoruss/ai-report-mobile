import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome7Pro } from './FontAwesome7Pro';
import { useAiQueue } from '../context/AiQueueContext';
import { navigationRef } from '../navigation/navigationRef';

export function ProcessedBanner() {
  const { processedCount } = useAiQueue();

  if (processedCount === 0) return null;

  const label = processedCount === 1
    ? 'You have 1 Comment ready for review'
    : `You have ${processedCount} Comments ready for review`;

  function handlePress() {
    if (navigationRef.isReady()) {
      navigationRef.navigate('CommentMatch');
    }
  }

  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.8} onPress={handlePress}>
      <Text style={styles.text} numberOfLines={1}>{label}</Text>
      <FontAwesome7Pro name="chevron-right" size={14} color="#5a9292" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#ecf3f3',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#447474',
  },
});
