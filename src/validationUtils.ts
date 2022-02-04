type YesOrNo = "Y" | "N";

//upper-lower-numbers-special-length
export type PasswordValidationRules =
  `${YesOrNo}-${YesOrNo}-${YesOrNo}-${YesOrNo}-${number}`;

interface ParsedPasswordValidationRules {
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  minLength: number;
}

export function parsePasswordRules(
  rules: PasswordValidationRules,
): ParsedPasswordValidationRules {
  const parsedPasswordRules: ParsedPasswordValidationRules = {
    upper: true,
    lower: true,
    number: true,
    special: true,
    minLength: 8,
  };

  const splitRules = rules.split("-");

  if (splitRules[0] === "N") parsedPasswordRules.upper = false;
  if (splitRules[1] === "N") parsedPasswordRules.lower = false;
  if (splitRules[2] === "N") parsedPasswordRules.number = false;
  if (splitRules[3] === "N") parsedPasswordRules.special = false;
  parsedPasswordRules.minLength = Number(splitRules[4]);

  return parsedPasswordRules;
}

export function validatePassword(
  password: string,
  rules: PasswordValidationRules,
): boolean {
  const parsedRules = parsePasswordRules(rules);
  let valid = true;

  if (parsedRules.upper) {
    if (!/[A-Z]/.test(password)) valid = false;
  }
  if (parsedRules.lower) {
    if (!/[a-z]/.test(password)) valid = false;
  }
  if (parsedRules.number) {
    if (!/[0-9]/.test(password)) valid = false;
  }
  if (parsedRules.special) {
    if (!/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password))
      valid = false;
  }
  if (password.length < parsedRules.minLength) valid = false;

  return valid;
}

export function validateEmail(email: string) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email,
  );
}
