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
});
