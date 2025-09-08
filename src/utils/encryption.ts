import CryptoJS from 'crypto-js';

const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  return key;
};

export const encryptApiKey = (apiKey: string): string => {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(apiKey, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
};

export const decryptApiKey = (encryptedKey: string): string => {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Failed to decrypt API key');
    }
    
    return decryptedString;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
};