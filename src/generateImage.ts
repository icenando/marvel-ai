import { DallEResponse } from "../types/dalleResponse";
import { sendSns } from "./sns";

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
      characters in the resulting image, and that there is racial, gender, 
      physical and sexual diversity: ${description}`,
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

const generateImage = async (event: {
  eventId: number;
  description: string;
}) => {
  const { eventId, description } = event;
  const TOPIC_ARN = process.env.TOPIC_ARN;

  const dallEResponse = await sendToDallE(description);
  const { revisedPrompt, url: imgUrl } = dallEResponse.data[0];

  sendSns({ topicArn: TOPIC_ARN, eventId, revisedPrompt, imgUrl });
};

export const handler = generateImage;
