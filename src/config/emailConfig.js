const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient");

const createSendEmailCommand = (toAddress, fromAddress, body) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: `<h1>This is HTML Content</h1>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Testing Email",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const run = async () => {
  const SendEmailCommand = createSendEmailCommand(
    "bhadanimohit1997@gmail.com",
    "awsbhadani1997@gmail.com",
    "This is Testing Email"
  );
  try {
    await sesClient.send(SendEmailCommand);
    console.log("Email Sent successfully");
    return;
  } catch (error) {
    if (error instanceof Error && error.name === "MessagRejected") {
      /* @type {import('@aws-sdk/client-ses').MessageRejected} */
      const messageRejectedError = error;
      return messageRejectedError;
    }
    throw error;
  }
};
module.exports = { run };
