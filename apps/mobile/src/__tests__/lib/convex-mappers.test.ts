import {
  mapAssetType,
  mapRenderStatus,
  mapProject,
  mapAsset,
  mapCelebrityHead,
  mapSound,
  mapRender,
} from "@/lib/convex-mappers";

// Mock the Convex dataModel types - we test pure mapping logic
const makeDoc = (overrides: Record<string, unknown>) =>
  ({
    _id: "test-id",
    _creationTime: 1000,
    ...overrides,
  }) as any;

describe("mapAssetType", () => {
  it("maps background with video extension to background-video", () => {
    expect(mapAssetType("background", "https://s3.com/bg.mp4")).toBe(
      "background-video",
    );
    expect(mapAssetType("background", "https://s3.com/bg.mov")).toBe(
      "background-video",
    );
    expect(mapAssetType("background", "https://s3.com/bg.webm")).toBe(
      "background-video",
    );
  });

  it("maps background with image extension to background-image", () => {
    expect(mapAssetType("background", "https://s3.com/bg.jpg")).toBe(
      "background-image",
    );
    expect(mapAssetType("background", "https://s3.com/bg.png")).toBe(
      "background-image",
    );
  });

  it("maps lottie to lottie", () => {
    expect(mapAssetType("lottie", "https://s3.com/anim.json")).toBe("lottie");
  });

  it("maps celebrity_head to celebrity-head", () => {
    expect(mapAssetType("celebrity_head", "https://s3.com/head.png")).toBe(
      "celebrity-head",
    );
  });

  it("maps font to font", () => {
    expect(mapAssetType("font", "https://s3.com/font.ttf")).toBe("font");
  });
});

describe("mapRenderStatus", () => {
  it("maps pending to queued", () => {
    expect(mapRenderStatus("pending")).toBe("queued");
  });

  it("passes through other statuses", () => {
    expect(mapRenderStatus("rendering")).toBe("rendering");
    expect(mapRenderStatus("completed")).toBe("completed");
    expect(mapRenderStatus("failed")).toBe("failed");
  });
});

describe("mapProject", () => {
  it("maps _id to id and preserves fields", () => {
    const doc = makeDoc({
      name: "My Card",
      templateId: "trucker",
      composition: { width: 1080 },
      createdAt: 1000,
      updatedAt: 2000,
    });
    const result = mapProject(doc);
    expect(result.id).toBe("test-id");
    expect(result.name).toBe("My Card");
    expect(result.composition).toEqual({ width: 1080 });
    expect(result.createdAt).toBe(1000);
    expect(result.updatedAt).toBe(2000);
  });
});

describe("mapAsset", () => {
  it("maps _id to id and s3Url to url", () => {
    const doc = makeDoc({
      name: "Mountain Road",
      type: "background",
      s3Key: "bg/mountain.mp4",
      s3Url: "https://s3.com/bg/mountain.mp4",
      tags: ["psychedelic"],
    });
    const result = mapAsset(doc);
    expect(result.id).toBe("test-id");
    expect(result.name).toBe("Mountain Road");
    expect(result.type).toBe("background-video");
    expect(result.url).toBe("https://s3.com/bg/mountain.mp4");
  });
});

describe("mapCelebrityHead", () => {
  it("maps asset doc to CelebrityHead", () => {
    const doc = makeDoc({
      name: "Drake",
      type: "celebrity_head",
      s3Key: "heads/drake.png",
      s3Url: "https://s3.com/heads/drake.png",
      tags: [],
    });
    const result = mapCelebrityHead(doc);
    expect(result.id).toBe("test-id");
    expect(result.name).toBe("Drake");
    expect(result.imageUrl).toBe("https://s3.com/heads/drake.png");
    expect(result.thumbnail).toBe("https://s3.com/heads/drake.png");
  });
});

describe("mapSound", () => {
  it("maps duration to durationSeconds and s3Url to url", () => {
    const doc = makeDoc({
      name: "Default Nasheed",
      category: "nasheed",
      duration: 15,
      s3Key: "sounds/nasheed.mp3",
      s3Url: "https://s3.com/sounds/nasheed.mp3",
      tags: ["eid"],
    });
    const result = mapSound(doc);
    expect(result.id).toBe("test-id");
    expect(result.name).toBe("Default Nasheed");
    expect(result.category).toBe("nasheed");
    expect(result.url).toBe("https://s3.com/sounds/nasheed.mp3");
    expect(result.durationSeconds).toBe(15);
  });
});

describe("mapRender", () => {
  it("maps pending status to queued and outputS3Url to outputUrl", () => {
    const doc = makeDoc({
      projectId: "proj-123",
      status: "pending",
      progress: 0,
      createdAt: 1000,
    });
    const result = mapRender(doc);
    expect(result.id).toBe("test-id");
    expect(result.projectId).toBe("proj-123");
    expect(result.status).toBe("queued");
    expect(result.progress).toBe(0);
    expect(result.outputUrl).toBeUndefined();
  });

  it("maps completed render with outputS3Url", () => {
    const doc = makeDoc({
      projectId: "proj-123",
      status: "completed",
      progress: 100,
      outputS3Url: "https://s3.com/renders/output.mp4",
      createdAt: 1000,
      completedAt: 2000,
    });
    const result = mapRender(doc);
    expect(result.status).toBe("completed");
    expect(result.progress).toBe(100);
    expect(result.outputUrl).toBe("https://s3.com/renders/output.mp4");
  });
});
