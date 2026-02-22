import { convexClient, api } from "@/lib/convex";
import { mapRender } from "@/lib/convex-mappers";
import type { RenderJob } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

export async function requestRender(projectId: string): Promise<string> {
  return await convexClient.mutation(api.renders.request, {
    projectId: projectId as Id<"projects">,
  });
}

export async function getRenderStatus(renderId: string): Promise<RenderJob> {
  const doc = await convexClient.query(api.renders.getStatus, {
    renderId: renderId as Id<"renders">,
  });
  if (!doc) throw new Error(`Render ${renderId} not found`);
  return mapRender(doc);
}
