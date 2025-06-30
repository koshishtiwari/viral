import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  SafeAreaView,
} from 'react-native';
import { useGetDiscoveryFeedQuery } from '../../api/feedApi';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useRedux';

const DiscoveryScreen = () => {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Debug auth state
  console.log('DiscoveryScreen: Mounted with auth state:', {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user?.username,
    hasToken: !!auth.token
  });

  const {
    data: feedData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDiscoveryFeedQuery(
    { page: currentPage, limit: 10 },
    {
      // Don't skip - always try to load the feed
      skip: false,
    }
  );

  // Update posts when new data arrives
  React.useEffect(() => {
    if (feedData && feedData.data) {
      console.log('DiscoveryScreen: Received', feedData.data.length, 'posts');
      if (currentPage === 1) {
        // Reset for refresh or initial load
        setAllPosts(feedData.data);
      } else {
        // Append for pagination
        setAllPosts(prev => [...prev, ...feedData.data]);
      }
      setHasMore(feedData.hasMore || false);
      setIsLoadingMore(false);
      setRefreshing(false);
    } else if (error) {
      console.error('DiscoveryScreen: API Error:', error);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  }, [feedData, currentPage, error, isLoading, isFetching]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setAllPosts([]);
    setHasMore(true);
    setIsLoadingMore(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isFetching && currentPage > 0) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMore, isFetching, currentPage]);

  const renderPost = useCallback(({ item, index }) => (
    <PostCard
      post={item}
      index={index}
      isFirst={index === 0}
      isLast={index === allPosts.length - 1}
    />
  ), [allPosts.length]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading more posts...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No posts found</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to share something amazing!
        </Text>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>
        Pull down to refresh and try again
      </Text>
    </View>
  );

  if (isLoading && currentPage === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error && allPosts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderError()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={allPosts}
        renderItem={renderPost}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: 600, // Approximate post height
          offset: 600 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E91E63',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DiscoveryScreen;
