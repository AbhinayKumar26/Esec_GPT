import "dotenv/config";
import sendOTPEmail from "./utils/mailer.js";

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);

try {
  await sendOTPEmail("sk265254sk@gmail.com", "123456");
  console.log("SUCCESS");
} catch (err) {
  console.error(err);
}