import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Comment } from '../data/mockData';

interface MatchedCommentBannerProps {
  comment: Comment | null;
  onAccept: (comment: Comment) => void;
  onDismiss: () => void;
}

export function MatchedCommentBanner({ comment, onAccept, onDismiss }: MatchedCommentBannerProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (comment) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [comment]);

  if (!comment) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✦</Text>
        <Text style={styles.headerText}>AI matched a comment</Text>
        <TouchableOpacity onPress={onDismiss}>
          <FontAwesome6 name="xmark" size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.commentText} numberOfLines={3}>{comment.text}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(comment)}>
          <Text style={styles.acceptButtonText}>Add to Report</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#052339',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIcon: {
    color: '#f59e0b',
    fontSize: 12,
  },
  headerText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: '#0779ac',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
