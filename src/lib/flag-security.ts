import 'server-only';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Flag } from './types';

function pepper() {
  const value = process.env.FLAG_PEPPER;
  if (!value || value.length < 32) throw new Error('FLAG_PEPPER must be set to at least 32 characters.');
  return value;
}

export function hashStaticFlag(value: string, caseSensitive: boolean) {
  return createHmac('sha256', pepper()).update(caseSensitive ? value : value.toLowerCase()).digest('hex');
}

function regexKey() {
  return createHmac('sha256', pepper()).update('ciberNUtica regex flag encryption v1').digest();
}

export function encryptRegexFlag(pattern: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', regexKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(pattern, 'utf8'), cipher.final()]);
  return `enc:v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${ciphertext.toString('base64url')}`;
}

function decryptRegexFlag(value: string) {
  const [, version, ivText, tagText, dataText] = value.split(':');
  if (version !== 'v1' || !ivText || !tagText || !dataText) throw new Error('Invalid encrypted regex flag.');
  const decipher = createDecipheriv('aes-256-gcm', regexKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataText, 'base64url')), decipher.final()]).toString('utf8');
}

export function verifyStoredFlags(provided: string, flags: Flag[]) {
  for (const flag of flags) {
    if (flag.type === 'STATIC') {
      const submittedHash = Buffer.from(hashStaticFlag(provided, flag.caseSensitive), 'hex');
      const storedHash = Buffer.from(flag.content, 'hex');
      if (submittedHash.length === storedHash.length && timingSafeEqual(submittedHash, storedHash)) return true;
    } else {
      try {
        if (new RegExp(decryptRegexFlag(flag.content), flag.caseSensitive ? '' : 'i').test(provided)) return true;
      } catch {
        // Ignore invalid regex patterns and fail closed.
      }
    }
  }
  return false;
}
