import { downloadAndShare, saveToGallery } from "@/hooks/useShare";

// Mock expo modules
const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
const mockShareAsync = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-sharing", () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

const mockDownloadFileAsync = jest
  .fn()
  .mockResolvedValue({ uri: "file:///tmp/video.mp4" });
jest.mock("expo-file-system/next", () => ({
  Paths: { cache: "/tmp" },
  File: {
    downloadFileAsync: (...args: unknown[]) => mockDownloadFileAsync(...args),
  },
}));

const mockRequestPermissionsAsync = jest
  .fn()
  .mockResolvedValue({ status: "granted" });
const mockSaveToLibraryAsync = jest.fn().mockResolvedValue(undefined);
jest.mock("expo-media-library", () => ({
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
  saveToLibraryAsync: (...args: unknown[]) => mockSaveToLibraryAsync(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAvailableAsync.mockResolvedValue(true);
  mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });
});

describe("useShare - mock URL guard", () => {
  const mockUrl = "https://mock-s3.example.com/videos/output.mp4";
  const realUrl = "https://real-s3.amazonaws.com/videos/output.mp4";

  it("downloadAndShare rejects mock URLs with clear message", async () => {
    const result = await downloadAndShare(mockUrl);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Video rendering backend is not connected yet.",
    );
    expect(mockDownloadFileAsync).not.toHaveBeenCalled();
  });

  it("saveToGallery rejects mock URLs with clear message", async () => {
    const result = await saveToGallery(mockUrl);
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Video rendering backend is not connected yet.",
    );
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("downloadAndShare proceeds for real URLs", async () => {
    await downloadAndShare(realUrl);
    expect(mockDownloadFileAsync).toHaveBeenCalledWith(realUrl, "/tmp");
  });

  it("saveToGallery proceeds for real URLs", async () => {
    await saveToGallery(realUrl);
    expect(mockDownloadFileAsync).toHaveBeenCalledWith(realUrl, "/tmp");
  });
});

describe("useShare - permission fix", () => {
  it("saveToGallery requests write-only permission (true arg)", async () => {
    await saveToGallery("https://real-s3.amazonaws.com/videos/output.mp4");
    expect(mockRequestPermissionsAsync).toHaveBeenCalledWith(true);
  });
});
