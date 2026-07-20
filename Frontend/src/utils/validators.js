export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidOtp = (code) => /^\d{6}$/.test(code);
