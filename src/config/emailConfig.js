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
          Data: `<h1>${body}</h1>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Goal Progress Update",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const run = async (toAddress, body) => {
  const SendEmailCommand = createSendEmailCommand(
    toAddress,
    "awsbhadani1997@gmail.com",
    body
  );
  try {
    return await sesClient.send(SendEmailCommand);
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
