import { convexTest } from "convex-test";
import { expect, test, describe, vi, beforeEach, afterEach } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

describe("gallery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("listCompleted returns empty array when no renders exist", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.gallery.listCompleted, {});
    expect(result).toEqual([]);
  });

  test("listCompleted returns only completed renders with outputS3Url", async () => {
    const t = convexTest(schema, modules);

    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });
    const renderId = await t.mutation(api.renders.request, { projectId });

    // Complete the render with an S3 URL
    await t.mutation(api.renders.updateProgress, {
      renderId,
      progress: 100,
      status: "completed",
      outputS3Url: "https://s3.example.com/renders/video1.mp4",
    });

    const result = await t.query(api.gallery.listCompleted, {});
    expect(result).toHaveLength(1);
    expect(result[0].outputS3Url).toBe(
      "https://s3.example.com/renders/video1.mp4",
    );
    expect(result[0]._id).toBe(renderId);
    expect(result[0].completedAt).toBeDefined();
  });

  test("listCompleted excludes pending/rendering/failed renders", async () => {
    const t = convexTest(schema, modules);

    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });

    // Create a pending render
    await t.mutation(api.renders.request, { projectId });

    // Create a rendering render
    const renderingId = await t.mutation(api.renders.request, { projectId });
    await t.mutation(api.renders.updateProgress, {
      renderId: renderingId,
      progress: 50,
      status: "rendering",
    });

    // Create a failed render
    const failedId = await t.mutation(api.renders.request, { projectId });
    await t.mutation(api.renders.updateProgress, {
      renderId: failedId,
      progress: 0,
      status: "failed",
      error: "Something went wrong",
    });

    const result = await t.query(api.gallery.listCompleted, {});
    expect(result).toEqual([]);
  });

  test("listCompleted sorts by completedAt ascending", async () => {
    const t = convexTest(schema, modules);

    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });

    // Create and complete first render
    const render1 = await t.mutation(api.renders.request, { projectId });
    vi.setSystemTime(new Date("2026-02-27T18:00:00Z"));
    await t.mutation(api.renders.updateProgress, {
      renderId: render1,
      progress: 100,
      status: "completed",
      outputS3Url: "https://s3.example.com/renders/first.mp4",
    });

    // Create and complete second render (later)
    const render2 = await t.mutation(api.renders.request, { projectId });
    vi.setSystemTime(new Date("2026-02-27T19:00:00Z"));
    await t.mutation(api.renders.updateProgress, {
      renderId: render2,
      progress: 100,
      status: "completed",
      outputS3Url: "https://s3.example.com/renders/second.mp4",
    });

    const result = await t.query(api.gallery.listCompleted, {});
    expect(result).toHaveLength(2);
    expect(result[0].outputS3Url).toContain("first.mp4");
    expect(result[1].outputS3Url).toContain("second.mp4");
    expect(result[0].completedAt).toBeLessThanOrEqual(result[1].completedAt);
  });

  test("listCompleted excludes completed renders without outputS3Url", async () => {
    const t = convexTest(schema, modules);

    const projectId = await t.mutation(api.projects.create, {
      name: "Test",
      templateId: "trucker",
      composition: {},
    });

    // Create a render and mark completed WITHOUT outputS3Url
    const renderId = await t.mutation(api.renders.request, { projectId });
    await t.mutation(api.renders.updateProgress, {
      renderId,
      progress: 100,
      status: "completed",
    });

    const result = await t.query(api.gallery.listCompleted, {});
    expect(result).toEqual([]);
  });
});
