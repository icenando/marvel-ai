import * as AWS from "aws-sdk";
import { StoryResults } from "../types/marvelResponse";
import { QueryOutput } from "aws-sdk/clients/dynamodb";

const db = new AWS.DynamoDB.DocumentClient();

export const uploadToDb = async (
  items: StoryResults[]
): Promise<string | void> => {
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

export const fetchOne = async (): Promise<void | AWS.DynamoDB.QueryOutput> => {
  const params = {
    TableName: 'MarvelEvents',
    FilterExpression: '#used = :value',
    ExpressionAttributeNames: {
      '#used': 'used',
    },
    ExpressionAttributeValues: {
      ':value': false,
    },
    Limit: 1, // Limit to 1 item
  };

  // Perform the query
  await db.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      throw err
    } else {
      console.log(
        "Query succeeded. Item:",
        JSON.stringify(data.Items[0], null, 2)
      );
      return data.Items[0];
    }
  }).promise();
};
