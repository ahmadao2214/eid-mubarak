import { convexClient, api } from "@/lib/convex";
import { mapRender } from "@/lib/convex-mappers";
import type { RenderJob } from "@/types";

export async function requestRender(projectId: string): Promise<string> {
  return await convexClient.mutation(api.renders.request, {
    projectId: projectId as any,
  });
}

export async function getRenderStatus(renderId: string): Promise<RenderJob> {
  const doc = await convexClient.query(api.renders.getStatus, {
    renderId: renderId as any,
  });
  return mapRender(doc!);
}
