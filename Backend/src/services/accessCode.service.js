import crypto from "crypto";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { ACCESS_CODE_LENGTH, ACCESS_CODE_EXPIRY_HOURS } from "../config/constants.js";

// Generates a numeric code of the given length (default from env), e.g. "48213907".
// Uses crypto.randomInt for a cryptographically strong random digit string.
export const generateCode = (length = ACCESS_CODE_LENGTH) => {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
};

export const hashCode = async (code) => bcrypt.hash(code, 10);

export const verifyCode = async (code, hash) => {
  if (!code || !hash) return false;
  return bcrypt.compare(String(code), hash);
};

// Builds a fresh { hash, issuedAt, usedAt, expiresAt } record and returns the
// plaintext code alongside it — the plaintext is only ever used once (to
// email it) and is never persisted.
export const issueAccessCode = async () => {
  const plaintext = generateCode();
  const hash = await hashCode(plaintext);
  const issuedAt = new Date();
  const expiresAt = dayjs(issuedAt).add(ACCESS_CODE_EXPIRY_HOURS, "hour").toDate();
  return { plaintext, record: { hash, issuedAt, usedAt: null, expiresAt } };
};

export const isCodeUsable = (record) => {
  if (!record?.hash) return false;
  if (record.usedAt) return false;
  if (record.expiresAt && dayjs().isAfter(record.expiresAt)) return false;
  return true;
};

export default { generateCode, hashCode, verifyCode, issueAccessCode, isCodeUsable };
