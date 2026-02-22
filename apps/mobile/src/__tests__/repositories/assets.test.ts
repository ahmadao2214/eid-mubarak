import * as mockApi from "@/lib/mock-api";
import { listCelebrityHeads, listAssets, listSounds } from "@/repositories/assets";

jest.mock("@/lib/mock-api");

const mockedApi = mockApi as jest.Mocked<typeof mockApi>;

describe("assets repository", () => {
  beforeEach(() => jest.clearAllMocks());

  it("listCelebrityHeads delegates to mockListCelebrityHeads", async () => {
    const heads = [{ id: "drake", name: "Drake", imageUrl: "url", thumbnail: "thumb" }];
    mockedApi.mockListCelebrityHeads.mockResolvedValue(heads);
    const result = await listCelebrityHeads();
    expect(mockedApi.mockListCelebrityHeads).toHaveBeenCalled();
    expect(result).toEqual(heads);
  });

  it("listAssets forwards type param", async () => {
    const assets = [{ id: "bg-1", type: "background-video" as const, name: "Mountain", url: "url" }];
    mockedApi.mockListAssets.mockResolvedValue(assets);
    const result = await listAssets("background-video");
    expect(mockedApi.mockListAssets).toHaveBeenCalledWith("background-video");
    expect(result).toEqual(assets);
  });

  it("listSounds forwards category param", async () => {
    const sounds = [{ id: "s-1", name: "Nasheed", category: "nasheed" as const, url: "url", durationSeconds: 15 }];
    mockedApi.mockListSounds.mockResolvedValue(sounds);
    const result = await listSounds("nasheed");
    expect(mockedApi.mockListSounds).toHaveBeenCalledWith("nasheed");
    expect(result).toEqual(sounds);
  });
});
