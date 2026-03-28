import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "react-native";
import { subscribe, getProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import * as storage from "../services/storage";

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const { signIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubscribe = async () => {
    console.log("Subscribe button pressed");
    // Loosen validation for easier testing
    if (cardNumber.length < 1) {
      Alert.alert(
        "Invalid Input",
        "Please enter card details to proceed.",
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Calling subscribe API...");
      const updatedUser = await subscribe();
      console.log("Subscribe API success:", updatedUser.username);

      const token = await storage.getItem("userToken");
      console.log("Current token found:", !!token);
      
      if (token) {
        await signIn(token, updatedUser);
        console.log("Auth context updated");
      }

      console.log("Navigating back to profile...");
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error("Subscription Error:", error.response?.data || error.message);
      Alert.alert(
        "Subscription Failed",
        error.response?.data?.error || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Subscribe to Premium",
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          ),
        }}
      />

      <View style={styles.content}>
        <View style={styles.premiumCard}>
          <Ionicons
            name="star"
            size={40}
            color={theme.tint}
            style={{ marginBottom: 10 }}
          />
          <Text style={[styles.title, { color: theme.text }]}>
            MythicScroll Premium
          </Text>
          <Text style={[styles.price, { color: theme.text }]}>
            $4.99 <Text style={styles.period}>/ month</Text>
          </Text>
          <Text style={[styles.benefit, { color: theme.text }]}>
            ✓ Unlimited Daily Chapters
          </Text>
          <Text style={[styles.benefit, { color: theme.text }]}>
            ✓ Support Creators
          </Text>
          <Text style={[styles.benefit, { color: theme.text }]}>✓ No Ads</Text>
        </View>

        <View
          style={[styles.formContainer, { backgroundColor: theme.surface }]}
        >
          <Text style={[styles.formTitle, { color: theme.text }]}>
            Payment Details
          </Text>

          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Card Number"
            placeholderTextColor={theme.icon}
            keyboardType="number-pad"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
          />

          <View style={styles.row}>
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="MM/YY"
              placeholderTextColor={theme.icon}
              maxLength={5}
              value={expiry}
              onChangeText={setExpiry}
            />
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="CVV"
              placeholderTextColor={theme.icon}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={cvv}
              onChangeText={setCvv}
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.payButton,
            { backgroundColor: theme.tint, opacity: loading ? 0.7 : 1 },
          ]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.payButtonText}>Subscribe Now</Text>
          )}
        </Pressable>
        <Text style={[styles.disclaimer, { color: theme.icon }]}>
          This is a simulated payment. No real charges will be made.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  premiumCard: {
    alignItems: "center",
    padding: 30,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    marginBottom: 30,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  price: { fontSize: 32, fontWeight: "900", marginBottom: 20 },
  period: { fontSize: 16, fontWeight: "normal", opacity: 0.6 },
  benefit: { fontSize: 16, marginBottom: 8, opacity: 0.8 },
  formContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  payButton: {
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#D4AF37",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  payButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
  },
});
