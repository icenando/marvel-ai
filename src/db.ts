import * as AWS from "aws-sdk";
import { StoryResults } from "../types/marvelResponse";

const db = new AWS.DynamoDB.DocumentClient();
const eventsTable = process.env.EVENTS_TABLE;

export const uploadToDb = async (
  items: StoryResults[]
): Promise<string | void> => {
  console.info(JSON.stringify(items, null, 2));

  console.info("Writing events to DB...");
  for (const item of items) {
    await db
      .put(
        {
          TableName: eventsTable,
          Item: item,
        },
        (err, data) => {
          if (err) {
            console.error(err);
            throw err;
          } else {
            console.info(
              `INSERTED EVENT ID ${item.id}: ${JSON.stringify(data, null, 2)}`
            );
          }
        }
      )
      .promise();
  }
};

export const fetchOne = async (): Promise<void | StoryResults> => {
  const params = {
    TableName: eventsTable,
    FilterExpression: "#used = :value",
    ExpressionAttributeNames: {
      "#used": "used",
    },
    ExpressionAttributeValues: {
      ":value": false,
    },
    Limit: 1, // Limit to 1 item
  };

  // Perform the query
  return new Promise((resolve, reject) => {
    db.scan(params, (err, data) => {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        reject(err);
      } else {
        console.log(
          "Query succeeded. Item:",
          JSON.stringify(data.Items[0], null, 2)
        );
        resolve(data.Items[0] as StoryResults);
      }
    });
  });
};

export const updateOne = async (
  id: number,
  imgUrl: string,
  revisedPrompt: string
) => {
  const params = {
    TableName: eventsTable,
    Key: {
      id,
    },
    UpdateExpression:
      "SET #used = :usedValue, #imgUrl = :imgUrlValue, #revisedPrompt = :revisedPrompt",
    ExpressionAttributeNames: {
      "#used": "used",
      "#imgUrl": "imgUrl",
      "#revisedPrompt": "revisedPrompt",
    },
    ExpressionAttributeValues: {
      ":usedValue": true,
      ":imgUrlValue": imgUrl,
      ":revisedPrompt": revisedPrompt,
    },
    ReturnValues: "ALL_NEW", // Optional: specifies that the response should include the updated attributes
  };

  console.info("Updating document in DB...");
  return new Promise((resolve, reject) => {
    db.update(params, (err, data) => {
      if (err) {
        console.error("Failed to update. Error:", JSON.stringify(err, null, 2));
        reject(err);
      } else {
        console.info(
          "Update succeeded. Updated item ('attributesNew is the updated document):",
          JSON.stringify(data, null, 2)
        );
        resolve(data);
      }
    });
  });
};
