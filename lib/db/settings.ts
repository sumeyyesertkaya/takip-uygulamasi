import { db } from "./index";

const BG_IMAGE_KEY = "bgImage";

export async function getBackgroundImage(): Promise<string | undefined> {
  return (await db.settings.get(BG_IMAGE_KEY))?.value;
}

export async function saveBackgroundImage(dataUrl: string): Promise<void> {
  await db.settings.put({ key: BG_IMAGE_KEY, value: dataUrl });
}

export async function clearBackgroundImage(): Promise<void> {
  await db.settings.delete(BG_IMAGE_KEY);
}
