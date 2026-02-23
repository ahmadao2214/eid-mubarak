import {
  createProject,
  getProject,
  updateProject,
  listAllProjects,
  removeProject,
} from "@/repositories/projects";

// Mock the Convex client
jest.mock("@/lib/convex", () => ({
  convexClient: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
  api: {
    projects: {
      create: "projects:create",
      get: "projects:get",
      update: "projects:update",
      list: "projects:list",
      remove: "projects:remove",
    },
  },
}));

// Mock the mappers
jest.mock("@/lib/convex-mappers", () => ({
  mapProject: jest.fn((doc: any) => ({
    id: doc._id,
    name: doc.name,
    composition: doc.composition,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  })),
}));

const { convexClient } = require("@/lib/convex");

const mockComposition = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300,
  background: { type: "solid" as const, source: "#1a1a2e" },
  hue: { enabled: false, color: "none" as const, opacity: 0, animation: "static" as const },
  head: {
    imageUrl: "",
    position: { x: 50, y: 45 },
    scale: 0.4,
    enterAtFrame: 15,
    animation: "pop" as const,
  },
  decorativeElements: [],
  textSlots: [],
  audio: { trackUrl: "", volume: 0.8 },
};

describe("projects repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("createProject calls convexClient.mutation", async () => {
    convexClient.mutation.mockResolvedValue("proj-convex-1");
    const result = await createProject("My Card", mockComposition);
    expect(convexClient.mutation).toHaveBeenCalledWith("projects:create", {
      name: "My Card",
      templateId: "default",
      composition: mockComposition,
    });
    expect(result).toBe("proj-convex-1");
  });

  it("getProject calls convexClient.query and maps result", async () => {
    const doc = {
      _id: "proj-1",
      _creationTime: 1000,
      name: "My Card",
      templateId: "default",
      composition: mockComposition,
      createdAt: 1000,
      updatedAt: 1000,
    };
    convexClient.query.mockResolvedValue(doc);
    const result = await getProject("proj-1");
    expect(convexClient.query).toHaveBeenCalledWith("projects:get", { id: "proj-1" });
    expect(result).not.toBeNull();
    expect(result!.id).toBe("proj-1");
  });

  it("getProject returns null when project not found", async () => {
    convexClient.query.mockResolvedValue(null);
    const result = await getProject("nonexistent");
    expect(result).toBeNull();
  });

  it("updateProject calls convexClient.mutation", async () => {
    convexClient.mutation.mockResolvedValue(undefined);
    await updateProject("proj-1", mockComposition);
    expect(convexClient.mutation).toHaveBeenCalledWith("projects:update", {
      id: "proj-1",
      composition: mockComposition,
    });
  });

  it("listAllProjects calls convexClient.query and maps results", async () => {
    const docs = [
      {
        _id: "proj-1",
        _creationTime: 1000,
        name: "Card",
        templateId: "default",
        composition: mockComposition,
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];
    convexClient.query.mockResolvedValue(docs);
    const result = await listAllProjects();
    expect(convexClient.query).toHaveBeenCalledWith("projects:list", {});
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("proj-1");
  });

  it("removeProject calls convexClient.mutation", async () => {
    convexClient.mutation.mockResolvedValue(undefined);
    await removeProject("proj-1");
    expect(convexClient.mutation).toHaveBeenCalledWith("projects:remove", { id: "proj-1" });
  });
});
