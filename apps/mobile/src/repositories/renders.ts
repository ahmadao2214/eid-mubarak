import {
  mockRequestRender,
  mockGetRenderStatus,
} from "@/lib/mock-api";
import type { RenderJob } from "@/types";

export async function requestRender(projectId: string): Promise<string> {
  return mockRequestRender(projectId);
}

export async function getRenderStatus(renderId: string): Promise<RenderJob> {
  return mockGetRenderStatus(renderId);
}
