export type PasswordValidationResult = {
  ok: boolean;
  errors: string[];
};

export type PasswordPolicyOptions = {
  minLengthExclusive?: number; // default: 10 means length must be > 10
  disallowWhitespace?: boolean; // default: false
  // If provided, overrides the default "any non-alphanumeric" definition.
  specialCharRegex?: RegExp;
};

const DEFAULTS: Required<PasswordPolicyOptions> = {
  minLengthExclusive: 10,
  disallowWhitespace: false,
  specialCharRegex: /[^A-Za-z0-9]/,
};

function normalizeOptions(options?: PasswordPolicyOptions): Required<PasswordPolicyOptions> {
  return { ...DEFAULTS, ...(options ?? {}) };
}

export function validateSignupPassword(
  password: unknown,
  options?: PasswordPolicyOptions,
): PasswordValidationResult {
  const opts = normalizeOptions(options);
  const errors: string[] = [];

  if (typeof password !== "string") {
    return { ok: false, errors: ["Password must be a string."] };
  }

  if (password.length <= opts.minLengthExclusive) {
    errors.push(`Password must be longer than ${opts.minLengthExclusive} characters.`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must include at least one lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include at least one uppercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must include at least one number.");
  }

  if (!opts.specialCharRegex.test(password)) {
    errors.push("Password must include at least one special character.");
  }

  if (opts.disallowWhitespace && /\s/.test(password)) {
    errors.push("Password must not contain whitespace.");
  }

  return { ok: errors.length === 0, errors };
}