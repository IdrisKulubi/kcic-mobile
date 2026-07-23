export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/** Accepts .edu, .co.ke, .org, and other common email formats. */
export function isValidEmail(value: string) {
  const email = normalizeEmail(value);
  if (!email || email.length > 254) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
  if (!domain.includes('.')) return false;

  const labels = domain.split('.');
  if (labels.some((label) => !label)) return false;

  const tld = labels[labels.length - 1];
  return Boolean(tld && tld.length >= 2);
}

export function assertEmail(value: string) {
  const email = normalizeEmail(value);
  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}
