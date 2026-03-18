import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { getThoughtStats } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';

// AIDEV-NOTE: Stats screen — displays server text response from thought_stats.
// Will be refactored to structured dashboard per oba-ra4.

export default function StatsScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const text = await getThoughtStats();
      setResult(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    } catch (err) {
      if (err instanceof McpError) {
        setError(err.message);
      } else {
        setError('Failed to load stats');
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchStats().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.caption, styles.loadingText]}>Loading stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centered}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={[typography.subtitle, styles.errorText]}>{error}</Text>
        <Text style={typography.caption}>Pull to retry</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>Stats</Text>

      <View style={styles.card}>
        <Text style={styles.resultText} selectable>
          {result}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 26,
  },
});
