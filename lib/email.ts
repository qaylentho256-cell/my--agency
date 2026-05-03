import nodemailer from "nodemailer";

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendQuoteEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const transport = getTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text: body,
    html: body.split("\n").map((l) => `<p>${l}</p>`).join(""),
  });
}
