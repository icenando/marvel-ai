import * as AWS from "aws-sdk";
import { StoryResults } from "../types/marvelResponse";

export const uploadToDb = (items: StoryResults[]): AWS.AWSError | void => {
  const db = new AWS.DynamoDB.DocumentClient();

  console.info(JSON.stringify(items, null, 2));

  console.info("Writing to DB...");
  items.forEach(async item => {
    try {
      await db
        .put({
          TableName: "MarvelEvents",
          Item: item,
        })
        .promise();
    } catch (e) {
      return e;
    }
  });
};
