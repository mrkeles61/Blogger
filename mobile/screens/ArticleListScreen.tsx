import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { api, ArticlesResponse } from "../services/api";

type ArticleListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ArticleList"
>;

type ArticleListScreenRouteProp = RouteProp<RootStackParamList, "ArticleList">;

type Props = {
  navigation: ArticleListScreenNavigationProp;
  route: ArticleListScreenRouteProp;
};

export default function ArticleListScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ArticlesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getArticles();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Load Articles"
          onPress={handleLoadArticles}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {articles && (
        <ScrollView style={styles.responseContainer}>
          <Text style={styles.responseTitle}>API Response:</Text>
          <Text style={styles.responseText}>
            {JSON.stringify(articles, null, 2)}
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "#fee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
  },
  responseContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  responseText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
});

