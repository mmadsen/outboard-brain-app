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
import { getThoughtStats, ThoughtStats } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';

// AIDEV-NOTE: Stats screen — renders structured ThoughtStats from V2 JSON (oba-71d).

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function StatsScreen() {
  const [stats, setStats] = useState<ThoughtStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getThoughtStats();
      setStats(data);
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

  const typeEntries = stats?.types
    ? Object.entries(stats.types).sort(([, a], [, b]) => b - a)
    : [];

  const topicEntries = stats?.top_topics
    ? Object.entries(stats.top_topics).sort(([, a], [, b]) => b - a)
    : [];

  const peopleEntries = stats?.people
    ? Object.entries(stats.people).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={[typography.title, { marginBottom: spacing.lg }]}>Stats</Text>

      {/* Total + date range — full width */}
      {stats && (
        <View style={styles.totalCard}>
          <Text style={styles.totalValue}>{stats.total}</Text>
          <Text style={styles.totalLabel}>Total Thoughts</Text>
          {stats.date_range && (
            <Text style={styles.dateRange}>
              {formatDate(stats.date_range.earliest)} — {formatDate(stats.date_range.latest)}
            </Text>
          )}
        </View>
      )}

      {/* Cards in a row */}
      <View style={styles.cardRow}>
        {/* Types */}
        {typeEntries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Types</Text>
            {typeEntries.map(([type, count]) => (
              <View key={type} style={styles.statRow}>
                <Text style={styles.statLabel}>{type.replace(/_/g, ' ')}</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${Math.max(4, (count / (stats?.total || 1)) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Topics */}
        {topicEntries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Topics</Text>
            {topicEntries.map(([topic, count]) => (
              <View key={topic} style={styles.statRow}>
                <Text style={styles.statLabel}>{topic}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* People */}
        {peopleEntries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>People Mentioned</Text>
            {peopleEntries.map(([person, count]) => (
              <View key={person} style={styles.statRow}>
                <Text style={styles.statLabel}>{person}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}
          </View>
        )}
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
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dateRange: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    flex: 1,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
  },
  bar: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
