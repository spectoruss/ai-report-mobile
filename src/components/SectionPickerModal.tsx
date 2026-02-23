import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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

      {/* Floating add button — liquid glass circle */}
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
          {/* Blur layer */}
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFillObject} />
          {/* Cool glass tint */}
          <View style={styles.addButtonTint} pointerEvents="none" />
          {/* Specular ring highlight */}
          <View style={styles.addButtonSpecular} pointerEvents="none" />
          <FontAwesome7Pro name="plus" size={16} color="#1a3a52" />
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
          {/* Blur layer — fills entire panel */}
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFillObject} />

          {/* Cool glass tint overlay */}
          <View style={styles.glassTint} pointerEvents="none" />

          {/* Top-edge specular sheen — catches the light */}
          <LinearGradient
            colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.specular}
            pointerEvents="none"
          />

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

  // ── Add button ────────────────────────────────────────────────────────────
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  addButtonTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(200, 218, 238, 0.18)',
  },
  // thin inner ring at top half — simulates specular arc on a sphere
  addButtonSpecular: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: ADD_BTN_SIZE * 0.38,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },

  // ── Panel ─────────────────────────────────────────────────────────────────
  panelWrap: {
    position: 'absolute',
    left: PANEL_LEFT,
    right: PANEL_RIGHT,
    bottom: 12,
    zIndex: 51,
    // iOS/Android shadow
    shadowColor: '#09334b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 14,
    // Web layered shadow
    ...({ boxShadow: '0 10px 40px rgba(9,51,75,0.22), 0 2px 8px rgba(9,51,75,0.10)' } as any),
  },
  panel: {
    borderRadius: 20,
    maxHeight: PANEL_MAX_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },

  // ── Rows ──────────────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(8, 40, 68, 0.09)',
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
