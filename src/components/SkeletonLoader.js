import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.grey.light,
  },
});

export default SkeletonLoader;
