import { getUploadUrl, uploadToS3, removeBackground } from "@/repositories/uploads";

jest.mock("@/lib/convex", () => ({
  convexClient: {
    action: jest.fn(),
  },
  api: {
    uploads: {
      getPresignedUrl: "uploads:getPresignedUrl",
      removeBackground: "uploads:removeBackground",
    },
  },
}));

const { convexClient } = require("@/lib/convex");

// Mock global fetch for uploadToS3
global.fetch = jest.fn() as jest.Mock;

describe("uploads repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getUploadUrl calls convexClient.action", async () => {
    convexClient.action.mockResolvedValue({
      url: "https://presigned.url",
      s3Key: "user-photos/123.png",
    });
    const result = await getUploadUrl();
    expect(convexClient.action).toHaveBeenCalledWith("uploads:getPresignedUrl", {
      type: "user-photo",
      contentType: "image/png",
    });
    expect(result).toEqual({ url: "https://presigned.url" });
  });

  it("uploadToS3 does a PUT request to the presigned URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const blob = new Blob(["test"]);
    const result = await uploadToS3("https://presigned.url", blob);
    expect(global.fetch).toHaveBeenCalledWith("https://presigned.url", {
      method: "PUT",
      body: blob,
    });
    expect(typeof result).toBe("string");
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
