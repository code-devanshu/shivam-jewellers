import crypto from "crypto";

const algorithm = "aes-256-cbc";

const passphrase = "your-secure-passphrase"; // Replace with a secure passphrase

// Generate a consistent key based on the passphrase
function generateKey() {
  return crypto.createHash("sha256").update(passphrase).digest(); // 256-bit key
}

// Generate a new IV for each encryption call
function generateIv(): Buffer {
  return crypto.randomBytes(16);
}

export function encrypt(data: object) {
  const key = generateKey();
  const iv = generateIv();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string) {
  const [ivHex, encrypted] = encryptedData.split(":");
  const key = generateKey();
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex"); // Generate a random salt
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex"); // PBKDF2 hashing
  return `${salt}:${hash}`; // Store the salt and hash together
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":"); // Extract the salt from the stored hash
  const hashToCompare = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return hash === hashToCompare; // Compare the hashes
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex"); // Generates a secure random 256-bit token
}
