import {
  mockCreateProject,
  mockGetProject,
  mockUpdateProject,
} from "@/lib/mock-api";
import {
  listProjects as storageListProjects,
  deleteProject as storageDeleteProject,
} from "@/lib/storage";
import type { CompositionProps, Project } from "@/types";

// Note: create/get/update route through mock-api (simulated network latency) while
// list/delete call storage directly. Both share the same in-memory store.
// When migrating to a real backend, unify all operations behind a single API client.

export async function createProject(
  name: string,
  composition: CompositionProps,
): Promise<string> {
  return mockCreateProject(name, composition);
}

export async function getProject(
  projectId: string,
): Promise<Project | null> {
  return mockGetProject(projectId);
}

export async function updateProject(
  projectId: string,
  composition: CompositionProps,
): Promise<void> {
  return mockUpdateProject(projectId, composition);
}

export async function listAllProjects(): Promise<Project[]> {
  return storageListProjects();
}

export async function removeProject(projectId: string): Promise<void> {
  return storageDeleteProject(projectId);
}
