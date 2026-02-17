import { removeBackground } from "../hooks/useRemoveBg";
import * as mockApi from "../lib/mock-api";

jest.mock("../lib/mock-api");

const mockedApi = mockApi as jest.Mocked<typeof mockApi>;

describe("useRemoveBg", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("removeBackground", () => {
    it("returns the processed image URL on success", async () => {
      mockedApi.mockRemoveBackground.mockResolvedValue({
        resultS3Url:
          "https://s3.example.com/processed/transparent.png",
      });

      const result = await removeBackground("file:///photo.jpg");

      expect(mockedApi.mockRemoveBackground).toHaveBeenCalledWith(
        "file:///photo.jpg"
      );
      expect(result).toEqual({
        transparentUrl:
          "https://s3.example.com/processed/transparent.png",
        success: true,
      });
    });

    it("returns failure when remove.bg fails", async () => {
      mockedApi.mockRemoveBackground.mockRejectedValue(
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
