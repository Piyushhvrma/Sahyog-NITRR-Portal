const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const safeEmailSubjectValue = (
  value = ""
) => {
  return String(value)
    .replace(/[\r\n]/g, " ")
    .trim()
    .slice(0, 120);
};

const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
  replyTo,
  attachment,
}) => {
  if (
    !process.env.BREVO_API_KEY ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error(
      "Email configuration missing."
    );
  }

  const payload = {
    sender: {
      name: "SAHYOG NIT Raipur",
      email: process.env.EMAIL_FROM,
    },

    to,

    subject:
      safeEmailSubjectValue(
        subject
      ),

    htmlContent,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  if (
    Array.isArray(attachment) &&
    attachment.length > 0
  ) {
    payload.attachment = attachment;
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",

      headers: {
        "api-key":
          process.env.BREVO_API_KEY,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const responseText =
      await response.text();

    console.error(
      "Brevo email request failed:",
      {
        status: response.status,

        body:
          process.env.NODE_ENV ===
          "development"
            ? responseText.slice(
                0,
                500
              )
            : undefined,
      }
    );

    throw new Error(
      "Email sending failed."
    );
  }

  return response
    .json()
    .catch(() => ({}));
};

const sendOtpEmail = async (
  email,
  otp
) => {
  const safeOtp =
    escapeHtml(otp);

  return sendBrevoEmail({
    to: [{ email }],

    subject:
      "SAHYOG Password Reset OTP",

    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #0f172a;">
        <h2>SAHYOG Password Reset</h2>

        <p>
          Your OTP for password reset is:
        </p>

        <h1 style="letter-spacing: 4px;">
          ${safeOtp}
        </h1>

        <p>
          This OTP is valid for 10 minutes.
        </p>

        <p style="color: #64748b; font-size: 13px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

const sendSupportRequestEmail =
  async ({
    name,
    contact,
    category,
    message,
  }) => {
    if (
      !process.env.SUPPORT_RECEIVER
    ) {
      throw new Error(
        "Support receiver email missing."
      );
    }

    const safeName =
      escapeHtml(
        name ||
          "Anonymous Student"
      );

    const safeContact =
      escapeHtml(
        contact ||
          "Not Provided"
      );

    const safeCategory =
      escapeHtml(
        category || "Other"
      );

    const safeMessage =
      escapeHtml(message);

    const subjectCategory =
      safeEmailSubjectValue(
        category || "Other"
      );

    return sendBrevoEmail({
      to: [
        {
          email:
            process.env
              .SUPPORT_RECEIVER,
        },
      ],

      subject:
        `❤️ New SAHYOG Help Request [${subjectCategory}]`,

      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h2>
            New Student Support Request
          </h2>

          <p>
            <b>Name:</b>
            ${safeName}
          </p>

          <p>
            <b>Contact:</b>
            ${safeContact}
          </p>

          <p>
            <b>Category:</b>
            ${safeCategory}
          </p>

          <p>
            <b>Message:</b>
          </p>

          <div
            style="
              white-space: pre-wrap;
              overflow-wrap: anywhere;
              padding: 14px;
              border-radius: 10px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
            "
          >
            ${safeMessage}
          </div>
        </div>
      `,
    });
  };

const sendBloodRequestEmail =
  async ({
    name,
    email,
    phone,
    bloodGroup,
    requestDetails,
    attachments,
  }) => {
    if (
      !process.env
        .BLOOD_REQUEST_RECEIVER
    ) {
      throw new Error(
        "Blood request receiver email missing."
      );
    }

    const receivers =
      process.env
        .BLOOD_REQUEST_RECEIVER
        .split(",")
        .map((mail) => mail.trim())
        .filter(Boolean)
        .map((mail) => ({
          email: mail,
        }));

    if (!receivers.length) {
      throw new Error(
        "Blood request receiver email missing."
      );
    }

    const safeName =
      escapeHtml(name);

    const safeEmail =
      escapeHtml(
        email || "Not provided"
      );

    const safePhone =
      escapeHtml(phone);

    const safeBloodGroup =
      escapeHtml(bloodGroup);

    const safeRequestDetails =
      escapeHtml(requestDetails);

    const subjectBloodGroup =
      safeEmailSubjectValue(
        bloodGroup || "Unknown"
      );

    return sendBrevoEmail({
      to: receivers,

      subject:
        `🩸 New Blood Request - ${subjectBloodGroup}`,

      replyTo: email
        ? { email }
        : undefined,

      attachment:
        attachments?.length
          ? attachments
          : undefined,

      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h2>New Blood Request</h2>

          <p>
            <b>Name:</b>
            ${safeName}
          </p>

          <p>
            <b>Email:</b>
            ${safeEmail}
          </p>

          <p>
            <b>Phone:</b>
            ${safePhone}
          </p>

          <p>
            <b>Blood Group:</b>
            ${safeBloodGroup}
          </p>

          <p>
            <b>Details:</b>
          </p>

          <div
            style="
              white-space: pre-wrap;
              overflow-wrap: anywhere;
              padding: 14px;
              border-radius: 10px;
              background: #fff7f7;
              border: 1px solid #fecaca;
            "
          >
            ${safeRequestDetails}
          </div>
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