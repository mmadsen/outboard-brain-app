import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { listThoughts, ThoughtType } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';

// AIDEV-NOTE: Browse screen — displays server text response from listThoughts.
// Filters are wired to MCP params. Will be refactored to structured UI per oba-ra4.

const THOUGHT_TYPES: Array<{ label: string; value: ThoughtType | '' }> = [
  { label: 'All', value: '' },
  { label: 'Observation', value: 'observation' },
  { label: 'Task', value: 'task' },
  { label: 'Idea', value: 'idea' },
  { label: 'Reference', value: 'reference' },
  { label: 'Person Note', value: 'person_note' },
  { label: 'Daily', value: 'daily' },
  { label: 'Log', value: 'log' },
];

const RECENCY_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: 'Any time', value: undefined },
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function BrowseScreen() {
  const [typeFilter, setTypeFilter] = useState<ThoughtType | ''>('');
  const [topicFilter, setTopicFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState<number | undefined>(undefined);

  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThoughts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {};
      if (typeFilter) params.type = typeFilter;
      if (topicFilter.trim()) params.topic = topicFilter.trim();
      if (personFilter.trim()) params.person = personFilter.trim();
      if (daysFilter !== undefined) params.days = daysFilter;

      const text = await listThoughts(params as any);
      setResult(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    } catch (err) {
      if (err instanceof McpError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [typeFilter, topicFilter, personFilter, daysFilter]);

  useEffect(() => {
    loadThoughts();
  }, [loadThoughts]);

  return (
    <View style={styles.root}>
      {/* Filter panel */}
      <View style={styles.filterPanel}>
        <Text style={[typography.title, { marginBottom: spacing.md }]}>Browse</Text>

        <Text style={typography.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {THOUGHT_TYPES.map((t) => {
              const active = t.value === typeFilter;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => setTypeFilter(t.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Text style={[typography.label, { marginTop: spacing.sm }]}>Recency</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {RECENCY_OPTIONS.map((opt) => {
              const active = opt.value === daysFilter;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setDaysFilter(opt.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.textFilters}>
          <View style={styles.textFilterCol}>
            <Text style={typography.label}>Topic</Text>
            <TextInput
              style={styles.textInput}
              value={topicFilter}
              onChangeText={setTopicFilter}
              placeholder="Filter by topic…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.textFilterCol}>
            <Text style={typography.label}>Person</Text>
            <TextInput
              style={styles.textInput}
              value={personFilter}
              onChangeText={setPersonFilter}
              placeholder="Filter by person…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      {/* Results panel */}
      <View style={styles.resultPanel}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.caption, { marginTop: spacing.sm }]}>Loading…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadThoughts} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            style={styles.resultScroll}
            contentContainerStyle={styles.resultContent}
          >
            <Text style={styles.resultText} selectable>
              {result}
            </Text>
          </ScrollView>
        )}
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
  filterPanel: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    padding: spacing.lg,
  },
  chipScroll: {
    flexGrow: 0,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  textFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  textFilterCol: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  resultPanel: {
    flex: 1,
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.md,
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
  },
});
