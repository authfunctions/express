const {
  parsePasswordRules,
  validateEmail,
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
  test("test Y-Y-Y-Y-8 with Abc123?!  -> valid", () => {
    expect(validatePassword("Abc123?!", "Y-Y-Y-Y-8")).toBe(true);
  });

  test("test Y-Y-Y-N-6 with Abc123    -> valid", () => {
    expect(validatePassword("Abc123", "Y-Y-Y-N-6")).toBe(true);
  });

  test("test Y-Y-N-N-3 with Abc       -> valid", () => {
    expect(validatePassword("Abc", "Y-Y-N-N-3")).toBe(true);
  });

  test("test Y-N-N-N-1 with A         -> valid", () => {
    expect(validatePassword("A", "Y-N-N-N-1")).toBe(true);
  });

  test("test Y-Y-Y-Y-9 with A         -> invalid", () => {
    expect(validatePassword("A", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("test Y-Y-Y-Y-9 with Abc       -> invalid", () => {
    expect(validatePassword("Abc", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("test Y-Y-Y-Y-9 with Abc123    -> invalid", () => {
    expect(validatePassword("Abc123", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("test Y-Y-Y-Y-9 with Abc123?!  -> invalid", () => {
    expect(validatePassword("Abc123?!", "Y-Y-Y-Y-9")).toBe(false);
  });

  test("test Y-Y-Y-Y-9 with Abc123?!. -> valid", () => {
    expect(validatePassword("Abc123?!.", "Y-Y-Y-Y-9")).toBe(true);
  });
});

describe("validateEmail tests", () => {
  test("test a       -> invalid", () => {
    expect(validateEmail("a")).toBe(false)
  })

  test("test a@b     -> invalid", () => {
    expect(validateEmail("a@b")).toBe(false)
  })
  
  test("test a@b.com -> valid", () => {
    expect(validateEmail("a@b.com")).toBe(true)
  })
})