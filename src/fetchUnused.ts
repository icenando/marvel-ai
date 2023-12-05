import { fetchOne } from "./db";

const fetchUnused = async () => {
  const todaysEvent = await fetchOne();

  if (!todaysEvent) {
    console.error("No unused documents left");
    return;
  }

  console.log(todaysEvent);

  // TODO: send to Dall-E
  // TODO: update document "used" to true
};

export const handler = fetchUnused;
