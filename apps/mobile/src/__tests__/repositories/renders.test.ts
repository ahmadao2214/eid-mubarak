import * as mockApi from "@/lib/mock-api";
import { requestRender, getRenderStatus } from "@/repositories/renders";

jest.mock("@/lib/mock-api");

const mockedApi = mockApi as jest.Mocked<typeof mockApi>;

describe("renders repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requestRender delegates to mockRequestRender", async () => {
    mockedApi.mockRequestRender.mockResolvedValue("render-1");
    const result = await requestRender("proj-1");
    expect(mockedApi.mockRequestRender).toHaveBeenCalledWith("proj-1");
    expect(result).toBe("render-1");
  });

  it("getRenderStatus delegates to mockGetRenderStatus", async () => {
    const job = {
      id: "render-1",
      projectId: "proj-1",
      status: "completed" as const,
      progress: 100,
      outputUrl: "https://mock.com/video.mp4",
    };
    mockedApi.mockGetRenderStatus.mockResolvedValue(job);
    const result = await getRenderStatus("render-1");
    expect(mockedApi.mockGetRenderStatus).toHaveBeenCalledWith("render-1");
    expect(result).toEqual(job);
  });
});
