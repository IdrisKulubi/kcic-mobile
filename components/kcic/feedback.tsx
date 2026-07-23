import { Alert, Platform } from 'react-native';

import { toast } from '@/lib/toast';

export function showPrototypeAlert(title: string, message: string) {
  toast.info(title, message);
}

export function showGrantApply() {
  toast.success(
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
  const addTopic = (topic: string) => {
    onAdd(topic);
    toast.success('Interest added', `${topic} was added to your interests.`);
  };

  if (Platform.OS === 'web') {
    const topic = window.prompt('Add a topic of interest:');
    if (topic?.trim()) addTopic(topic.trim());
    return;
  }
  if (Platform.OS === 'ios') {
    Alert.prompt('Add topic', 'Enter a new area of interest', (text) => {
      if (text?.trim()) addTopic(text.trim());
    });
    return;
  }
  Alert.alert('Add topic', 'Choose a topic to add', [
    { text: 'Water Innovation', onPress: () => addTopic('Water Innovation') },
    { text: 'Carbon Markets', onPress: () => addTopic('Carbon Markets') },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

export function showRsvpSuccess(eventTitle: string, interested: boolean) {
  (interested ? toast.success : toast.info)(
    interested ? "You're registered" : 'RSVP removed',
    interested
      ? `You're interested in "${eventTitle}". We'll send a reminder before it starts.`
      : `You've removed your interest in "${eventTitle}".`
  );
}

export function showOpenResource(title: string, detail: string) {
  toast.info('Opening resource', `${title}\n${detail}`);
}
