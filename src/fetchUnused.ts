import { fetchOne, updateOne } from "./db";
import { DallEResponse } from "../types/dalleResponse";
import { uploadImgToS3 } from "./s3";

const sendToDallE = async (description: string): Promise<DallEResponse> => {
  const dall_eUrl = process.env.DALL_E_URL;
  const bearerToken = process.env.OPEN_AI_TOKEN;

  const style = `Caravaggio style painting`;

  const body = {
    model: "dall-e-3",
    prompt: `Create a ${style} based on the following prompt, ignoring references to the artists who created this story and focusing on the summary of the story: ${description}`,
  };

  const options = {
    method: "POST",
    headers: new Headers({
      "Content-type": "application/json",
      Authorization: `bearer ${bearerToken}`,
    }),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30 * 1000),
  };

  console.info("Sending request to Dall-E...");
  const resp: DallEResponse = await fetch(dall_eUrl, options)
    .then(res => res.json())
    .catch(e => {
      console.error(e);
      throw e;
    });

  if (!resp.data[0]) {
    throw `ERROR: the response is missing an URL for the image: ${JSON.stringify(
      resp,
      null,
      2
    )}`;
  }

  console.info(`Dall-E response received: ${JSON.stringify(resp, null, 2)}`);
  return resp;
};

const FethcImageFromUrl = async (imageUrl: string) => {
  console.info(`Fetching image from Dall-E's response URL: ${imageUrl}`);

  const response = await fetch(imageUrl);
  if (!response) {
    throw `ERROR: Failed to fetch image from url. The response was: ${JSON.stringify(
      response
    )}`;
  }
  return response;
};

const fetchUnused = async () => {
  const todaysEvent = await fetchOne();

  if (!todaysEvent) {
    throw "No unused documents left, or DB is empty";
  }

  console.info(`FETCHED EVENT: ${JSON.stringify(todaysEvent, null, 2)}`);

  // TODO: fetch image from Dall-E url
  const { description } = todaysEvent;
  const id = todaysEvent.id.toString();

  const dallEResponse = await sendToDallE(description);
  const { revised_prompt, url: imageUrl } = dallEResponse.data[0];

  const imgResponse = await FethcImageFromUrl(imageUrl);
  const pathToS3Image = `events/${id}`;

  await uploadImgToS3(pathToS3Image, imgResponse);
  await updateOne(id, pathToS3Image, revised_prompt);
};

export const handler = fetchUnused;
