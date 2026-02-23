import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.*s");

describe("assets", () => {
  test("listByType filters correctly", async () => {
    const t = convexTest(schema, modules);
    // Seed test data
    await t.run(async (ctx) => {
      await ctx.db.insert("assets", {
        name: "Mountain Road",
        type: "background",
        s3Key: "backgrounds/mountain.mp4",
        s3Url: "https://s3.example.com/backgrounds/mountain.mp4",
        tags: ["psychedelic"],
      });
      await ctx.db.insert("assets", {
        name: "Rose Heart",
        type: "lottie",
        s3Key: "lottie/rose-heart.json",
        s3Url: "https://s3.example.com/lottie/rose-heart.json",
        tags: ["flower"],
      });
      await ctx.db.insert("assets", {
        name: "Drake",
        type: "celebrity_head",
        s3Key: "heads/drake.png",
        s3Url: "https://s3.example.com/heads/drake.png",
        tags: ["rapper"],
      });
    });

    const backgrounds = await t.query(api.assets.listByType, {
      type: "background",
    });
    expect(backgrounds).toHaveLength(1);
    expect(backgrounds[0].name).toBe("Mountain Road");

    const lotties = await t.query(api.assets.listByType, { type: "lottie" });
    expect(lotties).toHaveLength(1);
    expect(lotties[0].name).toBe("Rose Heart");
  });

  test("listCelebrityHeads returns only celebrity_head type", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("assets", {
        name: "Drake",
        type: "celebrity_head",
        s3Key: "heads/drake.png",
        s3Url: "https://s3.example.com/heads/drake.png",
        tags: ["rapper"],
      });
      await ctx.db.insert("assets", {
        name: "SRK",
        type: "celebrity_head",
        s3Key: "heads/srk.png",
        s3Url: "https://s3.example.com/heads/srk.png",
        tags: ["bollywood"],
      });
      await ctx.db.insert("assets", {
        name: "Mountain",
        type: "background",
        s3Key: "backgrounds/mountain.mp4",
        s3Url: "https://s3.example.com/backgrounds/mountain.mp4",
        tags: [],
      });
    });

    const heads = await t.query(api.assets.listCelebrityHeads, {});
    expect(heads).toHaveLength(2);
    expect(heads.every((h: any) => h.type === "celebrity_head")).toBe(true);
  });
});
