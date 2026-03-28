import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="person-circle-outline" size={80} color={theme.icon} />
        <Text style={[styles.message, { color: theme.text }]}>Sign in to view your profile</Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={() => router.push('/auth')}>
          <Text style={styles.buttonText}>Sign In / Register</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
        <Ionicons name="person-circle" size={80} color={user.isSubscribed ? '#D4AF37' : theme.tint} />
        <Text style={[styles.username, { color: theme.text }]}>{user.username}</Text>
        <Text style={[styles.email, { color: theme.icon }]}>{user.email}</Text>
        
        <View style={[styles.badge, { backgroundColor: user.isSubscribed ? 'rgba(212, 175, 55, 0.2)' : 'rgba(150, 150, 150, 0.2)' }]}>
          <Ionicons name={user.isSubscribed ? "star" : "bookmark-outline"} size={14} color={user.isSubscribed ? "#D4AF37" : theme.text} />
          <Text style={[styles.badgeText, { color: user.isSubscribed ? "#D4AF37" : theme.text }]}>
            {user.isSubscribed ? "Premium Member" : "Free Tier"}
          </Text>
        </View>
      </View>
      
      {!user.isSubscribed && (
        <Pressable 
          style={styles.premiumBanner}
          onPress={() => router.push('/checkout')}
        >
          <View style={styles.bannerContent}>
            <Ionicons name="star" size={24} color="#D4AF37" />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.bannerTitle}>Go Premium</Text>
              <Text style={styles.bannerP}>Unlock unlimited daily chapters!</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
          </View>
        </Pressable>
      )}

      <View style={styles.menu}>
        {user.role?.title === 'Admin' && (
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { borderBottomColor: theme.border },
              pressed && { backgroundColor: theme.surface }
            ]}
            onPress={() => router.push('/(admin)/admin-manga' as any)}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.tint} />
            <Text style={[styles.menuText, { color: theme.tint }]}>Admin Dashboard</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            { borderBottomColor: theme.border },
            pressed && { backgroundColor: theme.surface }
          ]}
          onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={[styles.menuText, { color: '#e74c3c' }]}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    marginTop: 4,
  },
  message: {
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menu: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    gap: 6
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600'
  },
  premiumBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    overflow: 'hidden'
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bannerTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  bannerP: {
    color: '#D4AF37',
    opacity: 0.8,
    fontSize: 14
  }
});
