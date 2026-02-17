import { uploadPhoto } from "../hooks/useUpload";
import * as mockApi from "../lib/mock-api";

jest.mock("../lib/mock-api");

const mockedApi = mockApi as jest.Mocked<typeof mockApi>;

describe("useUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadPhoto", () => {
    it("gets a presigned URL and uploads the photo", async () => {
      mockedApi.mockGetUploadUrl.mockResolvedValue({
        url: "https://s3.example.com/presigned-upload",
      });
      mockedApi.mockUploadToS3.mockResolvedValue(
        "user-photos/test/123.png"
      );

      const result = await uploadPhoto("file:///my-photo.jpg");

      expect(mockedApi.mockGetUploadUrl).toHaveBeenCalled();
      expect(mockedApi.mockUploadToS3).toHaveBeenCalledWith(
        "https://s3.example.com/presigned-upload",
        expect.anything()
      );
      expect(result).toEqual({
        s3Key: "user-photos/test/123.png",
        success: true,
      });
    });

    it("returns failure when presigned URL fetch fails", async () => {
      mockedApi.mockGetUploadUrl.mockRejectedValue(
        new Error("Network error")
      );

      const result = await uploadPhoto("file:///my-photo.jpg");

      expect(result).toEqual({
        s3Key: null,
        success: false,
        error: "Network error",
      });
    });

    it("returns failure when upload fails", async () => {
      mockedApi.mockGetUploadUrl.mockResolvedValue({
        url: "https://s3.example.com/presigned",
      });
      mockedApi.mockUploadToS3.mockRejectedValue(
        new Error("Upload failed")
      );

      const result = await uploadPhoto("file:///my-photo.jpg");

      expect(result).toEqual({
        s3Key: null,
        success: false,
        error: "Upload failed",
      });
    });
  });
});
