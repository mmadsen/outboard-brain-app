import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/Theme';
import { captureThought, ThoughtType } from '@/lib/mcp-tools';
import { McpError } from '@/lib/mcp-client';

// AIDEV-NOTE: Capture screen — main thought entry point for the app.
// Server returns text responses; success/error displayed as text banners.

const THOUGHT_TYPES: Array<{ label: string; value: ThoughtType }> = [
  { label: 'Observation', value: 'observation' },
  { label: 'Task', value: 'task' },
  { label: 'Idea', value: 'idea' },
  { label: 'Reference', value: 'reference' },
  { label: 'Person Note', value: 'person_note' },
  { label: 'Daily', value: 'daily' },
  { label: 'Log', value: 'log' },
];

export default function CaptureScreen() {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<ThoughtType | null>(null);
  const [topics, setTopics] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const canSave = content.trim().length > 0 && !isSaving;

  const clearForm = useCallback(() => {
    setContent('');
    setSelectedType(null);
    setTopics('');
  }, []);

  const parseTopics = useCallback((raw: string): string[] => {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const parsedTopics = parseTopics(topics);

      const result = await captureThought({
        content: content.trim(),
        type: selectedType ?? undefined,
        topics: parsedTopics.length > 0 ? parsedTopics : undefined,
      });

      clearForm();
      const msg = typeof result === 'string' ? result : 'Thought captured!';
      setStatusMessage({ text: msg, isError: false });

      setTimeout(() => {
        setStatusMessage((prev) => (prev && !prev.isError ? null : prev));
      }, 5000);
    } catch (err) {
      const message =
        err instanceof McpError
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setStatusMessage({ text: message, isError: true });
    } finally {
      setIsSaving(false);
    }
  }, [canSave, content, selectedType, topics, parseTopics, clearForm]);

  const selectedTypeLabel =
    THOUGHT_TYPES.find((t) => t.value === selectedType)?.label ?? 'Auto-detect';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={typography.title}>Capture</Text>

        {statusMessage && (
          <View
            style={[
              styles.statusBanner,
              statusMessage.isError ? styles.statusError : styles.statusSuccess,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusMessage.isError ? colors.error : colors.success },
              ]}
              selectable
            >
              {statusMessage.text}
            </Text>
            <Pressable onPress={() => setStatusMessage(null)}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={typography.label}>Thought</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            autoFocus
          />
        </View>

        <View style={styles.optionsRow}>
          <View style={styles.optionField}>
            <Text style={typography.label}>Type</Text>
            <Pressable
              style={styles.pickerButton}
              onPress={() => setShowTypePicker(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  !selectedType && styles.pickerButtonPlaceholder,
                ]}
              >
                {selectedTypeLabel}
              </Text>
              <Text style={styles.pickerChevron}>▼</Text>
            </Pressable>
          </View>

          <View style={styles.optionFieldWide}>
            <Text style={typography.label}>Topics</Text>
            <TextInput
              style={styles.topicsInput}
              placeholder="e.g. project-x, design, meeting"
              placeholderTextColor={colors.textMuted}
              value={topics}
              onChangeText={setTopics}
            />
          </View>
        </View>

        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Thought</Text>
          )}
        </Pressable>

        <Modal
          visible={showTypePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTypePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowTypePicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={[typography.subtitle, styles.modalTitle]}>
                Select Type
              </Text>
              <Pressable
                style={[
                  styles.modalOption,
                  selectedType === null && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedType(null);
                  setShowTypePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedType === null && styles.modalOptionTextActive,
                  ]}
                >
                  Auto-detect
                </Text>
              </Pressable>
              <FlatList
                data={THOUGHT_TYPES}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.modalOption,
                      selectedType === item.value && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedType(item.value);
                      setShowTypePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedType === item.value &&
                          styles.modalOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  fieldGroup: {
    marginTop: spacing.lg,
  },
  contentInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  optionField: {
    flex: 1,
  },
  optionFieldWide: {
    flex: 2,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    height: 50,
  },
  pickerButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  pickerButtonPlaceholder: {
    color: colors.textMuted,
  },
  pickerChevron: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  topicsInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    height: 50,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    height: 56,
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  statusSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusError: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: spacing.md,
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
  modalTitle: {
    marginBottom: spacing.md,
  },
  modalOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  modalOptionActive: {
    backgroundColor: colors.surfaceLight,
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 16,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
