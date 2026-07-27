import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileThemes } from '@/components/kcic/profile/profile-theme';
import { palette } from '@/components/kcic/ui';
import type { AuthUser } from '@/lib/auth-helpers';
import { fonts } from '@/lib/typography';

export type ProfileFormValues = {
  name: string;
  organization: string;
  location: string;
  interests: string[];
};

type EditProfileSheetProps = {
  visible: boolean;
  user: AuthUser;
  saving?: boolean;
  onClose: () => void;
  onSave: (values: ProfileFormValues) => void;
};

const SUGGESTED_INTERESTS = [
  'Climate Finance',
  'AgriTech',
  'Circular Economy',
  'Clean Energy',
  'Water Innovation',
];

export function EditProfileSheet({
  visible,
  user,
  saving = false,
  onClose,
  onSave,
}: EditProfileSheetProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? profileThemes.dark : profileThemes.light;
  const [name, setName] = useState(user.name);
  const [organization, setOrganization] = useState(user.organization ?? '');
  const [location, setLocation] = useState(user.location ?? '');
  const [interests, setInterests] = useState<string[]>(user.interests ?? []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(user.name);
    setOrganization(user.organization ?? '');
    setLocation(user.location ?? '');
    setInterests(user.interests ?? []);
    setError(null);
  }, [user, visible]);

  const handleAddInterest = () => {
    const addInterest = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      if (interests.includes(trimmed)) return;
      if (interests.length >= 12) {
        setError('You can add up to 12 interests.');
        return;
      }
      setInterests((current) => [...current, trimmed]);
      setError(null);
    };

    if (Platform.OS === 'ios') {
      Alert.prompt('Add interest', 'Enter a topic you care about', (text) => {
        if (text?.trim()) addInterest(text);
      });
      return;
    }

    if (Platform.OS === 'web') {
      const text = window.prompt('Add interest');
      if (text?.trim()) addInterest(text);
      return;
    }

    Alert.alert('Add interest', 'Choose a topic or type your own', [
      ...SUGGESTED_INTERESTS.filter((item) => !interests.includes(item)).map((item) => ({
        text: item,
        onPress: () => addInterest(item),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    onSave({
      name: trimmedName,
      organization: organization.trim(),
      location: location.trim(),
      interests,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
              <Text style={[styles.headerAction, { color: colors.muted }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.ink }]}>Edit Profile</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              disabled={saving}
              onPress={handleSave}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.accentGreen} />
              ) : (
                <Text style={[styles.headerAction, { color: colors.accentGreen }]}>Save</Text>
              )}
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.muted }]}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                { color: colors.ink, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />

            <Text style={[styles.label, { color: colors.muted }]}>Organization</Text>
            <TextInput
              value={organization}
              onChangeText={setOrganization}
              placeholder="Company or institution"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                { color: colors.ink, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />

            <Text style={[styles.label, { color: colors.muted }]}>Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="City, country"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                { color: colors.ink, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            />

            <View style={styles.interestsHeader}>
              <Text style={[styles.label, { color: colors.muted, marginBottom: 0 }]}>Interests</Text>
              <Pressable accessibilityRole="button" onPress={handleAddInterest}>
                <Text style={[styles.addInterest, { color: colors.accentGreen }]}>+ Add</Text>
              </Pressable>
            </View>

            <View style={styles.interestsWrap}>
              {interests.length === 0 ? (
                <Text style={[styles.emptyInterests, { color: colors.muted }]}>
                  Add topics to personalize your KCIC experience.
                </Text>
              ) : (
                interests.map((interest) => (
                  <Pressable
                    key={interest}
                    accessibilityRole="button"
                    onPress={() => setInterests((current) => current.filter((item) => item !== interest))}
                    style={[styles.interestPill, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={[styles.interestText, { color: colors.ink }]}>{interest}</Text>
                    <MaterialIcons name="close" size={14} color={colors.muted} />
                  </Pressable>
                ))
              )}
            </View>

            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            <Text style={[styles.note, { color: colors.muted }]}>
              Profile photo uses your Google or Apple account image when available.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  headerAction: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    minWidth: 52,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 8,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  interestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  addInterest: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  interestText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  emptyInterests: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 8,
  },
  note: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },
});
