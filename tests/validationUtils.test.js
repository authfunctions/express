const {
  parsePasswordRules,
  validatePassword,
} = require("../src/validationUtils");

describe("parsePasswordRules tests", () => {
  test("Parse N-N-N-N-0", () => {
    expect(parsePasswordRules("N-N-N-N-0")).toEqual({
      upper: false,
      lower: false,
      number: false,
      special: false,
      minLength: 0,
    });
  });

  test("Parse Y-N-N-N-0", () => {
    expect(parsePasswordRules("Y-N-N-N-0")).toEqual({
      upper: true,
      lower: false,
      number: false,
      special: false,
      minLength: 0,
    });
  });

  test("Parse N-Y-N-N-0", () => {
    expect(parsePasswordRules("N-Y-N-N-0")).toEqual({
      upper: false,
      lower: true,
      number: false,
      special: false,
      minLength: 0,
    });
  });

  test("Parse N-N-Y-N-0", () => {
    expect(parsePasswordRules("N-N-Y-N-0")).toEqual({
      upper: false,
      lower: false,
      number: true,
      special: false,
      minLength: 0,
    });
  });

  test("Parse N-N-N-Y-0", () => {
    expect(parsePasswordRules("N-N-N-Y-0")).toEqual({
      upper: false,
      lower: false,
      number: false,
      special: true,
      minLength: 0,
    });
  });

  test("Parse N-N-N-N-1", () => {
    expect(parsePasswordRules("N-N-N-N-1")).toEqual({
      upper: false,
      lower: false,
      number: false,
      special: false,
      minLength: 1,
    });
  });
});

describe("validatePassword tests", () => {
  test("Abc123?! should be valid for Y-Y-Y-Y-8", () => {
    expect(validatePassword("Abc123?!", "Y-Y-Y-Y-8")).toBe(true);
  });

  test("Abc123 should be valid for Y-Y-Y-N-6", () => {
    expect(validatePassword("Abc123", "Y-Y-Y-N-6")).toBe(true);
  });

  test("Abc should be valid for Y-Y-N-N-3", () => {
    expect(validatePassword("Abc", "Y-Y-N-N-3")).toBe(true);
  });

  test("A should be valid for Y-N-N-N-1", () => {
    expect(validatePassword("A", "Y-N-N-N-1")).toBe(true);
  });

  test("A should be invalid for Y-Y-Y-Y-9", () => {
    expect(validatePassword("A", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("Abc should be invalid for Y-Y-Y-Y-9", () => {
    expect(validatePassword("Abc", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("Abc123 should be invalid for Y-Y-Y-Y-9", () => {
    expect(validatePassword("Abc123", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("Abc123?! should be invalid for Y-Y-Y-Y-9", () => {
    expect(validatePassword("Abc123?!", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("Abc123?!. should be invalid for Y-Y-Y-Y-9", () => {
    expect(validatePassword("Abc123?!.", "Y-Y-Y-Y-9")).toBe(true);
  });
});
