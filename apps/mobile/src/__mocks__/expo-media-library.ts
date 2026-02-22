export const mockRequestPermissionsAsync = jest
  .fn()
  .mockResolvedValue({ status: "granted" as const });
export const mockSaveToLibraryAsync = jest.fn().mockResolvedValue(undefined);

export function requestPermissionsAsync(
  ...args: unknown[]
): Promise<{ status: string }> {
  return mockRequestPermissionsAsync(...args);
}

export function saveToLibraryAsync(...args: unknown[]): Promise<void> {
  return mockSaveToLibraryAsync(...args);
}
