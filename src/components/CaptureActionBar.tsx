import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton } from './IconButton';
import { CaptureAiPill } from './CaptureAiPill';
import { useToolbar } from '../context/ToolbarContext';

interface CaptureActionBarProps {
  onMicPress: () => void;
  onCameraAiPress: () => void;
  onPhotoPress: () => void;
}

export function CaptureActionBar({ onMicPress, onCameraAiPress, onPhotoPress }: CaptureActionBarProps) {
  const { visibility } = useToolbar();

  const hasAnyUtility = visibility.torch || visibility.cya;

  const utilities = hasAnyUtility ? (
    <View style={styles.sideGroup}>
      {visibility.torch && <IconButton name="bolt" iconColor="#09334b" backgroundColor="transparent" />}
      {visibility.cya && <IconButton name="aperture" iconColor="#09334b" backgroundColor="transparent" />}
    </View>
  ) : (
    <View style={styles.placeholder} />
  );

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0)', '#ffffff']}
      locations={[0, 0.35]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {utilities}
      <CaptureAiPill
        onCameraPress={onCameraAiPress}
        onMicPress={onMicPress}
        onPhotoPress={onPhotoPress}
        showCamera={visibility.camera}
        showMic={visibility.audio}
        showPhoto={visibility.gallery}
      />
      {/* Mirror placeholder keeps pill centered when utilities are hidden */}
      <View style={styles.placeholder} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sideGroup: {
    flexDirection: 'row',
    backgroundColor: '#eef1f7',
    borderRadius: 100,
  },
  placeholder: {
    width: 48,
  },
});
