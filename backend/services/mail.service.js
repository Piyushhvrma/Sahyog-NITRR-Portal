const sendBrevoEmail = async ({ to, subject, htmlContent, replyTo, attachment }) => {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("Email configuration missing.");
  }

  const payload = {
    sender: {
      name: "SAHYOG NIT Raipur",
      email: process.env.EMAIL_FROM,
    },
    to,
    subject,
    htmlContent,
  };

  if (replyTo) payload.replyTo = replyTo;
  if (attachment) payload.attachment = attachment;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Email sending failed.");
  }

  return response.json().catch(() => ({}));
};

const sendOtpEmail = async (email, otp) => {
  return sendBrevoEmail({
    to: [{ email }],
    subject: "SAHYOG Password Reset OTP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif;">
        <h2>SAHYOG Password Reset</h2>
        <p>Your OTP for password reset is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  });
};

const sendSupportRequestEmail = async ({ name, contact, category, message }) => {
  if (!process.env.SUPPORT_RECEIVER) {
    throw new Error("Support receiver email missing.");
  }

  return sendBrevoEmail({
    to: [{ email: process.env.SUPPORT_RECEIVER }],
    subject: `❤️ New SAHYOG Help Request [${category}]`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Student Support Request</h2>
        <p><b>Name:</b> ${name || "Anonymous Student"}</p>
        <p><b>Contact:</b> ${contact || "Not Provided"}</p>
        <p><b>Category:</b> ${category}</p>
        <p><b>Message:</b></p>
        <pre>${message}</pre>
      </div>
    `,
  });
};

const sendBloodRequestEmail = async ({
  name,
  email,
  phone,
  bloodGroup,
  requestDetails,
  attachments,
}) => {
  if (!process.env.BLOOD_REQUEST_RECEIVER) {
    throw new Error("Blood request receiver email missing.");
  }

  const receivers = process.env.BLOOD_REQUEST_RECEIVER.split(",").map((mail) => ({
    email: mail.trim(),
  }));

  return sendBrevoEmail({
    to: receivers,
    subject: `🩸 New Blood Request - ${bloodGroup}`,
    replyTo: email ? { email } : undefined,
    attachment: attachments?.length ? attachments : undefined,
    htmlContent: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Blood Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email || "Not provided"}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Blood Group:</b> ${bloodGroup}</p>
        <p><b>Details:</b></p>
        <pre>${requestDetails}</pre>
      </div>
    `,
  });
};

module.exports = {
  sendBrevoEmail,
  sendOtpEmail,
  sendSupportRequestEmail,
  sendBloodRequestEmail,
};