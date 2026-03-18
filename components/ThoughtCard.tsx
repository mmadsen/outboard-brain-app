import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, borderRadius } from '@/constants/Theme';
import type { Thought } from '@/lib/mcp-tools';

interface Props {
  thought: Thought;
  showSimilarity?: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTypeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Strip YAML frontmatter (--- ... ---) from content for display
function stripFrontmatter(text: string): string {
  const match = text.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? text.slice(match[0].length).trim() : text.trim();
}

// Strip [[wiki-links]] to plain text
function stripWikiLinks(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, '$1');
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  heading3: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  strong: {
    fontWeight: '700',
    color: colors.text,
  },
  em: {
    fontStyle: 'italic',
    color: colors.text,
  },
  bullet_list: {
    marginTop: 2,
    marginBottom: 2,
  },
  ordered_list: {
    marginTop: 2,
    marginBottom: 2,
  },
  list_item: {
    flexDirection: 'row',
    marginVertical: 1,
  },
  paragraph: {
    marginTop: 2,
    marginBottom: 4,
  },
  link: {
    color: colors.primary,
  },
  blockquote: {
    backgroundColor: colors.surfaceLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
    paddingVertical: 4,
    marginVertical: 4,
  },
  code_inline: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  fence: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    fontSize: 13,
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 8,
  },
});

export default function ThoughtCard({ thought, showSimilarity }: Props) {
  const similarityPct =
    showSimilarity && thought.similarity != null
      ? `${Math.round(thought.similarity * 100)}%`
      : null;

  const displayContent = stripWikiLinks(stripFrontmatter(thought.content_raw));

  return (
    <View style={styles.card}>
      {/* Header row: type chip + date + optional similarity */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {thought.type && (
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{formatTypeLabel(thought.type)}</Text>
            </View>
          )}
          <Text style={styles.date}>{formatDate(thought.created)}</Text>
        </View>
        {similarityPct && (
          <View style={styles.similarityBadge}>
            <Text style={styles.similarityText}>{similarityPct}</Text>
          </View>
        )}
      </View>

      {/* Content rendered as Markdown */}
      <Markdown style={markdownStyles}>{displayContent}</Markdown>

      {/* Tags */}
      {thought.tags && thought.tags.length > 0 && (
        <View style={styles.tagRow}>
          {thought.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* People */}
      {thought.people && thought.people.length > 0 && (
        <View style={styles.tagRow}>
          {thought.people.map((person) => (
            <View key={person} style={styles.personChip}>
              <Text style={styles.personChipText}>{person}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeChip: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeChipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
  },
  similarityBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  similarityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  personChip: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  personChipText: {
    color: colors.primary,
    fontSize: 12,
  },
});
