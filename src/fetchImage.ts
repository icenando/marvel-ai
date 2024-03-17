import { uploadImgToS3 } from "./s3";

const fetchImageFromUrl = async (imageUrl: string) => {
  console.info(`Fetching image from Dall-E's response URL: ${imageUrl}`);

  const response = await fetch(imageUrl);
  if (!response) {
    throw `ERROR: Failed to fetch image from url. The response was: ${JSON.stringify(
      response
    )}`;
  }
  return response;
};

const fetchImage = async (event: {
  eventId: number;
  revisedPrompt: string;
  imgUrl: string;
}) => {
  const { eventId, revisedPrompt, imgUrl } = event;
  const imgResponse = await fetchImageFromUrl(imgUrl);
  const pathToS3Image = `events/${eventId}`;

  await uploadImgToS3(pathToS3Image, imgResponse);

  // TODO sent SNS with ID, pathToS3Image and revised prompt to updateDocument
};

export const handler = fetchImageFromUrl;
