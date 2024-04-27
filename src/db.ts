import * as AWS from "aws-sdk";
import { StoryResult } from "../types/marvelResponse";

const eventBridge = new AWS.EventBridge();
const db = new AWS.DynamoDB.DocumentClient();
const eventsTable = process.env.EVENTS_TABLE;
const eventBridgeRule = process.env.EVENT_BRIDGE_RULE;

export const uploadToDb = async (
  items: StoryResult[]
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

export const disableEventBridgeRule = async () => {
  try {
    await eventBridge
      .disableRule({
        Name: eventBridgeRule,
      })
      .promise();
      console.info('Disabled event bridge cron job')
  } catch (disableError) {
    console.error("Unable to disable rule.");
    throw JSON.stringify(disableError, null, 2);
  }
};

export const fetchOne = async (): Promise<void | StoryResult> => {
  const params = {
    TableName: eventsTable,
    FilterExpression: "#used = :value",
    ExpressionAttributeNames: {
      "#used": "used",
    },
    ExpressionAttributeValues: {
      ":value": false,
    },
  };

  return new Promise((resolve, reject) => {
    db.scan(params, async (err, data) => {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        reject(err);
      } else {
        console.log(
          "Query succeeded. Item:",
          JSON.stringify(data.Items[0], null, 2)
        );
        resolve(data.Items[0] as StoryResult);
      }
    });
  });
};

export const fetchOneWithId = async (
  id: number
): Promise<void | StoryResult> => {
  if (!eventsTable) {
    throw "Couldn't read table name from env vars";
  }

  const params = {
    TableName: eventsTable,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  };

  return new Promise((resolve, reject) => {
    db.query(params, (err, data) => {
      if (err) {
        console.error(
          "fetchSingleEventWithId failed with error:",
          JSON.stringify(err, null, 2)
        );
        reject(err);
      } else {
        console.log(
          "fetchSingleEventWithId query succeeded. Item:",
          JSON.stringify(data.Items, null, 2)
        );
        resolve(data.Items![0] as StoryResult);
      }
    });
  });
};

export const updateOne = async (
  id: number,
  imgUrl: string,
  revisedPrompt: string
) => {
  const dateUpdated = new Date().toISOString();

  const params = {
    TableName: eventsTable,
    Key: {
      id,
    },
    UpdateExpression:
      "SET #used = :usedValue, #imgUrl = :imgUrlValue, #revisedPrompt = :revisedPrompt, #dateUpdated = :dateUpdated",
    ExpressionAttributeNames: {
      "#used": "used",
      "#imgUrl": "imgUrl",
      "#revisedPrompt": "revisedPrompt",
      "#dateUpdated": "dateUpdated",
    },
    ExpressionAttributeValues: {
      ":usedValue": true,
      ":imgUrlValue": imgUrl,
      ":revisedPrompt": revisedPrompt,
      ":dateUpdated": dateUpdated,
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
