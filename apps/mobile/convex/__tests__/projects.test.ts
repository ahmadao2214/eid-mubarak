import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

describe("projects", () => {
  test("create returns an ID", async () => {
    const t = convexTest(schema, modules);
    const id = await t.mutation(api.projects.create, {
      name: "My Card",
      templateId: "trucker",
      composition: { width: 1080, height: 1920 },
    });
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  test("get retrieves a created project", async () => {
    const t = convexTest(schema, modules);
    const id = await t.mutation(api.projects.create, {
      name: "My Card",
      templateId: "trucker",
      composition: { width: 1080, height: 1920 },
    });
    const project = await t.query(api.projects.get, { id });
    expect(project).not.toBeNull();
    expect(project!.name).toBe("My Card");
    expect(project!.templateId).toBe("trucker");
    expect(project!.composition).toEqual({ width: 1080, height: 1920 });
  });

  test("list returns projects sorted by updatedAt desc", async () => {
    const t = convexTest(schema, modules);
    const id1 = await t.mutation(api.projects.create, {
      name: "First",
      templateId: "a",
      composition: { v: 1 },
    });
    const id2 = await t.mutation(api.projects.create, {
      name: "Second",
      templateId: "b",
      composition: { v: 2 },
    });
    // Update first project so it has a newer updatedAt
    await t.mutation(api.projects.update, {
      id: id1,
      composition: { v: 1, updated: true },
    });
    const projects = await t.query(api.projects.list, {});
    expect(projects).toHaveLength(2);
    // First project was updated last, so it should be first
    expect(projects[0]._id).toBe(id1);
    expect(projects[1]._id).toBe(id2);
  });

  test("update modifies composition", async () => {
    const t = convexTest(schema, modules);
    const id = await t.mutation(api.projects.create, {
      name: "My Card",
      templateId: "trucker",
      composition: { old: true },
    });
    await t.mutation(api.projects.update, {
      id,
      composition: { new: true },
    });
    const project = await t.query(api.projects.get, { id });
    expect(project!.composition).toEqual({ new: true });
  });

  test("remove deletes a project", async () => {
    const t = convexTest(schema, modules);
    const id = await t.mutation(api.projects.create, {
      name: "My Card",
      templateId: "trucker",
      composition: {},
    });
    await t.mutation(api.projects.remove, { id });
    const project = await t.query(api.projects.get, { id });
    expect(project).toBeNull();
  });
});
