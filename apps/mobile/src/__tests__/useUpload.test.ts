import { renderHook, act } from "@testing-library/react-native";
import { useUpload } from "../hooks/useUpload";

const mockGetUploadUrl = jest.fn();
const mockConfirmUpload = jest.fn();

jest.mock("convex/react", () => ({
  useAction: () => mockGetUploadUrl,
  useMutation: () => mockConfirmUpload,
}));

describe("useUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUploadUrl.mockResolvedValue({
      url: "https://s3.example.com/presigned-upload",
      s3Key: "user-photos/test/123.png",
    });
    mockConfirmUpload.mockResolvedValue(undefined);
    global.fetch = jest.fn();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob()) })
      .mockResolvedValueOnce({ ok: true });
  });

  describe("uploadPhoto", () => {
    it("gets a presigned URL and uploads the photo", async () => {
      const { result } = renderHook(() => useUpload());

      let uploadResult: { s3Key: string | null; success: boolean };
      await act(async () => {
        uploadResult = await result.current.uploadPhoto("file:///my-photo.jpg");
      });

      expect(mockGetUploadUrl).toHaveBeenCalled();
      expect(mockConfirmUpload).toHaveBeenCalledWith({
        s3Key: "user-photos/test/123.png",
        type: "user-photo",
      });
      expect(uploadResult!).toEqual({
        s3Key: "user-photos/test/123.png",
        success: true,
      });
    });

    it("returns failure when presigned URL fetch fails", async () => {
      mockGetUploadUrl.mockRejectedValueOnce(new Error("Network error"));
      const { result } = renderHook(() => useUpload());

      let uploadResult: { s3Key: string | null; success: boolean; error?: string };
      await act(async () => {
        uploadResult = await result.current.uploadPhoto("file:///my-photo.jpg");
      });

      expect(uploadResult!).toEqual({
        s3Key: null,
        success: false,
        error: "Network error",
      });
    });

    it("returns failure when upload fails", async () => {
      (global.fetch as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob()) })
        .mockResolvedValueOnce({ ok: false, status: 403 });
      const { result } = renderHook(() => useUpload());

      let uploadResult: { s3Key: string | null; success: boolean; error?: string };
      await act(async () => {
        uploadResult = await result.current.uploadPhoto("file:///my-photo.jpg");
      });

      expect(uploadResult!).toEqual({
        s3Key: null,
        success: false,
        error: "Upload failed: 403",
      });
    });
  });
});
