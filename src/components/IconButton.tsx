import React from 'react';
import { TouchableOpacity, View, ViewStyle, StyleSheet } from 'react-native';
import { FontAwesome7Pro } from './FontAwesome7Pro';

interface IconButtonProps {
  name: string;
  onPress?: () => void;
  iconColor?: string;
  iconSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function IconButton({
  name,
  onPress,
  iconColor = '#052339',
  iconSize = 18,
  backgroundColor = '#eef1f7',
  borderRadius = 100,
  style,
  disabled,
}: IconButtonProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.button, { backgroundColor, borderRadius }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <FontAwesome7Pro name={name} size={iconSize} color={iconColor} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
