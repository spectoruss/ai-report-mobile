import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { FontAwesome7Pro } from './FontAwesome7Pro';
import { AiAssistOverlay } from './AiAssistOverlay';

interface SearchPillProps {
  style?: ViewStyle;
}

export function SearchPill({ style }: SearchPillProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.pill, style]}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <FontAwesome7Pro name="magnifying-glass" size={16} color="#052339" />
        <Text style={styles.placeholder}>Search observations...</Text>
      </TouchableOpacity>
      <AiAssistOverlay visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 48,
    backgroundColor: '#eef1f7',
    borderRadius: 100,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholder: {
    fontSize: 15,
    color: '#9ca3af',
  },
});
