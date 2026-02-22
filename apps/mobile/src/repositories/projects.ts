import { convexClient, api } from "@/lib/convex";
import { mapProject } from "@/lib/convex-mappers";
import type { CompositionProps, Project } from "@/types";

export async function createProject(
  name: string,
  composition: CompositionProps,
): Promise<string> {
  return await convexClient.mutation(api.projects.create, {
    name,
    templateId: "default",
    composition,
  });
}

export async function getProject(
  projectId: string,
): Promise<Project | null> {
  const doc = await convexClient.query(api.projects.get, {
    id: projectId as any,
  });
  if (!doc) return null;
  return mapProject(doc);
}

export async function updateProject(
  projectId: string,
  composition: CompositionProps,
): Promise<void> {
  await convexClient.mutation(api.projects.update, {
    id: projectId as any,
    composition,
  });
}

export async function listAllProjects(): Promise<Project[]> {
  const docs = await convexClient.query(api.projects.list, {});
  return docs.map(mapProject);
}

export async function removeProject(projectId: string): Promise<void> {
  await convexClient.mutation(api.projects.remove, {
    id: projectId as any,
  });
}
