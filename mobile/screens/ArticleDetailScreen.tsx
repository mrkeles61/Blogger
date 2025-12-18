import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";

type ArticleDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ArticleDetail"
>;

type ArticleDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ArticleDetail"
>;

type Props = {
  navigation: ArticleDetailScreenNavigationProp;
  route: ArticleDetailScreenRouteProp;
};

export default function ArticleDetailScreen({ route }: Props) {
  const { articleId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Article Detail (Stub)</Text>
        <Text style={styles.id}>ID: {articleId}</Text>
        <Text style={styles.text}>
          This is a placeholder for the article detail screen. The full content
          will be displayed here once the API integration is complete.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  id: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

