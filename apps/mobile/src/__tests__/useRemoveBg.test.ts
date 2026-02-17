import { removeBackground } from "../hooks/useRemoveBg";
import * as uploads from "../repositories/uploads";

jest.mock("../repositories/uploads");

const mockedUploads = uploads as jest.Mocked<typeof uploads>;

describe("useRemoveBg", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("removeBackground", () => {
    it("returns the processed image URL on success", async () => {
      mockedUploads.removeBackground.mockResolvedValue({
        resultS3Url:
          "https://s3.example.com/processed/transparent.png",
      });

      const result = await removeBackground("file:///photo.jpg");

      expect(mockedUploads.removeBackground).toHaveBeenCalledWith(
        "file:///photo.jpg"
      );
      expect(result).toEqual({
        transparentUrl:
          "https://s3.example.com/processed/transparent.png",
        success: true,
      });
    });

    it("returns failure when remove.bg fails", async () => {
      mockedUploads.removeBackground.mockRejectedValue(
        new Error("API rate limit exceeded")
      );

      const result = await removeBackground("file:///photo.jpg");

      expect(result).toEqual({
        transparentUrl: null,
        success: false,
        error: "API rate limit exceeded",
      });
    });
  });
});
