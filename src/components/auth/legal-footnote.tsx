import { StyleSheet, Text } from 'react-native';

import { Brand, Typeface } from '@/constants/theme';

export function LegalFootnote() {
  return (
    <Text style={styles.text}>
      By continuing, you agree to our <Text style={styles.link}>Terms</Text> &{' '}
      <Text style={styles.link}>Privacy Policy</Text>.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: Brand.muted,
    fontSize: 12.5,
    fontFamily: Typeface.regular,
  },
  link: {
    color: '#05614E',
    fontFamily: Typeface.semibold,
  },
});
