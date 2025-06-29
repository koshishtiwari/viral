import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLikePostMutation, useUnlikePostMutation } from '../api/feedApi';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { formatRelativeTime, formatPrice, formatNumber } from '../utils/formatters';
import { showErrorToast } from '../utils/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  // Extract image URL from media array
  const imageUrl = post.media && post.media.length > 0 ? post.media[0].url : null;
  
  // Build user object from flat structure
  const user = {
    username: post.username,
    profilePicture: post.profile_image_url,
    isVerified: post.is_verified,
  };
  
  // Build product object from flat structure
  const product = {
    title: post.product_title,
    price: parseFloat(post.price),
    images: post.product_images,
  };

  const handleLike = async () => {
    const wasLiked = isLiked;
    const prevCount = likeCount;
    
    // Optimistic update
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
    
    try {
      if (wasLiked) {
        await unlikePost(post.id).unwrap();
      } else {
        await likePost(post.id).unwrap();
      }
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
      showErrorToast('Error', 'Failed to update like');
    }
  };

  const renderUserInfo = () => (
    <View style={styles.userContainer}>
      <Image
        source={{ uri: user.profilePicture || 'https://via.placeholder.com/40' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.timestamp}>{formatRelativeTime(post.created_at)}</Text>
      </View>
    </View>
  );

  const renderProductInfo = () => {
    if (!product) return null;
    
    return (
      <View style={styles.productContainer}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? Colors.error : Colors.text.primary}
        />
        <Text style={styles.actionText}>{formatNumber(likeCount)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="chatbubble-outline" size={24} color={Colors.text.primary} />
        <Text style={styles.actionText}>{formatNumber(post.comments_count || 0)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="share-outline" size={24} color={Colors.text.primary} />
      </TouchableOpacity>
      
      <View style={styles.spacer} />
      
      {product && (
        <TouchableOpacity style={styles.shopButton}>
          <Ionicons name="bag-outline" size={20} color={Colors.text.white} />
          <Text style={styles.shopButtonText}>Shop</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderUserInfo()}
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/400x300' }}
          style={styles.postImage}
          resizeMode="cover"
        />
        {product && renderProductInfo()}
      </View>
      
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption} numberOfLines={3}>
            {post.caption}
          </Text>
        </View>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      {renderActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey.light,
  },
  userInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  username: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: Colors.grey.light,
  },
  productContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  productTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.white,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  captionContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  caption: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  shopButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.white,
    marginLeft: Spacing.xs,
  },
});

export default PostCard;
