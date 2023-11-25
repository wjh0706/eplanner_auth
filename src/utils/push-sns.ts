import AWS from "aws-sdk";

class SNSPusher {
  private sns: AWS.SNS;

  constructor() {
    this.sns = new AWS.SNS({
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SEC_KEY!,
    });
  }

  async pushEventToSNS(topicArn: string, message: any): Promise<void> {
    try {
      await this.sns.publish({
        TopicArn: topicArn,
        Message: JSON.stringify(message),
      }).promise();

      console.log("Event pushed to SNS successfully.");
    } catch (error) {
      console.error("Error pushing event to SNS:", error);
      throw error;
    }
  }
}

export default SNSPusher;

