import * as AWS from "aws-sdk";

type SendSnsParams = {
  topicArn: string;
  eventId: number;
  description?: string;
  revisedPrompt?: string;
  imgUrl?: string;
  pathToS3Image?: string;
};

export const sendSns = async (props: SendSnsParams) => {
  const { topicArn } = props;

  const sns = new AWS.SNS();

  const params = { Message: JSON.stringify(props), TopicArn: topicArn };

  try {
    const data = await sns.publish(params).promise();
    console.log(`Message sent to the topic ${params.TopicArn}`, data);
    return { statusCode: 200, body: "Message sent successfully." };
  } catch (err) {
    console.error(`Error publishing to SNS topic ${params.TopicArn}`, err);
    return { statusCode: 500, body: "Failed to send the message." };
  }
};
