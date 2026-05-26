import { Alert, Platform } from 'react-native';

export function showPrototypeAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function showGrantApply() {
  showPrototypeAlert(
    'Application submitted',
    'Your Green Innovation Grant application has been received. The KCIC team will contact you within 5 business days.'
  );
}

export function showEditProfile() {
  showPrototypeAlert(
    'Edit profile',
    'Profile editing will be available in the full release. For this prototype, your details are saved locally.'
  );
}

export function showAddTopic(onAdd: (topic: string) => void) {
  if (Platform.OS === 'web') {
    const topic = window.prompt('Add a topic of interest:');
    if (topic?.trim()) onAdd(topic.trim());
    return;
  }
  if (Platform.OS === 'ios') {
    Alert.prompt('Add topic', 'Enter a new area of interest', (text) => {
      if (text?.trim()) onAdd(text.trim());
    });
    return;
  }
  Alert.alert('Add topic', 'Choose a topic to add', [
    { text: 'Water Innovation', onPress: () => onAdd('Water Innovation') },
    { text: 'Carbon Markets', onPress: () => onAdd('Carbon Markets') },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export function showRsvpSuccess(eventTitle: string, interested: boolean) {
  showPrototypeAlert(
    interested ? "You're registered" : 'RSVP removed',
    interested
      ? `You're interested in "${eventTitle}". We'll send a reminder before it starts.`
      : `You've removed your interest in "${eventTitle}".`
  );
}

export function showOpenResource(title: string, detail: string) {
  showPrototypeAlert('Opening resource', `${title}\n\n${detail}`);
}
