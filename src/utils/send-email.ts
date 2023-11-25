import { SES } from "aws-sdk";

interface EmailParams {
  recipientEmail: string;
  subject: string;
  content: string;
}

class SESEmailer {
  private ses: SES;

  constructor() {
    // Set up SES with your AWS credentials
    this.ses = new SES({
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SES_SEC_KEY!,
    });
  }

  async sendEmail(params: EmailParams): Promise<void> {
    const { recipientEmail, subject, content } = params;

    const paramsSES: SES.SendEmailRequest = {
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Body: {
          Text: { Data: content },
        },
        Subject: { Data: subject },
      },
      Source: process.env.AWS_SES_SENDER!,
    };

    try {
      await this.ses.sendEmail(paramsSES).promise();
      console.log("Email sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default SESEmailer;
