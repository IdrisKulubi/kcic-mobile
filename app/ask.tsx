import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showGrantApply } from '@/components/kcic/feedback';
import { palette } from '@/components/kcic/ui';
import { usePrototype } from '@/context/prototype-context';
import type { AskCitation } from '@/lib/ask-kcic/respond';
import { askKcic, getSuggestedPrompts, WELCOME_MESSAGE } from '@/lib/ask-kcic/respond';
import { openContent, openPodcastEpisode } from '@/lib/navigation';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AskCitation[];
};

function parseBoldSegments(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
}

function openCitation(citation: AskCitation) {
  if (citation.type === 'grant') {
    showGrantApply();
    return;
  }
  if (citation.type === 'podcast') {
    openPodcastEpisode(citation.id);
    return;
  }
  if (citation.type === 'article' || citation.type === 'story' || citation.type === 'event') {
    openContent(citation.type, citation.id);
  }
}

export default function AskKcicScreen() {
  const { interests } = usePrototype();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE.content,
    },
  ]);

  const suggestedPrompts = getSuggestedPrompts();

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsThinking(true);
      scrollToEnd();

      await new Promise((resolve) => setTimeout(resolve, 700));

      const reply = askKcic(trimmed, interests);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        citations: reply.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
      scrollToEnd();
    },
    [interests, isThinking, scrollToEnd]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ask KCIC',
          headerBackVisible: false,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.betaBanner}>
          <MaterialIcons name="auto-awesome" size={16} color={palette.forest} />
          <Text style={styles.betaText}>
            Prototype demo — answers are generated from KCIC library content with citations.
          </Text>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 92 : 0}>
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToEnd}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.bubbleWrap,
                  message.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAssistant,
                ]}>
                {message.role === 'assistant' ? (
                  <View style={styles.assistantAvatar}>
                    <MaterialIcons name="eco" size={18} color={palette.white} />
                  </View>
                ) : null}
                <View
                  style={[
                    styles.bubble,
                    message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}>
                  <Text
                    style={[
                      styles.bubbleText,
                      message.role === 'user' ? styles.bubbleTextUser : null,
                    ]}>
                    {message.role === 'assistant'
                      ? message.content.split('\n').map((line, lineIndex) => (
                          <Text key={lineIndex}>
                            {line.length === 0 ? '\n' : parseBoldSegments(line)}
                            {'\n'}
                          </Text>
                        ))
                      : message.content}
                  </Text>
                  {message.citations && message.citations.length > 0 ? (
                    <View style={styles.citations}>
                      <Text style={styles.citationsLabel}>Sources</Text>
                      {message.citations.map((citation) => (
                        <Pressable
                          key={`${citation.type}-${citation.id}`}
                          style={styles.citationChip}
                          onPress={() => openCitation(citation)}>
                          <MaterialIcons
                            name={
                              citation.type === 'article'
                                ? 'article'
                                : citation.type === 'story'
                                  ? 'business'
                                  : citation.type === 'event'
                                    ? 'event'
                                    : citation.type === 'podcast'
                                      ? 'play-circle-outline'
                                      : 'payments'
                            }
                            size={16}
                            color={palette.forest}
                          />
                          <View style={styles.citationText}>
                            <Text style={styles.citationTitle} numberOfLines={1}>
                              {citation.title}
                            </Text>
                            <Text style={styles.citationSubtitle} numberOfLines={1}>
                              {citation.subtitle}
                            </Text>
                          </View>
                          <MaterialIcons name="chevron-right" size={18} color={palette.muted} />
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}

            {isThinking ? (
              <View style={[styles.bubbleWrap, styles.bubbleWrapAssistant]}>
                <View style={styles.assistantAvatar}>
                  <MaterialIcons name="eco" size={18} color={palette.white} />
                </View>
                <View style={[styles.bubble, styles.bubbleAssistant, styles.thinking]}>
                  <ActivityIndicator color={palette.limeDark} />
                  <Text style={styles.thinkingText}>Searching KCIC library…</Text>
                </View>
              </View>
            ) : null}

            {messages.length === 1 && !isThinking ? (
              <View style={styles.prompts}>
                <Text style={styles.promptsLabel}>Try asking</Text>
                {suggestedPrompts.map((prompt) => (
                  <Pressable
                    key={prompt}
                    style={styles.promptChip}
                    onPress={() => sendMessage(prompt)}>
                    <Text style={styles.promptText}>{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about grants, policy, events, SMEs…"
              placeholderTextColor={palette.muted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!isThinking}
            />
            <Pressable
              style={[styles.sendButton, (!input.trim() || isThinking) && styles.sendDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isThinking}>
              <MaterialIcons name="send" size={20} color={palette.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  flex: {
    flex: 1,
  },
  betaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E9F7DE',
    borderWidth: 1,
    borderColor: palette.line,
  },
  betaText: {
    flex: 1,
    color: palette.forest,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 14,
  },
  bubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.limeDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 14,
  },
  bubbleUser: {
    backgroundColor: palette.forest,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.line,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: palette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: palette.white,
  },
  bold: {
    fontWeight: '900',
    color: palette.ink,
  },
  citations: {
    marginTop: 12,
    gap: 8,
  },
  citationsLabel: {
    color: palette.slate,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  citationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.panel,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.line,
  },
  citationText: {
    flex: 1,
    gap: 1,
  },
  citationTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  citationSubtitle: {
    color: palette.slate,
    fontSize: 11,
  },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thinkingText: {
    color: palette.slate,
    fontSize: 14,
    fontWeight: '600',
  },
  prompts: {
    gap: 8,
    marginTop: 4,
    paddingLeft: 40,
  },
  promptsLabel: {
    color: palette.slate,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  promptChip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  promptText: {
    color: palette.forest,
    fontSize: 14,
    fontWeight: '700',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.white,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CDD5CD',
    backgroundColor: palette.shell,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: palette.ink,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.45,
  },
});
