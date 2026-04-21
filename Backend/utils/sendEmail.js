import transporter from "../config/mailer.js";

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"Cozy Stay" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;