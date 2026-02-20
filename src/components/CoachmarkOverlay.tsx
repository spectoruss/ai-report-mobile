import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAiQueue } from '../context/AiQueueContext';
import { FontAwesome7Pro } from './FontAwesome7Pro';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CoachmarkOverlayProps {
  topOffset?: number;
}

export function CoachmarkOverlay({ topOffset = 114 }: CoachmarkOverlayProps) {
  const { showCoachmark, dismissCoachmark } = useAiQueue();
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (showCoachmark) {
      translateX.setValue(SCREEN_WIDTH);
      const delay = setTimeout(() => {
        Animated.spring(translateX, {
          toValue: 0,
          tension: 320,
          friction: 28,
          useNativeDriver: true,
        }).start();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [showCoachmark]);

  if (!showCoachmark) return null;

  return (
    <Animated.View
      style={[styles.overlay, { top: topOffset, transform: [{ translateX }] }]}
      pointerEvents="box-none"
    >
      {/* Caret arrow pointing up toward the sparkles button */}
      <View style={styles.caretRow} pointerEvents="none">
        <View style={styles.caret} />
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Decorative blob */}
        <View style={styles.blob} pointerEvents="none" />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>You've added an input to the Ai Queue!</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <FontAwesome7Pro name="arrow-pointer" size={12} color="#5cff9d" />
              </View>
            </View>
            <Text style={styles.description}>
              Go back to the queue when ready to process
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={dismissCoachmark}
            activeOpacity={0.85}
          >
            <Text style={styles.nextLabel}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 100,
  },
  caretRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 67,
    marginBottom: -12,
  },
  caret: {
    width: 23,
    height: 23,
    backgroundColor: '#00243b',
    transform: [{ rotate: '45deg' }],
  },
  card: {
    backgroundColor: '#00243b',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 14,
  },
  blob: {
    position: 'absolute',
    width: 212,
    height: 212,
    borderRadius: 106,
    backgroundColor: 'rgba(9, 164, 233, 0.28)',
    left: -74,
    top: -65,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  titleRow: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconOuter: {
    width: 32,
    height: 32,
    borderRadius: 43,
    backgroundColor: 'rgba(9, 164, 233, 0.3)',
    borderWidth: 4,
    borderColor: 'rgba(9, 164, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconInner: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  nextButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 100,
    height: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  nextLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
