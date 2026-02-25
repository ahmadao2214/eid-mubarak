import { renderHook, waitFor } from "@testing-library/react-native";
import { useResolvedImageUrl } from "../hooks/useResolvedImageUrl";

const mockGetDownloadUrl = jest.fn();

jest.unmock("@/hooks/useResolvedImageUrl");
jest.mock("convex/react", () => ({
  useAction: () => mockGetDownloadUrl,
}));

describe("useResolvedImageUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDownloadUrl.mockResolvedValue({
      url: "https://presigned.example.com/user-photos/abc.png",
    });
  });

  it("returns null when uri is null", () => {
    const { result } = renderHook(() => useResolvedImageUrl(null));
    expect(result.current).toBeNull();
    expect(mockGetDownloadUrl).not.toHaveBeenCalled();
  });

  it("returns empty string when uri is empty string", () => {
    const { result } = renderHook(() => useResolvedImageUrl(""));
    expect(result.current).toBe("");
    expect(mockGetDownloadUrl).not.toHaveBeenCalled();
  });

  it("returns uri unchanged when not an S3 URL", () => {
    const url = "https://example.com/head.png";
    const { result } = renderHook(() => useResolvedImageUrl(url));
    expect(result.current).toBe(url);
    expect(mockGetDownloadUrl).not.toHaveBeenCalled();
  });

  it("returns uri unchanged for blob URLs (non-S3)", () => {
    const url = "blob:https://example.com/abc-123";
    const { result } = renderHook(() => useResolvedImageUrl(url));
    expect(result.current).toBe(url);
    expect(mockGetDownloadUrl).not.toHaveBeenCalled();
  });

  it("calls getDownloadUrl and returns presigned URL when uri is S3 user-photos URL", async () => {
    const s3Url =
      "https://my-bucket.s3.us-east-1.amazonaws.com/user-photos/xyz.png";
    const { result } = renderHook(() => useResolvedImageUrl(s3Url));

    await waitFor(() => {
      expect(mockGetDownloadUrl).toHaveBeenCalledWith({
        s3Key: "user-photos/xyz.png",
      });
    });

    await waitFor(() => {
      expect(result.current).toBe("https://presigned.example.com/user-photos/abc.png");
    });
  });

  it("calls getDownloadUrl for rendered-videos S3 URL", async () => {
    const s3Url =
      "https://bucket.s3.eu-west-1.amazonaws.com/rendered-videos/out.mp4";
    const { result } = renderHook(() => useResolvedImageUrl(s3Url));

    await waitFor(() => {
      expect(mockGetDownloadUrl).toHaveBeenCalledWith({
        s3Key: "rendered-videos/out.mp4",
      });
    });

    await waitFor(() => {
      expect(result.current).toBe("https://presigned.example.com/user-photos/abc.png");
    });
  });

  it("returns original uri when getDownloadUrl rejects", async () => {
    mockGetDownloadUrl.mockRejectedValueOnce(new Error("Network error"));
    const s3Url =
      "https://bucket.s3.us-east-1.amazonaws.com/user-photos/fail.png";
    const { result } = renderHook(() => useResolvedImageUrl(s3Url));

    await waitFor(() => {
      expect(mockGetDownloadUrl).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current).toBe(s3Url);
    });
  });

  it("does not extract key from non-matching amazonaws.com path", () => {
    const url = "https://other-bucket.s3.us-east-1.amazonaws.com/other/foo.jpg";
    const { result } = renderHook(() => useResolvedImageUrl(url));
    expect(result.current).toBe(url);
    expect(mockGetDownloadUrl).not.toHaveBeenCalled();
  });
});
