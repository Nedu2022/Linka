export const TERMII_API_KEY = process.env.EXPO_PUBLIC_TERMII_API_KEY;
export const TERMII_BASE_URL = process.env.EXPO_PUBLIC_TERMII_BASE_URL?.replace(/\/+$/, '');
export const TERMII_SENDER_ID = process.env.EXPO_PUBLIC_TERMII_SENDER_ID;

/**
 * Normalizes any Nigerian phone number to international format (234XXXXXXXXXX)
 * without leading '+' or special characters as required by Termii.
 */
export function toInternationalNumber(digits: string): string {
  let cleaned = digits.replace(/\D/g, '');
  if (cleaned.startsWith('234')) return cleaned;
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return `234${cleaned}`;
}

export type SendOtpResult = {
  success: boolean;
  pinId?: string;
  smsStatus?: string;
  error?: string;
};

export type VerifyOtpResult = {
  success: boolean;
  error?: string;
};

/**
 * Sends a 6-digit numeric OTP to the recipient phone number via Termii.
 */
export async function sendOtp(phone: string): Promise<SendOtpResult> {
  const intlNumber = toInternationalNumber(phone);

  if (!TERMII_API_KEY || !TERMII_BASE_URL || !TERMII_SENDER_ID) {
    return {
      success: false,
      error: 'Termii configuration missing in .env (EXPO_PUBLIC_TERMII_API_KEY, EXPO_PUBLIC_TERMII_BASE_URL, or EXPO_PUBLIC_TERMII_SENDER_ID).',
    };
  }

  try {
    const response = await fetch(`${TERMII_BASE_URL}/api/sms/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        message_type: 'NUMERIC',
        to: intlNumber,
        from: TERMII_SENDER_ID,
        channel: 'dnd',
        pin_attempts: 5,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: '< 1234 >',
        message_text: 'Your Linka confirmation code is < 1234 >. Valid for 10 minutes.',
      }),
    });

    const data = await response.json();

    if (response.ok && data?.pinId) {
      return {
        success: true,
        pinId: data.pinId,
        smsStatus: data.smsStatus,
      };
    }

    const errorMessage = data?.message || data?.error || 'Failed to send verification SMS.';
    return {
      success: false,
      error: errorMessage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network request failed';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Verifies an OTP code using Termii's Verify Token API.
 */
export async function verifyOtp(pinId: string | undefined, pin: string): Promise<VerifyOtpResult> {
  if (!pinId) {
    return {
      success: false,
      error: 'No active verification session. Please request a new code.',
    };
  }

  if (!TERMII_API_KEY || !TERMII_BASE_URL) {
    return {
      success: false,
      error: 'Termii configuration missing in .env.',
    };
  }

  try {
    const response = await fetch(`${TERMII_BASE_URL}/api/sms/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        pin_id: pinId,
        pin,
      }),
    });

    const data = await response.json();

    const isVerified =
      data?.verified === true ||
      data?.verified === 'True' ||
      data?.verified === 'true' ||
      data?.status === 200;

    if (isVerified) {
      return { success: true };
    }

    const errorMessage = data?.message || data?.error || 'Invalid or expired code. Please try again.';
    return {
      success: false,
      error: errorMessage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Verification request failed';
    return {
      success: false,
      error: message,
    };
  }
}
