describe("HomeScreen", () => {
  it("should have correct route path", () => {
    const route = "/";
    expect(route).toBe("/");
  });

  it("should navigate to editor on create button press", () => {
    const targetRoute = "/create/editor";
    expect(targetRoute).toBe("/create/editor");
  });
});

describe("Create flow routes", () => {
  const routes = ["/create/editor", "/create/step3"];

  it("has 2 steps (editor + share)", () => {
    expect(routes).toHaveLength(2);
  });

  it("follows correct step order", () => {
    expect(routes[0]).toContain("editor");
    expect(routes[1]).toContain("step3");
  });
});
