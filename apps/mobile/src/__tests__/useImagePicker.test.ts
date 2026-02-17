import {
  pickImageFromGallery,
  pickImageFromCamera,
  cropToSquare,
} from "../hooks/useImagePicker";

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { PNG: "png" },
}));

const ImagePicker = require("expo-image-picker");
const ImageManipulator = require("expo-image-manipulator");

describe("useImagePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("pickImageFromGallery", () => {
    it("returns image URI on successful selection", async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", width: 800, height: 600 }],
      });

      const result = await pickImageFromGallery();
      expect(result).toEqual({
        uri: "file:///photo.jpg",
        width: 800,
        height: 600,
      });
    });

    it("returns null when user cancels", async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await pickImageFromGallery();
      expect(result).toBeNull();
    });

    it("returns null when permission denied", async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: "denied",
      });

      const result = await pickImageFromGallery();
      expect(result).toBeNull();
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });

  describe("pickImageFromCamera", () => {
    it("returns image URI on successful capture", async () => {
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: "granted",
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///camera.jpg", width: 1200, height: 1200 }],
      });

      const result = await pickImageFromCamera();
      expect(result).toEqual({
        uri: "file:///camera.jpg",
        width: 1200,
        height: 1200,
      });
    });

    it("returns null when permission denied", async () => {
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: "denied",
      });

      const result = await pickImageFromCamera();
      expect(result).toBeNull();
    });
  });

  describe("cropToSquare", () => {
    it("crops a landscape image to square", async () => {
      ImageManipulator.manipulateAsync.mockResolvedValue({
        uri: "file:///cropped.png",
        width: 600,
        height: 600,
      });

      const result = await cropToSquare("file:///photo.jpg", 800, 600);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        "file:///photo.jpg",
        [
          {
            crop: {
              originX: 100, // (800-600)/2
              originY: 0,
              width: 600,
              height: 600,
            },
          },
        ],
        { format: "png" }
      );
      expect(result).toBe("file:///cropped.png");
    });

    it("crops a portrait image to square", async () => {
      ImageManipulator.manipulateAsync.mockResolvedValue({
        uri: "file:///cropped.png",
        width: 500,
        height: 500,
      });

      const result = await cropToSquare("file:///photo.jpg", 500, 800);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        "file:///photo.jpg",
        [
          {
            crop: {
              originX: 0,
              originY: 150, // (800-500)/2
              width: 500,
              height: 500,
            },
          },
        ],
        { format: "png" }
      );
      expect(result).toBe("file:///cropped.png");
    });

    it("returns original URI for already square images", async () => {
      const result = await cropToSquare("file:///square.jpg", 500, 500);

      expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
      expect(result).toBe("file:///square.jpg");
    });
  });
});
