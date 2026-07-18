import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  family: 4,                 // Force IPv4
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

transporter.verify((err) => {
  if (err) {
    console.log("❌ Mailer Error:", err);
  } else {
    console.log("✅ Mailer Ready");
  }
});

const sendOTPEmail = async (email, otp) => {
  console.log("📧 Sending OTP to:", email);

  const info = await transporter.sendMail({
    from: `"EsecGPT" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "EsecGPT Password Reset OTP",
    html: `
      <h2>Password Reset OTP</h2>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
  });

  console.log("✅ Email Sent:", info.messageId);
};

export default sendOTPEmail;

