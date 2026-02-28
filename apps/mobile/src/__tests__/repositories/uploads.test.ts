import { getUploadUrl, uploadToS3, removeBackground } from "@/repositories/uploads";

jest.mock("@/lib/convex", () => ({
  convexClient: {
    action: jest.fn(),
  },
  api: {
    storage: {
      getUploadUrl: "storage:getUploadUrl",
      getDownloadUrl: "storage:getDownloadUrl",
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
      headers: { "Content-Type": "image/png" },
    });
    expect(result).toBe("user-photos/123.png");
  });

  it("removeBackground calls removeBackground then getDownloadUrl and returns presigned URL", async () => {
    convexClient.action
      .mockResolvedValueOnce({ resultS3Key: "user-photos/rembg/xyz.png" })
      .mockResolvedValueOnce({ url: "https://transparent.png" });
    const result = await removeBackground("user-photos/abc.png");
    expect(convexClient.action).toHaveBeenNthCalledWith(1, "uploads:removeBackground", {
      s3Key: "user-photos/abc.png",
    });
    expect(convexClient.action).toHaveBeenNthCalledWith(2, "storage:getDownloadUrl", {
      s3Key: "user-photos/rembg/xyz.png",
    });
    expect(result).toEqual({ resultS3Url: "https://transparent.png" });
  });
});
