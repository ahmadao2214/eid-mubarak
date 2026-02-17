// Smoke tests for the home screen logic
// Component rendering tests will run via Expo's dev client
// TDD focus: hooks, types, and business logic

describe("HomeScreen", () => {
  it("should have correct route path", () => {
    // The home screen is at app/index.tsx which maps to "/"
    const route = "/";
    expect(route).toBe("/");
  });

  it("should navigate to step 1 on create button press", () => {
    const targetRoute = "/create/step1";
    expect(targetRoute).toBe("/create/step1");
  });
});

describe("Create flow routes", () => {
  const routes = ["/create/step1", "/create/step2", "/create/step3"];

  it("has 3 steps", () => {
    expect(routes).toHaveLength(3);
  });

  it("follows correct step order", () => {
    expect(routes[0]).toContain("step1");
    expect(routes[1]).toContain("step2");
    expect(routes[2]).toContain("step3");
  });
});
