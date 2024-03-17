import { fetchOne, fetchOneWithId, updateOne } from "./db";
import { StoryResult } from "../types/marvelResponse";

const fetchUnused = async (event: {
  requiredEventId?: string;
  customDescription?: string;
}) => {
  const { requiredEventId, customDescription } = event;

  if (customDescription && !requiredEventId) {
    throw `id is required for custom dall-e calls`;
  }

  if (requiredEventId) {
    console.info(`RECEIVED CUSTOM ID ${requiredEventId}`);
    if (customDescription) {
      console.info(`RECEIVED CUSTOM DESCRIPTION: ${customDescription}`);
    }
  } else {
    console.info(
      `RECEIVED REQUEST WITH NO CUSTOM ID - WILL SEARCH FOR NEXT UNUSED EVENT`
    );
  }

  const todaysEvent: void | StoryResult = requiredEventId
    ? await fetchOneWithId(parseInt(requiredEventId))
    : await fetchOne();

  if (!todaysEvent) {
    throw "No unused documents left, or DB is empty";
  }

  console.info(`FETCHED EVENT: ${JSON.stringify(todaysEvent, null, 2)}`);

  const { id } = todaysEvent;
  const description = customDescription
    ? customDescription
    : todaysEvent.description;

  // TODO: send SNS with ID and description to generateImage
};

export const handler = fetchUnused;
