import { uploadPhoto } from "../hooks/useUpload";
import * as uploads from "../repositories/uploads";

jest.mock("../repositories/uploads");

const mockedUploads = uploads as jest.Mocked<typeof uploads>;

describe("useUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadPhoto", () => {
    it("gets a presigned URL and uploads the photo", async () => {
      mockedUploads.getUploadUrl.mockResolvedValue({
        url: "https://s3.example.com/presigned-upload",
      });
      mockedUploads.uploadToS3.mockResolvedValue(
        "user-photos/test/123.png"
      );

      const result = await uploadPhoto("file:///my-photo.jpg");

      expect(mockedUploads.getUploadUrl).toHaveBeenCalled();
      expect(mockedUploads.uploadToS3).toHaveBeenCalledWith(
        "https://s3.example.com/presigned-upload",
        expect.anything()
      );
      expect(result).toEqual({
        s3Key: "user-photos/test/123.png",
        success: true,
      });
    });

    it("returns failure when presigned URL fetch fails", async () => {
      mockedUploads.getUploadUrl.mockRejectedValue(
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
      mockedUploads.getUploadUrl.mockResolvedValue({
        url: "https://s3.example.com/presigned",
      });
      mockedUploads.uploadToS3.mockRejectedValue(
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
