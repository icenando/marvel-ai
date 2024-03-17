import { updateOne } from "./db";

const updateDocument = async (event: {
  eventId: number;
  pathToS3Image: string;
  revisedPrompt: string;
}) => {
  const { eventId, pathToS3Image, revisedPrompt } = event;

  try {
    await updateOne(eventId, pathToS3Image, revisedPrompt);
  } catch (err) {
    console.error(err);
    throw err;
  }

  //   TODO: send empty SNS to trigger FE path revalidation to revalidatePath
};

export const handler = updateDocument;
