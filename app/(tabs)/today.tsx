import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { listThoughts, Thought } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';
import ThoughtCard from '@/components/ThoughtCard';

// AIDEV-NOTE: Today screen — shows daily-summary thoughts, most recent first (oba-71d).
// Left sidebar lists dates; tapping a date scrolls to that summary.

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TodayScreen() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const listRef = useRef<FlatList<Thought>>(null);

  const loadDailies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listThoughts({ type: 'daily' as any, limit: 50 });
      const items = Array.isArray(data) ? data : [];
      items.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      setThoughts(items);
    } catch (err) {
      if (err instanceof McpError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDailies();
  }, [loadDailies]);

  // Build date list from thoughts (unique dates, most recent first)
  const dates = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ dateKey: string; label: string; index: number }> = [];
    thoughts.forEach((t, i) => {
      const dateKey = new Date(t.created).toISOString().slice(0, 10);
      if (!seen.has(dateKey)) {
        seen.add(dateKey);
        result.push({ dateKey, label: formatDateShort(t.created), index: i });
      }
    });
    return result;
  }, [thoughts]);

  const scrollToDate = useCallback((index: number, dateKey: string) => {
    setSelectedDate(dateKey);
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Thought }) => <ThoughtCard thought={item} />,
    [],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.caption, { marginTop: spacing.sm }]}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadDailies} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (thoughts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No daily summaries yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Date sidebar */}
      <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent}>
        <Text style={[typography.label, { marginBottom: spacing.sm }]}>Dates</Text>
        {dates.map((d) => {
          const active = selectedDate === d.dateKey;
          return (
            <Pressable
              key={d.dateKey}
              style={[styles.dateItem, active && styles.dateItemActive]}
              onPress={() => scrollToDate(d.index, d.dateKey)}
            >
              <Text style={[styles.dateText, active && styles.dateTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Daily summaries */}
      <View style={styles.content}>
        <FlatList
          ref={listRef}
          data={thoughts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onScrollToIndexFailed={(info) => {
            // Fallback: scroll to approximate offset then retry
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 120,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarContent: {
    padding: spacing.md,
  },
  dateItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: 2,
  },
  dateItemActive: {
    backgroundColor: colors.primary,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  dateTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  retryBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});
