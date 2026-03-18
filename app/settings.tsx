import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { getApiKey, setApiKey, deleteApiKey, getBaseUrl, setBaseUrl } from '@/lib/api-key-store';

// AIDEV-NOTE: Settings screen for API key entry and base URL configuration.
// Also serves as the first-launch setup flow when no API key is stored.
export default function SettingsScreen() {
  const [key, setKey] = useState('');
  const [url, setUrl] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const existingKey = await getApiKey();
      if (existingKey) {
        // Show masked key
        setKey(existingKey.slice(0, 4) + '...' + existingKey.slice(-4));
        setHasExistingKey(true);
      }
      const existingUrl = await getBaseUrl();
      setUrl(existingUrl);
    })();
  }, []);

  const handleSave = async () => {
    // If user hasn't changed the masked key, don't overwrite
    const isKeyChanged = !hasExistingKey || !key.includes('...');
    if (isKeyChanged && !key.trim()) {
      Alert.alert('API Key Required', 'Please enter your API key to continue.');
      return;
    }

    setSaving(true);
    try {
      if (isKeyChanged) {
        await setApiKey(key.trim());
      }
      await setBaseUrl(url);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearKey = async () => {
    Alert.alert('Clear API Key', 'Are you sure you want to remove your API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await deleteApiKey();
          setKey('');
          setHasExistingKey(false);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={typography.title}>Settings</Text>
        <Text style={[typography.caption, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
          Configure your connection to the Outboard Brain server.
        </Text>

        <Text style={typography.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={(text) => {
            setKey(text);
            if (hasExistingKey && !text.includes('...')) {
              setHasExistingKey(false);
            }
          }}
          placeholder="Enter your x-brain-key"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!hasExistingKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {hasExistingKey && (
          <Pressable onPress={handleClearKey} style={styles.clearButton}>
            <Text style={[typography.caption, { color: colors.error }]}>Clear API Key</Text>
          </Pressable>
        )}

        <Text style={[typography.label, { marginTop: spacing.lg }]}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          Leave default unless connecting to a custom server.
        </Text>

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save & Continue'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  clearButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
