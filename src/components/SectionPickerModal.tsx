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

const PANEL_MAX_HEIGHT = 340;

interface SectionPickerModalProps {
  visible: boolean;
  currentSectionId: string;
  onSelect: (sectionId: string) => void;
  onClose: () => void;
  onAddSection?: () => void;
}

export function SectionPickerModal({ visible, currentSectionId, onSelect, onClose, onAddSection }: SectionPickerModalProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.01)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
          tension: 300,
          friction: 28,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={[StyleSheet.absoluteFillObject, styles.backdrop]}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Panel — grows upward from bottom, covering the bottom bar */}
      <Animated.View
        style={[
          styles.wrapper,
          {
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }, { scaleY: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.panel, { paddingBottom: insets.bottom }]}>
          {/* Drag handle */}
          <View style={styles.handleRow} pointerEvents="none">
            <View style={styles.handle} />
          </View>

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

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onAddSection?.();
              }}
            >
              <View style={styles.addIconWrap}>
                <FontAwesome7Pro name="plus" size={13} color="#647382" />
              </View>
              <Text style={styles.addLabel}>New Section</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 50,
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 51,
    // Shadow casts upward (bottom sheet style)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: PANEL_MAX_HEIGHT,
    overflow: 'hidden',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowActive: {
    backgroundColor: '#f0f9ff',
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  addIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#eef1f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    fontSize: 15,
    color: '#647382',
    fontWeight: '400',
  },
});
