import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ArticleListScreen from "./screens/ArticleListScreen";
import ArticleDetailScreen from "./screens/ArticleDetailScreen";

export type RootStackParamList = {
  ArticleList: undefined;
  ArticleDetail: { articleId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ArticleList">
        <Stack.Screen
          name="ArticleList"
          component={ArticleListScreen}
          options={{ title: "Articles" }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={{ title: "Article Detail" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

