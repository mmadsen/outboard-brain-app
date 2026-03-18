import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { searchThoughts } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';

// AIDEV-NOTE: Search screen — sends query to searchThoughts and displays the
// server's text response directly. Will be refactored to structured UI per oba-ra4.

const DEFAULT_LIMIT = 10;
const DEFAULT_THRESHOLD = 0.2;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(String(DEFAULT_LIMIT));
  const [threshold, setThreshold] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedLimit = parseInt(limit, 10);
      const parsedThreshold = parseFloat(threshold);

      const text = await searchThoughts({
        query: trimmed,
        limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT,
        threshold:
          Number.isFinite(parsedThreshold) && parsedThreshold >= 0 && parsedThreshold <= 1
            ? parsedThreshold
            : DEFAULT_THRESHOLD,
      });

      setResult(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    } catch (err) {
      if (err instanceof McpError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while searching.');
      }
    } finally {
      setLoading(false);
    }
  }, [query, limit, threshold]);

  const isSearchDisabled = query.trim().length === 0 || loading;

  return (
    <View style={styles.container}>
      {/* Search input row */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your thoughts…"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Pressable
          style={[styles.searchButton, isSearchDisabled && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={isSearchDisabled}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.buttonText}>Search</Text>
          )}
        </Pressable>
      </View>

      {/* Optional controls */}
      <View style={styles.controlsRow}>
        <View style={styles.controlGroup}>
          <Text style={typography.label}>Limit</Text>
          <TextInput
            style={styles.controlInput}
            value={limit}
            onChangeText={setLimit}
            keyboardType="number-pad"
            placeholder={String(DEFAULT_LIMIT)}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.controlGroup}>
          <Text style={typography.label}>Threshold (0–1)</Text>
          <TextInput
            style={styles.controlInput}
            value={threshold}
            onChangeText={setThreshold}
            keyboardType="decimal-pad"
            placeholder={String(DEFAULT_THRESHOLD)}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {result !== null && !loading && (
        <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
          <Text style={styles.resultText} selectable>
            {result}
          </Text>
        </ScrollView>
      )}

      {/* Empty state before first search */}
      {result === null && !loading && !error && (
        <View style={styles.messageContainer}>
          <Text style={styles.emptyText}>Enter a query to search your thoughts</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  controlInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    color: colors.text,
    width: 80,
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  resultScroll: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultContent: {
    padding: spacing.lg,
  },
  resultText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
