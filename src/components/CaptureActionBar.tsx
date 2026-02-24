import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton } from './IconButton';
import { CaptureAiPill } from './CaptureAiPill';
import { useToolbar } from '../context/ToolbarContext';
import { useAudioRecording } from '../context/AudioRecordingContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CaptureActionBarProps {
  onMicPress: () => void;
  onCameraAiPress: () => void;
  onPhotoPress: () => void;
  sectionId: string;
}

export function CaptureActionBar({ onMicPress, onCameraAiPress, onPhotoPress, sectionId }: CaptureActionBarProps) {
  const { handedness, visibility } = useToolbar();
  const { isRecording, recordingSectionId } = useAudioRecording();
  // Right-handed: dominant hand on right → utilities on left (out of the way)
  // Left-handed: dominant hand on left → utilities on right
  const utilitiesOnLeft = handedness === 'right';

  const hasAnyUtility = visibility.torch || visibility.cya;

  const isActiveSection = isRecording && recordingSectionId === sectionId;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isActiveSection ? SCREEN_WIDTH : 0,
      useNativeDriver: true,
      tension: 200,
      friction: 22,
    }).start();
  }, [isActiveSection]);

  return (
    <Animated.View
      style={{ transform: [{ translateX: slideAnim }] }}
      pointerEvents={isActiveSection ? 'none' : 'auto'}
    >
    <LinearGradient
      colors={['rgba(255,255,255,0)', '#ffffff']}
      locations={[0, 0.85]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Pill — perfectly centered */}
      <CaptureAiPill
        onCameraPress={onCameraAiPress}
        onMicPress={onMicPress}
        onPhotoPress={onPhotoPress}
        showCamera={visibility.camera}
        showMic={visibility.audio}
        showPhoto={visibility.gallery}
      />

      {/* Utilities — 16px from the appropriate edge */}
      {hasAnyUtility && (
        <View style={[styles.utilities, utilitiesOnLeft ? styles.utilitiesLeft : styles.utilitiesRight]}>
          <View style={styles.sideGroup}>
            {visibility.torch && <IconButton name="bolt" iconColor="#09334b" backgroundColor="transparent" />}
            {visibility.cya && <IconButton name="aperture" iconColor="#09334b" backgroundColor="transparent" />}
          </View>
        </View>
      )}
    </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 12,
  },
  utilities: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  utilitiesLeft: {
    left: 16,
  },
  utilitiesRight: {
    right: 16,
  },
  sideGroup: {
    flexDirection: 'row',
    backgroundColor: '#eef1f7',
    borderRadius: 100,
  },
});
