import { renderHook, act } from "@testing-library/react-native";
import { useUpload } from "../hooks/useUpload";

const mockGetUploadUrl = jest.fn();
const mockConfirmUpload = jest.fn();
const mockUploadAsync = jest.fn();

jest.mock("@/lib/compressImageForUpload", () => ({
  compressImageForUpload: jest.fn().mockResolvedValue(null),
}));

jest.mock("expo-file-system/legacy", () => ({
  readAsStringAsync: jest.fn().mockResolvedValue(""),
  EncodingType: { Base64: "base64" },
  FileSystemUploadType: { BINARY_CONTENT: 0 },
  uploadAsync: (...args: unknown[]) => mockUploadAsync(...args),
}));

jest.mock("convex/react", () => {
  let useActionCallCount = 0;
  return {
    useAction: () => {
      useActionCallCount += 1;
      return useActionCallCount === 1 ? mockGetUploadUrl : mockConfirmUpload;
    },
    useMutation: () => () => {},
    __resetUseActionCallCount: () => {
      useActionCallCount = 0;
    },
  };
});

describe("useUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require("convex/react").__resetUseActionCallCount?.();
    mockGetUploadUrl.mockResolvedValue({
      url: "https://s3.example.com/presigned-upload",
      s3Key: "user-photos/test/123.png",
      publicUrl: "https://my-bucket.s3.us-east-1.amazonaws.com/user-photos/test/123.png",
    });
    mockConfirmUpload.mockResolvedValue(undefined);
    // On native (iOS/Android in Jest) we use FileSystem.uploadAsync for file:// URIs
    mockUploadAsync.mockResolvedValue({ status: 200 });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
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
        s3Url: "https://my-bucket.s3.us-east-1.amazonaws.com/user-photos/test/123.png",
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
      mockUploadAsync.mockResolvedValueOnce({ status: 403 });
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
