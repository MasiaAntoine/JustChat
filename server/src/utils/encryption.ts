import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error("ENCRYPTION_SECRET is not set or empty");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Chiffre une chaîne (contenu texte ou image base64) avec AES-256-GCM.
 * Retourne la chaîne telle quelle si elle est vide.
 */
export function encrypt(plainText: string): string {
  if (!plainText || plainText.length === 0) return plainText;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Déchiffre une chaîne produite par encrypt().
 * Si le déchiffrement échoue (ex. anciennes données non chiffrées), retourne la valeur d'origine.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || encryptedText.length === 0) return encryptedText;
  try {
    const combined = Buffer.from(encryptedText, "base64");
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) return encryptedText;
    const key = getKey();
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
  } catch {
    return encryptedText;
  }
}

/**
 * Chiffre les champs sensibles d'un message (content, image) avant stockage en base.
 */
export function encryptMessage(msg: { content?: string; image?: string }): { content: string; image?: string } {
  const content = msg.content != null ? encrypt(msg.content) : "";
  const image = msg.image != null && msg.image.length > 0 ? encrypt(msg.image) : undefined;
  return { content, ...(image !== undefined && { image }) };
}

/**
 * Déchiffre les champs content et image d'un message lu depuis la base.
 */
export function decryptMessage(msg: { content?: string; image?: string }): { content: string; image?: string } {
  const content = msg.content != null ? decrypt(msg.content) : "";
  const image = msg.image != null && msg.image.length > 0 ? decrypt(msg.image) : undefined;
  return { ...msg, content, ...(image !== undefined ? { image } : { image: undefined }) };
}
