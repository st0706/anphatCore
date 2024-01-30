import { render } from "@react-email/components";
import { sendEmail } from "./sendEmail";
import { WelcomeEmail } from "@/components/email";

export const sendWelcomeEmail = async (name: string, email: string, team: string) => {
  const subject = "Chào mừng bạn đến với AnPhat Core";
  const html = render(WelcomeEmail({ name, team, subject }));

  await sendEmail({
    to: email,
    subject,
    html
  });
};
