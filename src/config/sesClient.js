const { SESClient } = require("@aws-sdk/client-ses");

//Set the AWS Region
const REGION = "ap-south-1";

//Create SES Service Object
const sesClient = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_SECRET_KEY,
  },
});

module.exports = { sesClient };
