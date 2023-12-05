import * as AWS from "aws-sdk";
import { StoryResults } from "../types/marvelResponse";

export const uploadToDb = async (
  items: StoryResults[]
): Promise<string | void> => {
  const db = new AWS.DynamoDB.DocumentClient();

  console.info(JSON.stringify(items, null, 2));

  console.info("Writing events to DB...");
  for (const item of items) {
    await db
      .put(
        {
          TableName: "MarvelEvents",
          Item: item,
        },
        err => {
          if (err) {
            console.log(err);
            return "ERROR";
          } else {
            console.log(`INSERTED EVENT ID ${item.id}`);
          }
        }
      )
      .promise();
  }
};
