import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AUTH_GREEN } from '@/components/auth/auth-top-bar';
import { CameraIcon, LinkIcon, PencilIcon } from '@/components/icons';
import { FIELD_FILL } from '@/components/store/text-field';
import { Brand, Surface, Typeface } from '@/constants/theme';
import { storeInitials } from '@/state/store-profile';

export const STORE_DOMAIN = 'linka.shop';

type Props = {
  logo: string | null;
  onLogoChange: (uri: string | null) => void;
  name: string;
  slug: string;
  category: string | null;
  description: string;
};

export function StorePreviewCard({ logo, onLogoChange, name, slug, category, description }: Props) {
  const trimmedName = name.trim();
  const initials = storeInitials(trimmedName);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) onLogoChange(result.assets[0].uri);
  };

  const editLogo = () => {
    Haptics.selectionAsync();
    if (!logo || Platform.OS === 'web') {
      pickImage();
      return;
    }
    Alert.alert('Store logo', undefined, [
      { text: 'Choose a new photo', onPress: pickImage },
      { text: 'Remove logo', style: 'destructive', onPress: () => onLogoChange(null) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={editLogo}
          accessibilityRole="button"
          accessibilityLabel={logo ? 'Edit store logo' : 'Upload store logo'}
          style={({ pressed }) => pressed && styles.pressed}>
          <View style={[styles.logo, !logo && initials ? styles.logoInitials : null]}>
            {logo ? (
              <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
                <Image source={{ uri: logo }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </Animated.View>
            ) : initials ? (
              <Text style={styles.initials}>{initials}</Text>
            ) : (
              <CameraIcon size={24} color={Brand.body} />
            )}
          </View>
          {logo || initials ? (
            <View style={styles.badge}>
              {logo ? <PencilIcon size={11} color={Brand.white} /> : <CameraIcon size={12} color={Brand.white} />}
            </View>
          ) : null}
        </Pressable>

        <View style={styles.identity}>
          <Text style={[styles.name, !trimmedName && styles.placeholder]} numberOfLines={1}>
            {trimmedName || 'Your store'}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {category ?? (logo ? 'Add your details below' : 'Tap to add a logo')}
          </Text>
        </View>
      </View>

      {description.trim().length > 0 && (
        <Text style={styles.description} numberOfLines={2}>
          {description.trim()}
        </Text>
      )}

      <View style={styles.linkRow}>
        <LinkIcon size={15} color={slug ? AUTH_GREEN : Brand.muted} />
        <Text style={styles.link} numberOfLines={1}>
          {STORE_DOMAIN}/<Text style={slug ? styles.slug : styles.slugEmpty}>{slug || 'your-store'}</Text>
        </Text>
      </View>
    </View>
  );
}

const LOGO = 60;

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 16,
    borderRadius: 30,
    backgroundColor: Surface.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    borderRadius: LOGO / 2,
    backgroundColor: FIELD_FILL,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    backgroundColor: AUTH_GREEN,
  },
  initials: {
    color: Brand.white,
    fontSize: 22,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.5,
  },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Brand.white,
    backgroundColor: Brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  identity: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: Brand.ink,
    fontSize: 20,
    fontFamily: Typeface.bold,
    letterSpacing: -0.4,
  },
  placeholder: {
    color: '#B4BBB7',
  },
  meta: {
    color: Brand.muted,
    fontSize: 14,
    fontFamily: Typeface.medium,
  },
  description: {
    marginTop: -4,
    color: Brand.body,
    fontSize: 14.5,
    lineHeight: 21,
    fontFamily: Typeface.regular,
  },
  linkRow: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: Surface.canvas,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    flex: 1,
    color: Brand.muted,
    fontSize: 14.5,
    fontFamily: Typeface.medium,
  },
  slug: {
    color: Brand.ink,
    fontFamily: Typeface.semibold,
  },
  slugEmpty: {
    color: '#B4BBB7',
  },
});
