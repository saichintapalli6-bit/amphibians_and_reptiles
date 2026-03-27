import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

export default function ScatteredDotsBackground() {
  const { width, height } = useWindowDimensions();
  
  // Generate 80 random dots only once
  const dots = useMemo(() => {
    const newDots = [];
    for (let i = 0; i < 80; i++) {
      const size = Math.random() * 3 + 3; // Random size between 3px and 6px
      newDots.push({
        id: i,
        width: size,
        height: size,
        left: Math.random() * width,
        top: Math.random() * height,
      });
    }
    return newDots;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {dots.map((dot) => (
        <View
          key={dot.id}
          style={{
            position: 'absolute',
            left: dot.left,
            top: dot.top,
            width: dot.width,
            height: dot.height,
            backgroundColor: 'rgba(150, 150, 150, 0.4)',
            borderRadius: dot.width / 2,
          }}
        />
      ))}
    </View>
  );
}
