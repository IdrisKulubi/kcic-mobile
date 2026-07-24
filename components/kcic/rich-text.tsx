import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/kcic/ui';

function decode(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function blocksFromHtml(html: string) {
  const safe = html
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return decode(safe)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function RichText({ html }: { html: string | null | undefined }) {
  if (!html) return null;
  const blocks = blocksFromHtml(html);
  return (
    <View style={styles.root}>
      {blocks.map((block, index) => (
        <Text key={`${index}-${block.slice(0, 12)}`} style={styles.paragraph}>
          {block}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  paragraph: { color: palette.ink, fontSize: 15, lineHeight: 24 },
});
