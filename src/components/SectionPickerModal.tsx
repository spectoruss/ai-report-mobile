import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { REPORT_SECTIONS } from '../data/mockData';
import { FontAwesome7Pro } from './FontAwesome7Pro';

// Height of the bottom bar in both screens (border + paddingTop + button + paddingBottom)
const BOTTOM_BAR_HEIGHT = 73;
const PANEL_MAX_HEIGHT = 312;

interface SectionPickerModalProps {
  visible: boolean;
  currentSectionId: string;
  onSelect: (sectionId: string) => void;
  onClose: () => void;
}

export function SectionPickerModal({ visible, currentSectionId, onSelect, onClose }: SectionPickerModalProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.01)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // translateY = PANEL_MAX_HEIGHT/2 * (1 - scale) — keeps bottom edge fixed during scale
  const oneRef = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(
    Animated.multiply(
      Animated.subtract(oneRef, scaleAnim),
      PANEL_MAX_HEIGHT / 2
    )
  ).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.01);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 280,
          friction: 26,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const bottomPosition = insets.bottom + BOTTOM_BAR_HEIGHT + 8;

  return (
    <>
      {/* Backdrop — tap anywhere to close */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFillObject, styles.backdrop]}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Dropdown panel — grows up from pill position */}
      <Animated.View
        style={[
          styles.shadow,
          {
            bottom: bottomPosition,
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }, { scaleY: scaleAnim }],
          },
        ]}
      >
        <View style={styles.panel}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {REPORT_SECTIONS.map((section, index) => {
              const isActive = section.id === currentSectionId;
              return (
                <TouchableOpacity
                  key={section.id}
                  style={[styles.row, isActive && styles.rowActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(section.id);
                    onClose();
                  }}
                >
                  <Text style={[styles.rowIndex, isActive && styles.rowIndexActive]}>
                    {index + 1}
                  </Text>
                  <FontAwesome7Pro name={section.icon} size={16} color={isActive ? '#0779ac' : '#647382'} />
                  <Text style={[styles.rowTitle, isActive && styles.rowTitleActive]} numberOfLines={1}>
                    {section.title}
                  </Text>
                  {isActive && (
                    <FontAwesome7Pro name="check" size={14} color="#0779ac" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 50,
  },
  shadow: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 51,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: PANEL_MAX_HEIGHT,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowActive: {
    backgroundColor: '#f0f9ff',
  },
  rowIndex: {
    width: 20,
    fontSize: 13,
    fontWeight: '500',
    color: '#c4cdd5',
    textAlign: 'center',
  },
  rowIndexActive: {
    color: '#0779ac',
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    color: '#052339',
    fontWeight: '400',
  },
  rowTitleActive: {
    fontWeight: '600',
    color: '#052339',
  },
});
