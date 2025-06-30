import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLikePostMutation } from '../api/feedApi';
import { Colors } from '../constants/theme';
import { formatRelativeTime } from '../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POST_HEIGHT = SCREEN_WIDTH * 1.25;

const PostCard = ({ post, index, isFirst, isLast }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [voteCount, setVoteCount] = useState(post.votes_count || 0);
  
  const [likePost] = useLikePostMutation();

  const imageUrl = post.media && post.media.length > 0 
    ? post.media[0].url 
    : post.product_images?.[0] || 'https://via.placeholder.com/400x500.png?text=No+Image';
  
  const isVideo = post.type === 'story' && post.media && post.media[0]?.type === 'video';
  const isLive = post.type === 'live_announcement';
  const isOnSale = post.is_on_sale;
  const originalPrice = parseFloat(post.price);
  const displayPrice = isOnSale && post.sale_price ? parseFloat(post.sale_price) : originalPrice;

  const handleLike = async () => {
    const wasLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
    
    try {
      await likePost(post.id).unwrap();
    } catch (error) {
      setIsLiked(wasLiked);
      setLikeCount(prevCount);
      console.error('Failed to like post:', error);
    }
  };

  const handleVote = () => {
    setVoteCount(prev => prev + 1);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${post.product_title} by @${post.username} on Pipal!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, isFirst && styles.firstPost, isLast && styles.lastPost]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo}>
          <Image
            source={{ uri: post.profile_image_url || 'https://via.placeholder.com/40x40.png?text=U' }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{post.username}</Text>
              {post.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              )}
            </View>
            <Text style={styles.timestamp}>{formatRelativeTime(post.created_at)}</Text>
          </View>
        </TouchableOpacity>
        
        {(isVideo || isLive) && (
          <View style={[styles.badge, isLive && styles.liveBadge]}>
            <Ionicons name={isLive ? "radio" : "play"} size={12} color="white" />
            <Text style={styles.badgeText}>{isLive ? 'LIVE' : 'VIDEO'}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity>
        <View style={styles.mediaContainer}>
          <Image source={{ uri: imageUrl }} style={styles.media} resizeMode="cover" />
          {isVideo && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="white" />
            </View>
          )}
          {isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#E91E63" : "#333"} 
            />
            <Text style={styles.actionCount}>{likeCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
            <Text style={styles.actionCount}>{post.comments_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        
        {isLive && (
          <TouchableOpacity style={styles.voteButton} onPress={handleVote}>
            <Ionicons name="flash" size={20} color="#FF9500" />
            <Text style={styles.voteText}>Vote Live ({voteCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <TouchableOpacity>
          <Text style={styles.productTitle}>{post.product_title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${displayPrice.toFixed(2)}</Text>
            {isOnSale && (
              <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
            )}
            {isOnSale && (
              <View style={styles.saleTag}>
                <Text style={styles.saleText}>SALE</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {post.caption && (
          <Text style={styles.caption}>
            <Text style={styles.username}>{post.username}</Text> {post.caption}
          </Text>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tags}>
            {post.tags.slice(0, 3).map((tag, idx) => (
              <Text key={idx} style={styles.tag}>#{tag}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 24,
  },
  firstPost: {
    marginTop: 8,
  },
  lastPost: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadge: {
    backgroundColor: '#E91E63',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  mediaContainer: {
    position: 'relative',
  },
  media: {
    width: SCREEN_WIDTH,
    height: POST_HEIGHT,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionCount: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  voteText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  saleTag: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  saleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 12,
    color: '#1976D2',
    marginRight: 8,
    marginBottom: 4,
  },
});

export default PostCard;
