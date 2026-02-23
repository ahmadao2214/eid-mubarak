export const mockDownloadFileAsync = jest
  .fn()
  .mockResolvedValue({ uri: "file:///tmp/video.mp4" });

export const Paths = { cache: "/tmp" };

export const File = {
  downloadFileAsync: (...args: unknown[]) => mockDownloadFileAsync(...args),
};
