import { apiSlice } from './apiSlice';

export const feedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDiscoveryFeed: builder.query({
      query: ({ page = 1, limit = 10, category, tags, userId } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(category && { category }),
          ...(tags && { tags: tags.join(',') }),
          ...(userId && { userId }),
        });
        return `/posts/feed?${params}`;
      },
      providesTags: (result, error, { page }) => [
        { type: 'Post', id: 'FEED' },
        { type: 'Post', id: `FEED-${page}` },
      ],
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...rest } = queryArgs;
        return rest;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...(currentCache.data || []), ...newItems.data],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    getPost: builder.query({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    unlikePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/unlike`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: [{ type: 'Post', id: 'FEED' }],
    }),
    updatePost: builder.mutation({
      query: ({ postId, ...updates }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    searchPosts: builder.query({
      query: ({ query, page = 1, limit = 10 }) => {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: limit.toString(),
        });
        return `/posts/search?${params}`;
      },
      providesTags: ['Post'],
    }),
  }),
});

export const {
  useGetDiscoveryFeedQuery,
  useGetPostQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetCategoriesQuery,
  useSearchPostsQuery,
} = feedApi;
