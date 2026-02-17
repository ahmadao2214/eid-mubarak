import * as mockApi from "@/lib/mock-api";
import { getUploadUrl, uploadToS3, removeBackground } from "@/repositories/uploads";

jest.mock("@/lib/mock-api");

const mockedApi = mockApi as jest.Mocked<typeof mockApi>;

describe("uploads repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getUploadUrl delegates to mockGetUploadUrl", async () => {
    mockedApi.mockGetUploadUrl.mockResolvedValue({ url: "https://presigned.url" });
    const result = await getUploadUrl();
    expect(mockedApi.mockGetUploadUrl).toHaveBeenCalled();
    expect(result).toEqual({ url: "https://presigned.url" });
  });

  it("uploadToS3 delegates to mockUploadToS3", async () => {
    mockedApi.mockUploadToS3.mockResolvedValue("user-photos/123.png");
    const blob = new Blob(["test"]);
    const result = await uploadToS3("https://presigned.url", blob);
    expect(mockedApi.mockUploadToS3).toHaveBeenCalledWith("https://presigned.url", blob);
    expect(result).toBe("user-photos/123.png");
  });

  it("removeBackground delegates to mockRemoveBackground", async () => {
    mockedApi.mockRemoveBackground.mockResolvedValue({ resultS3Url: "https://transparent.png" });
    const result = await removeBackground("file:///photo.jpg");
    expect(mockedApi.mockRemoveBackground).toHaveBeenCalledWith("file:///photo.jpg");
    expect(result).toEqual({ resultS3Url: "https://transparent.png" });
  });
});
