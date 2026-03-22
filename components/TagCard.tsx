import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

interface TagCardProps {
  name: string;
}

export const TagCard = ({ name }: TagCardProps) => {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.light.tint + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: "600",
  },
});
