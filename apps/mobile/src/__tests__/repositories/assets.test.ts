import { listCelebrityHeads, listAssets, listSounds } from "@/repositories/assets";

jest.mock("@/lib/convex", () => ({
  convexClient: {
    query: jest.fn(),
  },
  api: {
    assets: {
      listByType: "assets:listByType",
      listCelebrityHeads: "assets:listCelebrityHeads",
    },
    sounds: {
      listByCategory: "sounds:listByCategory",
      listAll: "sounds:listAll",
    },
  },
}));

jest.mock("@/lib/convex-mappers", () => ({
  mapAsset: jest.fn((doc: any) => ({
    id: doc._id,
    type: doc.type === "background" ? "background-video" : doc.type,
    name: doc.name,
    url: doc.s3Url,
  })),
  mapCelebrityHead: jest.fn((doc: any) => ({
    id: doc._id,
    name: doc.name,
    imageUrl: doc.s3Url,
    thumbnail: doc.s3Url,
  })),
  mapSound: jest.fn((doc: any) => ({
    id: doc._id,
    name: doc.name,
    category: doc.category,
    url: doc.s3Url,
    durationSeconds: doc.duration,
  })),
}));

const { convexClient } = require("@/lib/convex");

describe("assets repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("listCelebrityHeads calls convexClient.query and maps results", async () => {
    const docs = [
      { _id: "h1", name: "Drake", type: "celebrity_head", s3Key: "heads/drake.png", s3Url: "url", tags: [] },
    ];
    convexClient.query.mockResolvedValue(docs);
    const result = await listCelebrityHeads();
    expect(convexClient.query).toHaveBeenCalledWith("assets:listCelebrityHeads", {});
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Drake");
  });

  it("listAssets forwards type param", async () => {
    const docs = [
      { _id: "bg-1", name: "Mountain", type: "background", s3Key: "bg/m.mp4", s3Url: "url", tags: [] },
    ];
    convexClient.query.mockResolvedValue(docs);
    const result = await listAssets("background");
    expect(convexClient.query).toHaveBeenCalledWith("assets:listByType", { type: "background" });
    expect(result).toHaveLength(1);
  });

  it("listAssets without type returns all asset types", async () => {
    const bg = { _id: "bg-1", name: "Mountain", type: "background", s3Key: "bg/m.mp4", s3Url: "url", tags: [] };
    const lottie = { _id: "l-1", name: "Rose", type: "lottie", s3Key: "l/r.json", s3Url: "url", tags: [] };
    // 4 parallel queries for each asset type: background, lottie, celebrity_head, font
    convexClient.query
      .mockResolvedValueOnce([bg])       // backgrounds
      .mockResolvedValueOnce([lottie])   // lotties
      .mockResolvedValueOnce([])         // celebrity_heads
      .mockResolvedValueOnce([]);        // fonts
    const result = await listAssets();
    expect(convexClient.query).toHaveBeenCalledTimes(4);
    expect(result).toHaveLength(2);
  });

  it("listSounds forwards category param", async () => {
    const docs = [
      { _id: "s-1", name: "Nasheed", category: "nasheed", duration: 15, s3Key: "s/n.mp3", s3Url: "url", tags: [] },
    ];
    convexClient.query.mockResolvedValue(docs);
    const result = await listSounds("nasheed");
    expect(convexClient.query).toHaveBeenCalledWith("sounds:listByCategory", { category: "nasheed" });
    expect(result).toHaveLength(1);
  });

  it("listSounds without category returns all sounds", async () => {
    const docs = [
      { _id: "s-1", name: "A", category: "nasheed", duration: 15, s3Key: "s/a.mp3", s3Url: "url", tags: [] },
    ];
    convexClient.query.mockResolvedValue(docs);
    const result = await listSounds();
    expect(convexClient.query).toHaveBeenCalledWith("sounds:listAll", {});
    expect(result).toHaveLength(1);
  });
});
