import * as AWS from "aws-sdk";
import { StoryResults } from "../types/marvelResponse";

export const uploadToDb = (items: StoryResults[]) => {
  const db = new AWS.DynamoDB.DocumentClient();

  console.info("Upserting to DB...");
  items.forEach(async item => {
    const record: StoryResults = {
      id: item.id,
      title: item.title,
      description: item.description,
      start: item.start,
      end: item.end,
      url: item.url,
    };

    await db
      .put({
        TableName: "MarvelEvents",
        Item: record,
      })
      .promise();
  });
};
