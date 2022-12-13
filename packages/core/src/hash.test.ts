import { hash } from "./hash";

describe("hash", () => {
  it("should create a short hash", () => {
    expect(hash("path1/file.md")).toBe("fz3a3q");
    expect(hash("path2/file.md")).toBe("dx0qop");
  });
});
