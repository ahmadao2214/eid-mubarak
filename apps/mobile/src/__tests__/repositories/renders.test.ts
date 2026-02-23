import { requestRender, getRenderStatus } from "@/repositories/renders";

jest.mock("@/lib/convex", () => ({
  convexClient: {
    query: jest.fn(),
    mutation: jest.fn(),
  },
  api: {
    renders: {
      request: "renders:request",
      getStatus: "renders:getStatus",
    },
  },
}));

jest.mock("@/lib/convex-mappers", () => ({
  mapRender: jest.fn((doc: any) => ({
    id: doc._id,
    projectId: doc.projectId,
    status: doc.status === "pending" ? "queued" : doc.status,
    progress: doc.progress,
    outputUrl: doc.outputS3Url,
    error: doc.error,
  })),
}));

const { convexClient } = require("@/lib/convex");

describe("renders repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requestRender calls convexClient.mutation", async () => {
    convexClient.mutation.mockResolvedValue("render-1");
    const result = await requestRender("proj-1");
    expect(convexClient.mutation).toHaveBeenCalledWith("renders:request", { projectId: "proj-1" });
    expect(result).toBe("render-1");
  });

  it("getRenderStatus calls convexClient.query and maps result", async () => {
    const doc = {
      _id: "render-1",
      _creationTime: 1000,
      projectId: "proj-1",
      status: "completed",
      progress: 100,
      outputS3Url: "https://mock.com/video.mp4",
      createdAt: 1000,
      completedAt: 2000,
    };
    convexClient.query.mockResolvedValue(doc);
    const result = await getRenderStatus("render-1");
    expect(convexClient.query).toHaveBeenCalledWith("renders:getStatus", { renderId: "render-1" });
    expect(result.id).toBe("render-1");
    expect(result.status).toBe("completed");
  });
});
