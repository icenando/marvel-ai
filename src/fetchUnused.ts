import { fetchOne, fetchOneWithId, updateOne } from "./db";
import { DallEResponse } from "../types/dalleResponse";
import { uploadImgToS3 } from "./s3";
import { StoryResult } from "../types/marvelResponse";

const sendToDallE = async (description: string): Promise<DallEResponse> => {
  const dall_eUrl = process.env.DALL_E_URL;
  const bearerToken = process.env.OPEN_AI_TOKEN;

  const style = `Caravaggio`;

  const body = {
    model: "dall-e-3",
    prompt: `Create a ${style} style painting based on the following prompt, 
    ignoring the artists who created this story if there are any references 
    to them. Focus on the summary of the story. Do not include 
    any text in the resulting image. Ensure that there are no DC comics 
    characters in the resulting image, and that there is racial, gender and 
    physical diversity: ${description}`,
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

  if (!resp?.data[0]) {
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

const fetchUnused = async (event: { id: string; description: string }) => {
  const { id: incomingId, description: incomingDescription } = event;

  if (incomingDescription && !incomingId) {
    throw `id is required for custom dall-e calls`;
  }

  if (incomingId) {
    console.info(`RECEIVED CUSTOM ID ${incomingId}`);
    if (incomingDescription) {
      console.info(`RECEIVED CUSTOM DESCRIPTION: ${incomingDescription}`);
    }
  }

  const todaysEvent: void | StoryResult = incomingId
    ? await fetchOneWithId(parseInt(incomingId))
    : await fetchOne();

  if (!todaysEvent) {
    throw "No unused documents left, or DB is empty";
  }

  console.info(`FETCHED EVENT: ${JSON.stringify(todaysEvent, null, 2)}`);

  const { id } = todaysEvent;
  const description = incomingDescription
    ? incomingDescription
    : todaysEvent.description;

  const dallEResponse = await sendToDallE(description);
  const { revised_prompt, url: imageUrl } = dallEResponse.data[0];

  const imgResponse = await FethcImageFromUrl(imageUrl);
  const pathToS3Image = `events/${id.toString()}`;

  await uploadImgToS3(pathToS3Image, imgResponse);
  try {
    await updateOne(id, pathToS3Image, revised_prompt);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const handler = fetchUnused;
