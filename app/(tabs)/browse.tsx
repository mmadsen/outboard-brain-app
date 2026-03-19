import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { listThoughts, Thought, ThoughtType } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';
import ThoughtCard from '@/components/ThoughtCard';

// AIDEV-NOTE: Browse screen — displays structured thought cards from listThoughts (oba-71d).

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

// AIDEV-NOTE: V2 tags can be clean strings or malformed stringified JSON fragments.
// e.g. ["[\"coop\"","\"SJI-Food-Coop\""] or ["Daily Tasks","Project Management"]
function normalizeTags(tags: string[]): string[] {
  const joined = tags.join(',');
  // Strip leading/trailing brackets and quotes, then split
  const cleaned = joined
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.replace(/^["'\s]+|["'\s]+$/g, '').trim())
    .filter((t) => t.length > 0);
  return cleaned;
}

function extractAllTags(thoughts: Thought[]): string[] {
  const tagSet = new Set<string>();
  for (const t of thoughts) {
    if (t.tags) {
      for (const tag of normalizeTags(t.tags)) {
        tagSet.add(tag);
      }
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

interface ProjectInfo {
  name: string;
  tag: string; // primary tag used for filtering
}

function extractProjectName(thought: Thought): string {
  const match = thought.content_raw.match(/^##\s+(.+)$/m);
  return match ? match[1].trim() : `Project ${thought.id.slice(0, 8)}`;
}

function extractProjects(thoughts: Thought[]): ProjectInfo[] {
  return thoughts
    .map((t) => ({
      name: extractProjectName(t),
      tag: normalizeTags(t.tags || [])[0] || '',
    }))
    .filter((p) => p.tag)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export default function BrowseScreen() {
  const [typeFilter, setTypeFilter] = useState<ThoughtType | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState<number | undefined>(undefined);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load to collect all available tags and projects
  useEffect(() => {
    let mounted = true;
    listThoughts({ limit: 100 })
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setAllTags(extractAllTags(data));
        }
      })
      .catch(() => {});
    listThoughts({ type: 'project' as ThoughtType, limit: 50 })
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setAllProjects(extractProjects(data));
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const loadThoughts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {};
      if (typeFilter) params.type = typeFilter;
      // Project > Tag > Topic — all map to server's topic param
      if (projectFilter) params.topic = projectFilter;
      else if (tagFilter) params.topic = tagFilter;
      else if (topicFilter.trim()) params.topic = topicFilter.trim();
      if (personFilter.trim()) {
        params.person = personFilter.trim();
        params.person_match = 'fuzzy';
      }
      if (daysFilter !== undefined) params.days = daysFilter;

      const data = await listThoughts(params as any);
      setThoughts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof McpError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [typeFilter, projectFilter, tagFilter, topicFilter, personFilter, daysFilter]);

  useEffect(() => {
    loadThoughts();
  }, [loadThoughts]);

  const renderItem = useCallback(
    ({ item }: { item: Thought }) => <ThoughtCard thought={item} />,
    [],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadThoughts();
    setRefreshing(false);
  }, [loadThoughts]);

  const projectPickerLabel = allProjects.find((p) => p.tag === projectFilter)?.name || 'All projects';
  const tagPickerLabel = tagFilter || 'All tags';

  const hasActiveFilters = typeFilter !== '' || projectFilter !== '' || tagFilter !== '' || topicFilter !== '' || personFilter !== '' || daysFilter !== undefined;

  const clearAllFilters = useCallback(() => {
    setTypeFilter('');
    setProjectFilter('');
    setTagFilter('');
    setTopicFilter('');
    setPersonFilter('');
    setDaysFilter(undefined);
  }, []);

  return (
    <View style={styles.root}>
      {/* Filter panel */}
      <View style={styles.filterPanel}>
        <Text style={[typography.title, { marginBottom: spacing.md }]}>Browse</Text>

        <Text style={typography.label}>Type</Text>
        <View style={styles.chipWrap}>
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

        <Text style={[typography.label, { marginTop: spacing.sm }]}>Recency</Text>
        <View style={styles.chipWrap}>
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

        <Text style={[typography.label, { marginTop: spacing.sm }]}>Project</Text>
        <Pressable style={styles.pickerButton} onPress={() => setShowProjectPicker(true)}>
          <Text style={[styles.pickerButtonText, !projectFilter && styles.pickerButtonPlaceholder]}>
            {projectPickerLabel}
          </Text>
          <Text style={styles.pickerChevron}>▼</Text>
        </Pressable>

        <Text style={[typography.label, { marginTop: spacing.sm }]}>Tag</Text>
        <Pressable
          style={[styles.pickerButton, !!projectFilter && styles.pickerDisabled]}
          onPress={() => !projectFilter && setShowTagPicker(true)}
        >
          <Text style={[styles.pickerButtonText, (!tagFilter || projectFilter) && styles.pickerButtonPlaceholder]}>
            {tagPickerLabel}
          </Text>
          <Text style={styles.pickerChevron}>▼</Text>
        </Pressable>

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
              editable={!tagFilter && !projectFilter}
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

        {hasActiveFilters && (
          <Pressable style={styles.clearBtn} onPress={clearAllFilters}>
            <Text style={styles.clearBtnText}>Clear All Filters</Text>
          </Pressable>
        )}
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
        ) : thoughts.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No thoughts match the current filters</Text>
          </View>
        ) : (
          <FlatList
            data={thoughts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        )}
      </View>

      {/* Project picker modal */}
      <Modal
        visible={showProjectPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowProjectPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={[typography.subtitle, { marginBottom: spacing.md }]}>Select Project</Text>
            <ScrollView style={styles.modalScroll}>
              <Pressable
                style={[styles.modalOption, !projectFilter && styles.modalOptionActive]}
                onPress={() => { setProjectFilter(''); setShowProjectPicker(false); }}
              >
                <Text style={[styles.modalOptionText, !projectFilter && styles.modalOptionTextActive]}>
                  All projects
                </Text>
              </Pressable>
              {allProjects.map((proj) => {
                const active = projectFilter === proj.tag;
                return (
                  <Pressable
                    key={proj.tag}
                    style={[styles.modalOption, active && styles.modalOptionActive]}
                    onPress={() => {
                      setProjectFilter(proj.tag);
                      setTagFilter('');
                      setTopicFilter('');
                      setShowProjectPicker(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                      {proj.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Tag picker modal */}
      <Modal
        visible={showTagPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTagPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={[typography.subtitle, { marginBottom: spacing.md }]}>Select Tag</Text>
            <ScrollView style={styles.modalScroll}>
              <Pressable
                style={[styles.modalOption, !tagFilter && styles.modalOptionActive]}
                onPress={() => { setTagFilter(''); setShowTagPicker(false); }}
              >
                <Text style={[styles.modalOptionText, !tagFilter && styles.modalOptionTextActive]}>
                  All tags
                </Text>
              </Pressable>
              {allTags.map((tag) => {
                const active = tagFilter === tag;
                return (
                  <Pressable
                    key={tag}
                    style={[styles.modalOption, active && styles.modalOptionActive]}
                    onPress={() => { setTagFilter(tag); setShowTagPicker(false); }}
                  >
                    <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  pickerDisabled: {
    opacity: 0.4,
  },
  pickerButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  pickerButtonPlaceholder: {
    color: colors.textMuted,
  },
  pickerChevron: {
    color: colors.textSecondary,
    fontSize: 10,
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
  clearBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: 340,
    maxHeight: 480,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  modalOptionActive: {
    backgroundColor: colors.surfaceLight,
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 15,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
