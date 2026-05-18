import CryptoJS from 'crypto-js';

const FALLBACK_KEY = 'dev_only_encryption_key_for_tests_32_chars_long';
const KEY = process.env.ENCRYPTION_KEY || FALLBACK_KEY;

if (process.env.NODE_ENV === 'production' && (!process.env.ENCRYPTION_KEY || KEY.length < 32)) {
  throw new Error('ENCRYPTION_KEY must be 32+ chars');
}

export const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, KEY).toString();
};

export const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  const bytes = CryptoJS.AES.decrypt(ciphertext, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
