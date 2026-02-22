import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

describe("sounds", () => {
  test("listByCategory filters correctly", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("sounds", {
        name: "Default Nasheed",
        category: "nasheed",
        duration: 15,
        s3Key: "sounds/default-nasheed.mp3",
        s3Url: "https://s3.example.com/sounds/default-nasheed.mp3",
        tags: ["eid"],
      });
      await ctx.db.insert("sounds", {
        name: "Bollywood Hit",
        category: "bollywood",
        duration: 30,
        s3Key: "sounds/bollywood-hit.mp3",
        s3Url: "https://s3.example.com/sounds/bollywood-hit.mp3",
        tags: ["party"],
      });
    });

    const nasheeds = await t.query(api.sounds.listByCategory, {
      category: "nasheed",
    });
    expect(nasheeds).toHaveLength(1);
    expect(nasheeds[0].name).toBe("Default Nasheed");

    const bollywood = await t.query(api.sounds.listByCategory, {
      category: "bollywood",
    });
    expect(bollywood).toHaveLength(1);
    expect(bollywood[0].name).toBe("Bollywood Hit");
  });

  test("listAll returns all sounds", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("sounds", {
        name: "Nasheed A",
        category: "nasheed",
        duration: 15,
        s3Key: "sounds/a.mp3",
        s3Url: "https://s3.example.com/sounds/a.mp3",
        tags: [],
      });
      await ctx.db.insert("sounds", {
        name: "SFX B",
        category: "sfx",
        duration: 3,
        s3Key: "sounds/b.mp3",
        s3Url: "https://s3.example.com/sounds/b.mp3",
        tags: [],
      });
    });

    const all = await t.query(api.sounds.listAll, {});
    expect(all).toHaveLength(2);
  });
});
