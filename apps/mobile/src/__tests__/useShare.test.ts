import { downloadAndShare, saveToGallery } from "../hooks/useShare";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

const mockDownloadFileAsync = jest.fn();
const mockFileUri = "file:///tmp/cache/eid-card-123.mp4";

jest.mock("expo-file-system", () => ({
  Paths: { cache: { uri: "file:///tmp/cache/" } },
  File: {
    downloadFileAsync: (...args: any[]) => mockDownloadFileAsync(...args),
  },
}));

jest.mock("expo-sharing");
jest.mock("expo-media-library");

const mockedSharing = Sharing as jest.Mocked<typeof Sharing>;
const mockedMedia = MediaLibrary as jest.Mocked<typeof MediaLibrary>;

describe("useShare", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDownloadFileAsync.mockResolvedValue({ uri: mockFileUri });
  });

  describe("downloadAndShare", () => {
    it("checks Sharing.isAvailableAsync", async () => {
      mockedSharing.isAvailableAsync.mockResolvedValue(true);
      await downloadAndShare("https://example.com/video.mp4");
      expect(mockedSharing.isAvailableAsync).toHaveBeenCalled();
    });

    it("downloads file and calls shareAsync", async () => {
      mockedSharing.isAvailableAsync.mockResolvedValue(true);
      await downloadAndShare("https://example.com/video.mp4");
      expect(mockDownloadFileAsync).toHaveBeenCalledWith(
        "https://example.com/video.mp4",
        expect.anything(),
      );
      expect(mockedSharing.shareAsync).toHaveBeenCalledWith(
        mockFileUri,
        expect.objectContaining({ mimeType: "video/mp4" }),
      );
    });

    it("returns error when sharing unavailable", async () => {
      mockedSharing.isAvailableAsync.mockResolvedValue(false);
      const result = await downloadAndShare("https://example.com/video.mp4");
      expect(result.success).toBe(false);
      expect(result.error).toContain("not available");
    });

    it("returns error when download fails", async () => {
      mockedSharing.isAvailableAsync.mockResolvedValue(true);
      mockDownloadFileAsync.mockRejectedValue(new Error("Network error"));
      const result = await downloadAndShare("https://example.com/video.mp4");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("saveToGallery", () => {
    it("requests MediaLibrary permissions", async () => {
      mockedMedia.requestPermissionsAsync.mockResolvedValue({
        status: "granted" as MediaLibrary.PermissionStatus,
        granted: true,
        canAskAgain: true,
        expires: "never",
      });
      mockedMedia.saveToLibraryAsync.mockResolvedValue(undefined as any);
      await saveToGallery("https://example.com/video.mp4");
      expect(mockedMedia.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("calls MediaLibrary.saveToLibraryAsync on success", async () => {
      mockedMedia.requestPermissionsAsync.mockResolvedValue({
        status: "granted" as MediaLibrary.PermissionStatus,
        granted: true,
        canAskAgain: true,
        expires: "never",
      });
      mockedMedia.saveToLibraryAsync.mockResolvedValue(undefined as any);
      const result = await saveToGallery("https://example.com/video.mp4");
      expect(mockedMedia.saveToLibraryAsync).toHaveBeenCalledWith(mockFileUri);
      expect(result.success).toBe(true);
    });

    it("returns error when permission denied", async () => {
      mockedMedia.requestPermissionsAsync.mockResolvedValue({
        status: "denied" as MediaLibrary.PermissionStatus,
        granted: false,
        canAskAgain: true,
        expires: "never",
      });
      const result = await saveToGallery("https://example.com/video.mp4");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission denied");
    });
  });
});
