import { getStoreProfile, saveStoreProfile } from '@/state/store-profile';
import { getVendorProfile, saveVendorProfile } from '@/state/vendor-profile';

/**
 * Signs a returning vendor in after their phone number is verified.
 *
 * Placeholder until there's a backend: the server should look the vendor up by phone and return their profile
 * and store. Until then, an account already saved on this device is kept as-is; otherwise a sample store stands
 * in so the dashboard has something to show.
 */
export function logIn(phone: string) {
  const vendor = getVendorProfile();
  if (!vendor) saveVendorProfile({ fullName: '', email: '', phone });
  else if (vendor.phone !== phone) saveVendorProfile({ ...vendor, phone });

  if (!getStoreProfile()) {
    saveStoreProfile({
      name: 'Mama Tee Fabrics',
      slug: 'mama-tee-fabrics',
      category: 'Fashion',
      description: 'Quality Ankara and lace, delivered across Lagos.',
      logo: null,
      verified: false,
    });
  }
}
