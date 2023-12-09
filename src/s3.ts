import * as AWS from "aws-sdk";

export const uploadImgToS3 = async (objectKey: string, response: Response) => {
  const bucketName = process.env.BUCKET_NAME as string;
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  console.info(`Saving image to s3: ${bucketName}/${objectKey}`);
  const uploadParams = {
    Bucket: bucketName,
    Key: objectKey,
    Body: imageBuffer,
    ContentType: response.headers.get("content-type") as string,
  };

  const s3 = new AWS.S3();
  const uploadResult = await s3
    .upload(uploadParams, (err: Error) => {
      if (err) {
        console.error("Failed to upload to s3");
        throw err;
      }
    })
    .promise();
  console.log("Image uploaded successfully:", uploadResult.Location);
};
