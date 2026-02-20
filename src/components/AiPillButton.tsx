import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import CameraIcon from '../../assets/CaptureActionBar/icon/camera-gen.svg';
import MicIcon from '../../assets/CaptureActionBar/icon/voice-gen.svg';
import GalleryIcon from '../../assets/CaptureActionBar/icon/gallery-gen.svg';

const ICONS = {
  camera: CameraIcon,
  microphone: MicIcon,
  image: GalleryIcon,
} as const;

type IconName = keyof typeof ICONS;

interface AiPillButtonProps {
  iconName: IconName;
  onPress: () => void;
}

export function AiPillButton({ iconName, onPress }: AiPillButtonProps) {
  const Icon = ICONS[iconName];
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Icon width={24} height={24} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
});
