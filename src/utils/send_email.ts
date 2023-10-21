import nodemailer from 'nodemailer';

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'abc@abc.abc',
        pass: 'pwd',
      },
    });

    const mailOptions = {
      from: 'abc@abc.abc',
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}