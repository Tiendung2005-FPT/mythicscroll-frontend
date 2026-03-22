import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../services/api';

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { signIn } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await login(email, password);
      } else {
        response = await register(username, email, password);
      }
      
      await signIn(response.token, response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Authentication failed';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Text>

      <View style={styles.form}>
        {!isLogin && (
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Username"
            placeholderTextColor={theme.icon}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Email"
          placeholderTextColor={theme.icon}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Password"
          placeholderTextColor={theme.icon}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tint },
            (pressed || loading) && { opacity: 0.8 },
          ]}
          onPress={handleAuth}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.switchButton} disabled={loading}>
          <Text style={[styles.switchText, { color: theme.tint }]}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    padding: 16,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
