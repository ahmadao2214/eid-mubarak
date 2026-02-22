import * as mockApi from "@/lib/mock-api";
import * as storage from "@/lib/storage";
import {
  createProject,
  getProject,
  updateProject,
  listAllProjects,
  removeProject,
} from "@/repositories/projects";

jest.mock("@/lib/mock-api");
jest.mock("@/lib/storage");

const mockedApi = mockApi as jest.Mocked<typeof mockApi>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

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

  it("createProject delegates to mockCreateProject", async () => {
    mockedApi.mockCreateProject.mockResolvedValue("proj-1");
    const result = await createProject("My Card", mockComposition);
    expect(mockedApi.mockCreateProject).toHaveBeenCalledWith("My Card", mockComposition);
    expect(result).toBe("proj-1");
  });

  it("getProject delegates to mockGetProject", async () => {
    const project = { id: "proj-1", name: "My Card", composition: mockComposition, createdAt: 1, updatedAt: 1 };
    mockedApi.mockGetProject.mockResolvedValue(project);
    const result = await getProject("proj-1");
    expect(mockedApi.mockGetProject).toHaveBeenCalledWith("proj-1");
    expect(result).toEqual(project);
  });

  it("updateProject delegates to mockUpdateProject", async () => {
    mockedApi.mockUpdateProject.mockResolvedValue(undefined);
    await updateProject("proj-1", mockComposition);
    expect(mockedApi.mockUpdateProject).toHaveBeenCalledWith("proj-1", mockComposition);
  });

  it("listAllProjects wraps storage.listProjects", async () => {
    const projects = [
      { id: "proj-1", name: "Card", composition: mockComposition, createdAt: 1, updatedAt: 1 },
    ];
    mockedStorage.listProjects.mockReturnValue(projects);
    const result = await listAllProjects();
    expect(mockedStorage.listProjects).toHaveBeenCalled();
    expect(result).toEqual(projects);
  });

  it("removeProject wraps storage.deleteProject", async () => {
    await removeProject("proj-1");
    expect(mockedStorage.deleteProject).toHaveBeenCalledWith("proj-1");
  });
});
