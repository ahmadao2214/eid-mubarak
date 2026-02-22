import { getUploadUrl, uploadToS3, removeBackground } from "@/repositories/uploads";

jest.mock("@/lib/convex", () => ({
  convexClient: {
    action: jest.fn(),
  },
  api: {
    storage: {
      getUploadUrl: "storage:getUploadUrl",
    },
    uploads: {
      removeBackground: "uploads:removeBackground",
    },
  },
}));

const { convexClient } = require("@/lib/convex");

// Mock global fetch for uploadToS3
global.fetch = jest.fn() as jest.Mock;

describe("uploads repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getUploadUrl calls storage.getUploadUrl action", async () => {
    convexClient.action.mockResolvedValue({
      url: "https://presigned.url",
      s3Key: "user-photos/123.png",
    });
    const result = await getUploadUrl();
    expect(convexClient.action).toHaveBeenCalledWith("storage:getUploadUrl", {
      contentType: "image/png",
    });
    expect(result).toEqual({ url: "https://presigned.url", s3Key: "user-photos/123.png" });
  });

  it("uploadToS3 does a PUT request and returns s3Key", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const blob = new Blob(["test"]);
    const result = await uploadToS3("https://presigned.url", blob, "user-photos/123.png");
    expect(global.fetch).toHaveBeenCalledWith("https://presigned.url", {
      method: "PUT",
      body: blob,
    });
    expect(result).toBe("user-photos/123.png");
  });

  it("removeBackground calls convexClient.action", async () => {
    convexClient.action.mockResolvedValue({
      resultS3Url: "https://transparent.png",
    });
    const result = await removeBackground("file:///photo.jpg");
    expect(convexClient.action).toHaveBeenCalledWith("uploads:removeBackground", {
      s3Key: "file:///photo.jpg",
    });
    expect(result).toEqual({ resultS3Url: "https://transparent.png" });
  });
});
