import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// Hash dummy untuk menyamakan waktu respons saat email tidak ditemukan.
export const DUMMY_PASSWORD_HASH = "$2a$12$kUXvMC0ZjUiOeINCz6wq5ueY2m8YTJtXIOE5nrK.OIlofiBGDn4Cm";

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
