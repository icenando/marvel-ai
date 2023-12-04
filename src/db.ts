import * as AWS from "aws-sdk";
import { StoryResults } from "../types/marvelResponse";

export const uploadToDb = async (
  items: StoryResults[]
): Promise<string | void> => {
  const db = new AWS.DynamoDB.DocumentClient();

  console.info(JSON.stringify(items, null, 2));

  console.info("Writing to DB...");
  for (const item of items) {
    await db
      .put(
        {
          TableName: "MarvelEvents",
          Item: item,
        },
        (err, data) => {
          if (err) {
            console.log(err);
            return "ERROR";
          } else {
            console.log("SUCCESS", data);
          }
        }
      )
      .promise();
  }
};
