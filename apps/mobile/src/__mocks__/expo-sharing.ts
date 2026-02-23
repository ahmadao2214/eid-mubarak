export const mockIsAvailableAsync = jest.fn().mockResolvedValue(true);
export const mockShareAsync = jest.fn().mockResolvedValue(undefined);

export function isAvailableAsync(): Promise<boolean> {
  return mockIsAvailableAsync();
}

export function shareAsync(
  ...args: unknown[]
): Promise<void> {
  return mockShareAsync(...args);
}
