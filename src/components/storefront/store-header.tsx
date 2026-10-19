import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Linking, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { SearchIcon, ShareIcon, ShieldIcon, WhatsAppIcon } from '@/components/icons';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { type StoreProfile, storeInitials } from '@/state/store-profile';
import { type VendorProfile } from '@/state/vendor-profile';
import { toInternationalNumber } from '@/services/termii';

type Props = {
  store: StoreProfile;
  vendor: VendorProfile | null;
  search: string;
  onSearchChange: (text: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
};

export function StoreHeader({
  store,
  vendor,
  search,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  categories,
}: Props) {
  const initials = storeInitials(store.name);

  const openWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phone = vendor?.phone || '8030000000';
    const intl = toInternationalNumber(phone);
    const message = encodeURIComponent(`Hi ${store.name}, I'm browsing your store on Linka and have an inquiry!`);
    Linking.openURL(`https://wa.me/${intl}?text=${message}`);
  };

  const shareStore = async () => {
    Haptics.selectionAsync();
    const url = `https://linka.shop/${store.slug}`;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: store.name, url });
        return;
      } catch {
        // Fall back to copy
      }
    }
    Share.share({
      message: `Shop quality products from ${store.name} on Linka: ${url}`,
      url,
    });
  };

  return (
    <View style={styles.container}>
      {/* Visual Cover Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerOverlay} />
      </View>

      {/* Store Identity */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrap}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.initialsAvatar]}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}
        </View>

        <View style={styles.storeInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
            <View style={styles.verifiedBadge}>
              <ShieldIcon size={14} color="#05614E" />
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{store.category}</Text>
            </View>
            <Text style={styles.domainText}>linka.shop/{store.slug}</Text>
          </View>

          {store.description ? (
            <Text style={styles.description}>{store.description}</Text>
          ) : null}

          {/* Social / Contact Actions */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={openWhatsApp}
              style={({ pressed }) => [styles.actionButton, styles.whatsappButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Chat on WhatsApp">
              <WhatsAppIcon size={16} color="#05614E" />
              <Text style={styles.whatsappText}>WhatsApp</Text>
            </Pressable>

            <Pressable
              onPress={shareStore}
              style={({ pressed }) => [styles.actionButton, styles.secondaryButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Share store link">
              <ShareIcon size={15} color={Surface.ink} />
              <Text style={styles.secondaryText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Search & Categories */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <SearchIcon size={17} color="#8A9590" />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={`Search ${store.name}...`}
            placeholderTextColor="#8A9590"
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
        </View>

        {categories.length > 1 && (
          <View style={styles.categoryScroll}>
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelectCategory(cat);
                  }}
                  style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  banner: {
    height: 94,
    backgroundColor: '#033F33',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#05614E',
    opacity: 0.85,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 0,
    marginTop: -42,
    flexDirection: 'column',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: Brand.white,
    overflow: 'hidden',
    backgroundColor: Brand.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsAvatar: {
    backgroundColor: '#05614E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: Brand.white,
    fontSize: 28,
    fontFamily: Typeface.bold,
  },
  storeInfo: {
    marginTop: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeName: {
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    color: Brand.ink,
    letterSpacing: -0.4,
  },
  verifiedBadge: {
    backgroundColor: '#E7F7F2',
    padding: 3,
    borderRadius: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  categoryPill: {
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: Typeface.medium,
    color: '#05614E',
  },
  domainText: {
    fontSize: 12,
    fontFamily: Typeface.regular,
    color: '#8A9590',
  },
  description: {
    fontSize: 14,
    fontFamily: Typeface.regular,
    color: Brand.body,
    lineHeight: 20,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  whatsappButton: {
    backgroundColor: '#E7F7F2',
    borderColor: '#BFE7DB',
  },
  whatsappText: {
    color: '#05614E',
    fontFamily: Typeface.semibold,
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: '#F8FAF9',
    borderColor: '#E1E6E4',
  },
  secondaryText: {
    color: Surface.ink,
    fontFamily: Typeface.medium,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.7,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F6F4',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: Typeface.regular,
    fontSize: 14,
    color: Brand.ink,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
  },
  pillActive: {
    backgroundColor: '#05614E',
  },
  pillText: {
    fontSize: 13,
    fontFamily: Typeface.medium,
    color: Brand.body,
  },
  pillTextActive: {
    color: Brand.white,
    fontFamily: Typeface.semibold,
  },
});
