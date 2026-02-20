import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AiPillButton } from './AiPillButton';

interface CaptureAiPillProps {
  onCameraPress: () => void;
  onMicPress: () => void;
  onPhotoPress: () => void;
  showCamera?: boolean;
  showMic?: boolean;
  showPhoto?: boolean;
}

export function CaptureAiPill({
  onCameraPress,
  onMicPress,
  onPhotoPress,
  showCamera = true,
  showMic = true,
  showPhoto = true,
}: CaptureAiPillProps) {
  if (!showCamera && !showMic && !showPhoto) return null;

  return (
    <View style={styles.pill}>
      {showCamera && <AiPillButton iconName="camera" onPress={onCameraPress} />}
      {showMic && <AiPillButton iconName="microphone" onPress={onMicPress} />}
      {showPhoto && <AiPillButton iconName="image" onPress={onPhotoPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    backgroundColor: '#0779ac',
    borderRadius: 100,
  },
});
