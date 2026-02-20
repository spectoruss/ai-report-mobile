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

// Left aligns with section pill start: padding(12) + back-button(48) + gap(8) = 68
const PANEL_LEFT = 68;
const PANEL_RIGHT = 12;
const PANEL_MAX_HEIGHT = 344;
const ADD_BTN_SIZE = 48;

interface SectionPickerModalProps {
  visible: boolean;
  currentSectionId: string;
  onSelect: (sectionId: string) => void;
  onClose: () => void;
  onAddSection?: () => void;
}

export function SectionPickerModal({
  visible,
  currentSectionId,
  onSelect,
  onClose,
  onAddSection,
}: SectionPickerModalProps) {
  const insets = useSafeAreaInsets();

  // Panel: scale from bottom
  const scaleAnim = useRef(new Animated.Value(0.01)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const oneRef = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(
    Animated.multiply(
      Animated.subtract(oneRef, scaleAnim),
      PANEL_MAX_HEIGHT / 2
    )
  ).current;

  // Add button: slide up from panel top + fade
  const btnTranslateY = useRef(
    Animated.multiply(Animated.subtract(oneRef, opacityAnim), 10)
  ).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.01);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 28,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Full-screen backdrop */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFillObject, styles.backdrop]}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Floating add button — fades in above the panel */}
      <Animated.View
        style={[
          styles.addButtonWrap,
          {
            opacity: opacityAnim,
            transform: [{ translateY: btnTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => {
            onClose();
            onAddSection?.();
          }}
        >
          <FontAwesome7Pro name="plus" size={16} color="#052339" />
        </TouchableOpacity>
      </Animated.View>

      {/* Panel — grows upward from the pill position */}
      <Animated.View
        style={[
          styles.panelWrap,
          {
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }, { scaleY: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.panel, { paddingBottom: insets.bottom + 8 }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {REPORT_SECTIONS.map((section) => {
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
                  <FontAwesome7Pro
                    name={section.icon}
                    size={16}
                    color={isActive ? '#0779ac' : '#647382'}
                  />
                  <Text
                    style={[styles.rowTitle, isActive && styles.rowTitleActive]}
                    numberOfLines={1}
                  >
                    {section.title}
                  </Text>
                  {isActive && (
                    <FontAwesome7Pro name="check" size={13} color="#0779ac" />
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

  // Floating add button — sits flush at panel top
  addButtonWrap: {
    position: 'absolute',
    left: PANEL_LEFT,
    bottom: PANEL_MAX_HEIGHT + 12,
    zIndex: 52,
  },
  addButton: {
    width: ADD_BTN_SIZE,
    height: ADD_BTN_SIZE,
    borderRadius: ADD_BTN_SIZE / 2,
    backgroundColor: '#eef1f7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Panel — offset from left, grows from pill position
  panelWrap: {
    position: 'absolute',
    left: PANEL_LEFT,
    right: PANEL_RIGHT,
    bottom: 12,
    zIndex: 51,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 14,
  },
  panel: {
    backgroundColor: '#eef1f7',
    borderRadius: 16,
    maxHeight: PANEL_MAX_HEIGHT,
    overflow: 'hidden',
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
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginHorizontal: 6,
    marginVertical: 2,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: '#ffffff',
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
