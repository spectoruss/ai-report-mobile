import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CaptureActionBarProps {
  onMicPress: () => void;
  onCameraAiPress: () => void;
  onPhotoPress: () => void;
}

export function CaptureActionBar({ onMicPress, onCameraAiPress, onPhotoPress }: CaptureActionBarProps) {
  return (
    <View style={styles.container}>
      {/* Left group — flashlight + lens */}
      <View style={styles.sideGroup}>
        <TouchableOpacity style={styles.sideButton}>
          <Text style={styles.sideIcon}>⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideButton}>
          <Text style={styles.sideIcon}>◎</Text>
        </TouchableOpacity>
      </View>

      {/* Center — blue primary pill with 3 AI inputs */}
      <View style={styles.primaryPill}>
        <TouchableOpacity style={styles.pillButton} onPress={onCameraAiPress}>
          <CameraAiIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pillButton} onPress={onMicPress}>
          <MicAiIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pillButton} onPress={onPhotoPress}>
          <PhotoAiIcon />
        </TouchableOpacity>
      </View>

      {/* Right — more options */}
      <View style={styles.sideGroup}>
        <TouchableOpacity style={styles.sideButtonLarge}>
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CameraAiIcon() {
  return (
    <View style={styles.aiIconContainer}>
      {/* Camera body */}
      <View style={styles.cameraBody}>
        <View style={styles.cameraLens} />
      </View>
      {/* Sparkle */}
      <View style={[styles.sparkle, { top: 2, right: 2 }]}>
        <Text style={styles.sparkleText}>✦</Text>
      </View>
    </View>
  );
}

function MicAiIcon() {
  return (
    <View style={styles.aiIconContainer}>
      <View style={styles.micBody}>
        <View style={styles.micHead} />
        <View style={styles.micStand} />
        <View style={styles.micBase} />
      </View>
      <View style={[styles.sparkle, { top: 1, right: 2 }]}>
        <Text style={styles.sparkleText}>✦</Text>
      </View>
    </View>
  );
}

function PhotoAiIcon() {
  return (
    <View style={styles.aiIconContainer}>
      {/* Image icon */}
      <View style={styles.photoFrame}>
        <View style={styles.photoMountain} />
        <View style={styles.photoSun} />
      </View>
      <View style={[styles.sparkle, { top: 1, right: 2 }]}>
        <Text style={styles.sparkleText}>✦</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: '#ffffff',
  },
  sideGroup: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#eef1f7',
    borderRadius: 100,
    padding: 4,
  },
  sideButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  sideButtonLarge: {
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: '#eef1f7',
  },
  sideIcon: {
    fontSize: 18,
    color: '#09334b',
  },
  moreIcon: {
    fontSize: 14,
    color: '#09334b',
    letterSpacing: 2,
  },
  primaryPill: {
    flexDirection: 'row',
    backgroundColor: '#0779ac',
    borderRadius: 100,
    padding: 4,
    gap: 4,
    overflow: 'hidden',
  },
  pillButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  aiIconContainer: {
    width: 26,
    height: 26,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 9,
    color: '#ffffff',
  },
  // Camera icon pieces
  cameraBody: {
    width: 22,
    height: 17,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 4,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 5,
  },
  // Mic icon pieces
  micBody: {
    alignItems: 'center',
    marginTop: 2,
  },
  micHead: {
    width: 10,
    height: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 5,
  },
  micStand: {
    width: 14,
    height: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#ffffff',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    marginTop: -1,
  },
  micBase: {
    width: 2,
    height: 3,
    backgroundColor: '#ffffff',
    marginTop: 1,
  },
  // Photo icon pieces
  photoFrame: {
    width: 22,
    height: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 3,
    marginTop: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  photoMountain: {
    width: 12,
    height: 8,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
    marginBottom: 0,
  },
  photoSun: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
});
