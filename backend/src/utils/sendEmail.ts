import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions) => {
  if (
    !process.env.SMTP_HOST || 
    !process.env.SMTP_USER || 
    !process.env.SMTP_PASS || 
    process.env.SMTP_HOST === 'your_smtp_host' ||
    process.env.SMTP_HOST.includes('placeholder')
  ) {
    console.log("======================================================================");
    console.log(`[MOCK EMAIL WORKFLOW] Fallback log due to unconfigured SMTP server`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text Preview: ${options.message}`);
    console.log("======================================================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
