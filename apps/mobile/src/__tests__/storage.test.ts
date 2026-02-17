import {
  saveProject,
  getProject,
  updateProject,
  listProjects,
  deleteProject,
  clearAllProjects,
} from "@/lib/storage";
import { getPresetById } from "@/lib/presets";

const sampleComposition = getPresetById("zohran-classic")!.defaultProps;

describe("MMKV storage", () => {
  beforeEach(() => {
    clearAllProjects();
  });

  it("saves and retrieves a project", () => {
    const id = saveProject("Test Card", sampleComposition);
    const project = getProject(id);
    expect(project).not.toBeNull();
    expect(project!.name).toBe("Test Card");
    expect(project!.composition.width).toBe(1080);
  });

  it("returns null for non-existent project", () => {
    expect(getProject("nonexistent")).toBeNull();
  });

  it("updates a project composition", () => {
    const id = saveProject("My Card", sampleComposition);
    const updated = { ...sampleComposition, width: 720 };
    updateProject(id, updated);
    const project = getProject(id);
    expect(project!.composition.width).toBe(720);
    expect(project!.updatedAt).toBeGreaterThanOrEqual(project!.createdAt);
  });

  it("lists projects sorted by updatedAt descending", () => {
    const id1 = saveProject("First", sampleComposition);
    const id2 = saveProject("Second", sampleComposition);
    // Update first project to make it more recent
    updateProject(id1, sampleComposition);
    const projects = listProjects();
    expect(projects).toHaveLength(2);
    expect(projects[0].id).toBe(id1); // most recently updated
    expect(projects[1].id).toBe(id2);
  });

  it("deletes a project", () => {
    const id = saveProject("To Delete", sampleComposition);
    expect(getProject(id)).not.toBeNull();
    deleteProject(id);
    expect(getProject(id)).toBeNull();
  });

  it("clearAllProjects removes everything", () => {
    saveProject("A", sampleComposition);
    saveProject("B", sampleComposition);
    expect(listProjects()).toHaveLength(2);
    clearAllProjects();
    expect(listProjects()).toHaveLength(0);
  });

  it("composition round-trips through storage correctly", () => {
    const id = saveProject("Round Trip", sampleComposition);
    const project = getProject(id);
    expect(project!.composition).toEqual(sampleComposition);
  });
});
