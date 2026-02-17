import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

export async function pickImageFromGallery(): Promise<PickedImage | null> {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

export async function pickImageFromCamera(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (permission.status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

export async function cropToSquare(
  uri: string,
  width: number,
  height: number
): Promise<string> {
  if (width === height) {
    return uri;
  }

  const size = Math.min(width, height);
  const originX = Math.floor((width - size) / 2);
  const originY = Math.floor((height - size) / 2);

  const result = await manipulateAsync(
    uri,
    [{ crop: { originX, originY, width: size, height: size } }],
    { format: SaveFormat.PNG }
  );

  return result.uri;
}
