import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function canHaptic() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Tab chips, filter toggles, segmented controls. */
export function hapticSelection() {
  if (!canHaptic()) return;
  void Haptics.selectionAsync().catch(() => {});
}

/** Buttons, icons, and focus affordances. */
export function hapticLight() {
  if (!canHaptic()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Primary confirmations and stronger taps. */
export function hapticMedium() {
  if (!canHaptic()) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}
