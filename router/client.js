const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const Joi = require("joi");
const Client = require("../model/Client");
const multer = require("multer");
const moment = require("moment");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const currentRootDirectoryName = path.basename(process.cwd());
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const folderPath = path.join(__dirname, "../uploads");

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    callback(null, folderPath);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
const uploads = multer({ storage });

const schema = Joi.object({
  clientDetails: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  }).required(),
  projectDetails: Joi.object({
    projectName: Joi.string().required(),
    projectManagers: Joi.array().required(),
    projectStartDate: Joi.date().required(),
    projectExpectedDeliveryDate: Joi.date().required(),
    projectDeliveryDate: Joi.date().required(),
  }).required(),
  AMC: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
  domain: Joi.object({
    name: Joi.string().required(),
    id: Joi.string().email().required(),
    password: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }).required(),
  hosting: Joi.object({
    name: Joi.string().required(),
    id: Joi.string().email().required(),
    password: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }).required(),
  socials: Joi.object({
    facebook: Joi.object({
      id: Joi.string().allow(""),
      password: Joi.string().allow(""),
      url: Joi.string().allow(""),
    }),
    instagram: Joi.object({
      id: Joi.string().allow(""),
      password: Joi.string().allow(""),
      url: Joi.string().allow(""),
    }),
    linkedin: Joi.object({
      id: Joi.string().allow(""),
      password: Joi.string().allow(""),
      url: Joi.string().allow(""),
    }),
    twitter: Joi.object({
      id: Joi.string().allow(""),
      password: Joi.string().allow(""),
      url: Joi.string().allow(""),
    }),
    other: Joi.object({
      name: Joi.string().allow(""),
      id: Joi.string().allow(""),
      password: Joi.string().allow(""),
      url: Joi.string().allow(""),
    }),
  }),
  pricing: Joi.object({
    basePrice: Joi.number().required(),
    additionalCosts: Joi.number().required(),
    partialPaid: Joi.number().required(),
    totalCost: Joi.number().required(),
  }).required(),
  isDisabled: Joi.boolean().default(false),
});

async function sendExpirationEmail(email, service, client) {
  // console.log(detail);
  try {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure the email service provider
      // Example: for Gmail, you can use the SMTP transport
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    // Compose the email message
    let mailOptions;
    if (service === "domain") {
      mailOptions = {
        from: "your-email@gmail.com",
        // to: "vishal.gautam.5812@gmail.com, shubham.brandingwaale@gmail.com",
        to: "vishal.gautam.5812@gmail.com",
        subject: `Your ${service} will expire soon!`,
        text: `Your ${client.domain.name} domain will expire soon. Please renew it as soon as possible.`,
      };
    } else if (service === "hosting") {
      mailOptions = {
        from: "your-email@gmail.com",
        // to: "vishal.gautam.5812@gmail.com, shubham.brandingwaale@gmail.com",
        to: "vishal.gautam.5812@gmail.com",
        subject: `Your ${service} will expire soon!`,
        text: `Your ${client.hosting.name} hosting will expire soon. Please renew it as soon as possible.`,
      };
    }

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Expiration email sent to ${email} for ${service}.`);
  } catch (error) {
    console.error("Error sending expiration email:", error);
  }
}

async function checkExpirationsAndSendEmails() {
  try {
    const clients = await Client.find();

    for (const client of clients) {
      const currentDate = moment();
      const domainEndDate = moment(client.domain.endDate);
      const hostingEndDate = moment(client.hosting.endDate);
      const daysBeforeExpiration = 10;
      const domainExpirationDate = domainEndDate.subtract(
        daysBeforeExpiration,
        "days"
      );
      const hostingExpirationDate = hostingEndDate.subtract(
        daysBeforeExpiration,
        "days"
      );

      if (currentDate.isSameOrAfter(domainExpirationDate)) {
        // Domain will expire in 10 days, send an email
        await sendExpirationEmail(client.clientDetails.email, "domain", client);
        // console.log("domain expired");
      }

      if (currentDate.isSameOrAfter(hostingExpirationDate)) {
        // Hosting will expire in 10 days, send an email
        await sendExpirationEmail(
          client.clientDetails.email,
          "hosting",
          client
        );
        // console.log("hosting expired");
      }
    }
  } catch (error) {
    console.error("Error checking expirations and sending emails:", error);
  }
}

// Run the expiration check and email sending every day at midnight
cron.schedule("0 0 * * *", async () => {
  await checkExpirationsAndSendEmails();
});

// run every minute
// cron.schedule("*/10 * * * * *", async () => {
//   await checkExpirationsAndSendEmails();
// });

// post a client
router.post("/", uploads.array("files", 5), async (req, res) => {
  const clientData = req.body.clientData;
  const parsedData = JSON.parse(clientData);
  const { error } = schema.validate(parsedData);

  if (error) {
    return res.status(400).json({ error: error.details[0] });
  }

  try {
    const {
      clientDetails,
      projectDetails,
      domain,
      hosting,
      socials,
      pricing,
      AMC,
      payment,
    } = parsedData;
    const files = req.files.map((file) => ({
      filename: file.originalname,
      path: `${currentRootDirectoryName}/uploads/${file.filename}`,
    }));
    // console.log(files);
    const client = new Client({
      clientDetails,
      projectDetails,
      domain,
      hosting,
      socials,
      files,
      pricing,
      AMC,
      payment,
    });
    console.log(files);
    if (client?.pricing?.partialPaid !== 0) {
      client.payment = "Partial Paid";
    }
    if (client?.pricing?.totalCost === 0) {
      client.payment = "Received";
    }

    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get a client
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await Client.findById(id).populate(
      "projectDetails.projectManagers"
    );
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update a client
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await Client.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    // console.log(client?.pricing?.additionalCosts);
    if (client?.pricing?.partialPaid !== 0) {
      client.payment = "Partial Paid";
    }
    if (client?.pricing?.partialPaid <= 0) {
      client.payment = "Pending";
    }
    if (client?.pricing?.totalCost === 0) {
      client.payment = "Received";
    }
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete a client
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Client.findByIdAndDelete(id);
    res.json({ message: "client deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().populate(
      "projectDetails.projectManagers"
    );
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update a client
// router

module.exports = router;
