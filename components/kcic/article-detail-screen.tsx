import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RichText } from '@/components/kcic/rich-text';
import { palette } from '@/components/kcic/ui';
// Later: PDF download & print via more menu
// import { downloadArticlePdf, printArticle } from '@/lib/article-export';
import { formatContentDate, resolveContentImageUrl, type NewsArticle } from '@/lib/content-api';
import { hapticLight } from '@/lib/haptics';
import { fonts } from '@/lib/typography';

type ArticleDetailScreenProps = {
  article: NewsArticle;
  bookmarked: boolean;
  onToggleBookmark: () => void;
};

export function ArticleDetailScreen({
  article,
  bookmarked,
  onToggleBookmark,
}: ArticleDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  // Later: PDF download & print
  // const [menuOpen, setMenuOpen] = useState(false);
  // const [exporting, setExporting] = useState(false);

  const heroImage = resolveContentImageUrl(article.thumbnail);
  const published = formatContentDate(article.publishedAt);
  const readTime = article.readTime ?? 'Article';
  const metaLine = [article.category, published, readTime].filter(Boolean).join(' | ');

  const scrollToBody = () => {
    hapticLight();
    scrollRef.current?.scrollTo({ y: windowHeight, animated: true });
  };

  const handleShare = async () => {
    hapticLight();
    await Share.share({
      title: article.title,
      message: `${article.title}\n\n${article.excerpt}`,
    });
  };

  const handleSave = () => {
    hapticLight();
    onToggleBookmark();
  };

  // Later: PDF download & print
  // const handleMore = () => {
  //   hapticLight();
  //   setMenuOpen(true);
  // };
  //
  // const handleDownload = async () => {
  //   hapticLight();
  //   setMenuOpen(false);
  //   if (Platform.OS === 'web') {
  //     Alert.alert('Unavailable', 'PDF download is not supported on web.');
  //     return;
  //   }
  //   try {
  //     setExporting(true);
  //     await downloadArticlePdf(article);
  //   } catch {
  //     Alert.alert('Download failed', 'Could not create the PDF. Please try again.');
  //   } finally {
  //     setExporting(false);
  //   }
  // };
  //
  // const handlePrint = async () => {
  //   hapticLight();
  //   setMenuOpen(false);
  //   if (Platform.OS === 'web') {
  //     Alert.alert('Unavailable', 'Printing is not supported on web.');
  //     return;
  //   }
  //   try {
  //     setExporting(true);
  //     await printArticle(article);
  //   } catch {
  //     Alert.alert('Print failed', 'Could not open the print dialog. Please try again.');
  //   } finally {
  //     setExporting(false);
  //   }
  // };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { height: windowHeight }]}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={[styles.heroImage, styles.heroFallback]} />
          )}
          <LinearGradient
            colors={['rgba(15, 16, 17, 0.15)', 'rgba(15, 16, 17, 0.45)', 'rgba(15, 16, 17, 0.82)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle} numberOfLines={4}>
              {article.title}
            </Text>
            <Text style={styles.heroMeta}>{metaLine}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue reading"
              onPress={scrollToBody}
              style={({ pressed }) => [styles.chevronButton, { opacity: pressed ? 0.72 : 1 }]}>
              <MaterialIcons name="keyboard-arrow-down" size={30} color="#F4F4F5" />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.excerpt}>{article.excerpt}</Text>
          <RichText html={article.content} />
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <ToolbarIconButton
          accessibilityLabel="Go back"
          icon="arrow-back"
          onPress={() => {
            hapticLight();
            router.back();
          }}
        />
        <View style={styles.toolbarActions}>
          <ToolbarIconButton
            accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Save article'}
            icon={bookmarked ? 'bookmark' : 'bookmark-border'}
            iconColor={bookmarked ? palette.green : '#F4F4F5'}
            onPress={handleSave}
          />
          <ToolbarIconButton
            accessibilityLabel="Share article"
            icon="share"
            onPress={() => void handleShare()}
          />
          {/* Later: PDF download & print
          <ToolbarIconButton
            accessibilityLabel="More options"
            icon="more-vert"
            onPress={handleMore}
          />
          */}
        </View>
      </View>

      {/* Later: PDF download & print
      {exporting ? (
        <View style={styles.exportOverlay}>
          <ActivityIndicator color={palette.green} size="large" />
        </View>
      ) : null}

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuSheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.menuTitle}>Article options</Text>
            <Pressable style={styles.menuRow} onPress={() => void handleDownload()}>
              <MaterialIcons name="download" size={22} color={palette.ink} />
              <Text style={styles.menuRowText}>Download PDF</Text>
            </Pressable>
            <Pressable style={styles.menuRow} onPress={() => void handlePrint()}>
              <MaterialIcons name="print" size={22} color={palette.ink} />
              <Text style={styles.menuRowText}>Print</Text>
            </Pressable>
            <Pressable
              style={styles.menuCancel}
              onPress={() => {
                hapticLight();
                setMenuOpen(false);
              }}>
              <Text style={styles.menuCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      */}
    </View>
  );
}

function ToolbarIconButton({
  icon,
  iconColor = '#F4F4F5',
  accessibilityLabel,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.72 : 1 }]}>
      <MaterialIcons name={icon} size={21} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.shell,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#202123',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    backgroundColor: '#292A2C',
  },
  heroCopy: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 42,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: '#F4F4F5',
    textAlign: 'center',
  },
  heroMeta: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(244, 244, 245, 0.88)',
    textAlign: 'center',
  },
  chevronButton: {
    marginTop: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 16, 17, 0.42)',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 16,
    backgroundColor: palette.shell,
  },
  excerpt: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: palette.slate,
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 16, 17, 0.45)',
  },
  exportOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 16, 17, 0.28)',
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 16, 17, 0.42)',
  },
  menuSheet: {
    backgroundColor: palette.shell,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 4,
  },
  menuTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: palette.ink,
    marginBottom: 8,
  },
  menuRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: palette.ink,
  },
  menuCancel: {
    marginTop: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCancelText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: palette.slate,
  },
});
