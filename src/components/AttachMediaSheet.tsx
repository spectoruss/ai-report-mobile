import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome7Pro } from './FontAwesome7Pro';

interface AttachMediaSheetProps {
  onOpenGallery: () => void;
  onTakePhotos: () => void;
  onNotNow: () => void;
}

export function AttachMediaSheet({ onOpenGallery, onTakePhotos, onNotNow }: AttachMediaSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.card, { paddingBottom: insets.bottom + 14 }]}>
      {/* Text content */}
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Attach media ?</Text>
        </View>
        <Text style={styles.subtitle}>
          Add media to your audio input to give the ai model better context and improve results
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.primaryRow}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={onOpenGallery}>
            <FontAwesome7Pro name="images" size={14} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Open gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={onTakePhotos}>
            <FontAwesome7Pro name="camera" size={14} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Take photos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onNotNow}>
          <Text style={styles.secondaryButtonText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingTop: 14,
    overflow: 'hidden',
  },
  textContainer: {
    paddingVertical: 16,
    gap: 0,
  },
  titleRow: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212731',
    textAlign: 'center',
    lineHeight: 33.6,
  },
  subtitle: {
    fontSize: 16,
    color: '#647382',
    textAlign: 'center',
    lineHeight: 28,
  },
  actions: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#052339',
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    height: 56,
    backgroundColor: '#eef1f7',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
