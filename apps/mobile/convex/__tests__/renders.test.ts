import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

describe("renders", () => {
  test("request creates a pending render", async () => {
    const t = convexTest(schema, modules);
    // Create a project first
    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });
    const renderId = await t.mutation(api.renders.request, { projectId });
    expect(renderId).toBeDefined();

    const render = await t.query(api.renders.getStatus, {
      renderId,
    });
    expect(render).not.toBeNull();
    expect(render!.status).toBe("pending");
    expect(render!.progress).toBe(0);
    expect(render!.projectId).toBe(projectId);
  });

  test("getStatus retrieves a render", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });
    const renderId = await t.mutation(api.renders.request, { projectId });
    const render = await t.query(api.renders.getStatus, { renderId });
    expect(render).not.toBeNull();
    expect(render!.status).toBe("pending");
  });

  test("updateProgress changes status and progress", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });
    const renderId = await t.mutation(api.renders.request, { projectId });

    await t.mutation(api.renders.updateProgress, {
      renderId,
      progress: 50,
      status: "rendering",
    });

    const render = await t.query(api.renders.getStatus, { renderId });
    expect(render!.status).toBe("rendering");
    expect(render!.progress).toBe(50);

    // Complete the render
    await t.mutation(api.renders.updateProgress, {
      renderId,
      progress: 100,
      status: "completed",
      outputS3Url: "https://s3.example.com/renders/output.mp4",
    });

    const completed = await t.query(api.renders.getStatus, { renderId });
    expect(completed!.status).toBe("completed");
    expect(completed!.progress).toBe(100);
    expect(completed!.outputS3Url).toBe(
      "https://s3.example.com/renders/output.mp4",
    );
  });
});
