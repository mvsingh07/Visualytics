const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const secretkey = "secretkey";
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const ObjectId = mongoose.Types.ObjectId;
const app = express();
const bcrypt = require("bcrypt");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const svg2img = require("svg2img");
const os = require("os");
const axios = require("axios");
const ping = require("ping");
// Enable CORS and body-parser middleware
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const pdf = require("pdfkit");
// const m = require('gm');
// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// In this version removed extra api's and fix the last 7 days filter into it

const MONGO_URI = "mongodb://192.168.1.131:27017/finalDb";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// <-----------------------Dashboard Schemas And API  (START)------------------------------->

const DatasetSchema = new mongoose.Schema({
  unique_uuid_for_db: { type: String, required: true },
  "http.multipart.size": { type: String, required: true },
  "http.multipart.filename": { type: String, required: true },
  "mime.extension": { type: String, required: true },
  transformation_status: { type: String, required: true },
  invokehttpmessage: { type: String, required: true },
  "mime.type": { type: String, required: true },
  filename: { type: String, required: true },
  filetype: { type: String, required: true },
  original_file_md5sum: { type: String, required: true },
  trans_file_md5sum: { type: String, required: true },
  trans_fileType: { type: String, required: true },
  isotimestamp: { type: String, required: true },
  invokehttp_request_duration: { type: String, required: true }, //-----?
  timestamp: { type: String, required: true },
  processing_speed: { type: String, required: true },
  yara_result: { type: String, required: true },
  macro_analysis_result: { type: String, required: true },
  macros: { type: Array, required: true },
  file_path: { type: String, required: true },
  thumbnail_path: { type: String, required: true },
  folderStructure: { type: String, required: true },

  ioc_result: {
    iocresult: {
      domains: [String], // Array inside the ioc_result object
      ipv4_addresses: [String],
      ipv6_addresses: [String],
      urls: [String],
      email_addresses: [String],
    },
  },
});
const Dataset = mongoose.model("filestats_m4", DatasetSchema);

const DatasetSchema2 = new mongoose.Schema({
  FILE_NAME: { type: String, required: true },
  FILE_PATH: { type: String, required: true },
  STATUS: { type: String, required: true },
  FILE_TYPE: { type: String, required: true },
});
const Dataset3 = mongoose.model("manuallytransformed", DatasetSchema2);

function transformDataset(doc) {
  return {
    ...doc,
    UNIQUE_ID: doc["unique_uuid_for_db"],
    FILE_SIZE: doc["http.multipart.size"],
    FILE_NAME: doc["http.multipart.filename"],
    FILE_TYPE: doc["inputFileType"],
    STATUS: doc["transformation_status"],
    FILEPATH: doc["file_path"],
    THUMBNAIL_PATH: doc["thumbnail_path"],
    INVOKEHTTPMESSAGE: doc["invokehttpmessage"] || doc["status-message"],
    MIME_TYPE: doc["mime.type"],
    TRANS_FILE_NAME: doc["filename"],
    TRANS_FILE_TYPE: doc["trans_fileType"] || doc["Trans-Filetype"], //------>
    ISOTIMESTAMP: doc["isotimestamp"],
    PROCESSING_TIME: doc["invokehttp_request_duration"], //---------->
    PROCESSING_SPEED: doc["processing_speed"],
    FILE_MD5SUM: doc["original_file_md5sum"] || doc[""], //------>
    TRANS_FILE_MD5: doc["trans_file_md5sum"] || doc["trans_file_md5"], //------>
    YARA_RESULTS: doc["yara_result"],
    IOCURL: doc.ioc_result?.urls || doc.ioc_result?.ioc_result?.urls || [], // Extracting URLs
    IOCIP: [
      ...(doc.ioc_result?.ipv4_addresses ||
        doc.ioc_result?.ioc_result?.ipv4_addresses ||
        []),
      ...(doc.ioc_result?.ipv6_addresses ||
        doc.ioc_result?.ioc_result?.ipv6_addresses ||
        []),
    ], // Merging ipv4s and ipv6s
    MACROS: doc["macros"], // Extracting URLs
    MACRORESULT: doc["macro_analysis_result"],
    IOCDOMAIN:
      doc.ioc_result?.domains || doc.ioc_result?.ioc_result?.domains || [], // Extracting Domains
    IOCEMAIL:
      doc.ioc_result?.email_addresses ||
      doc.ioc_result?.ioc_result?.email_addresses ||
      [],
  };
}

// Create a Separate schema for saving all the calculated data to be further displayed in the cards
const SpareFileStatsSchema = new mongoose.Schema({
  _id: { type: String, default: "1001" }, // Automatically store calculation time
  lastUpdated: { type: Date, default: Date.now },
  totalFiles: Number,
  successFiles: Number,
  badRequests: Number,
  successRate: Number,
  totalValidFiles: Number,
  totalVolume: String,
  totalVolumeInRange: String,
  finalVolume: String,
  finalVolumeInRange: String,
  successFilesInRange: Number,
  timeDifferenceInDays: Number,
});

const SpareFileStats = mongoose.model("total-files", SpareFileStatsSchema);
module.exports = SpareFileStats;

app.put("/api/spare-filestats", async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      lastUpdated: new Date(), //  Keep track of last update time
    };

    //  Update or create the single document
    const updatedStats = await SpareFileStats.findOneAndUpdate(
      { _id: "1001" }, //  Always updates this single document
      updatedData,
      { upsert: true, new: true } //  Create if not exists, return updated doc
    );

    res.status(200).json({
      success: true,
      message: "Spare file stats updated successfully.",
      data: updatedStats,
    });
  } catch (error) {
    console.error(" Error updating spare file stats:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/**
 * In this version creating a spare schema for mongodb database which is responsible for saving the spare result of the
 * transformed datasets */

app.get("/downloadfromnas", (req, res) => {
  // const filepath = path.join('/mnt/nas_drive', req.query.filepath);
  const filepath = req.query.filepath;
  const filename = path.basename(filepath);

  res.download(filepath, filename, (err) => {
    if (err) {
      console.error("File download error:", err);
      res.status(500).send("Error downloading file");
    }
  });
});

app.post("/run-scripts", (req, res) => {
  exec(
    "python convert_dwg_mdi.py && python nifi2_file_management_module_2.4.py",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing scripts: ${error}`);
        return res
          .status(500)
          .json({ message: "Error executing scripts", error: stderr });
      }
      res.json({ message: "Scripts executed successfully", output: stdout });
      console.log("Python Script Executed");
    }
  );
});

app.get("/api/dataset", async (req, res) => {
  try {
    const datasets = await Dataset.find().lean().sort({ _id: -1 });
    const transformedDatasets = datasets.map(transformDataset);
    res.json(transformedDatasets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// In this version of updated the iostimestamp which was not passed in transformed datasets which was occuring the issue

app.post("/api/dataset", async (req, res) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  try {
    console.log("Received request with dates:", startDate, endDate);
    // Fetch Datasets based on the date range using MongoDB queries
    const filteredDatasets = await Dataset.find({
      isotimestamp: { $gte: startDate, $lte: endDate },
    }).lean();

    const transformedDatasets = filteredDatasets.map(transformDataset);
    res.json(transformedDatasets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/lasthourdataset", async (req, res) => {
  try {
    //  Get current UTC time
    let endDateUTC = new Date();
    let startDateUTC = new Date(endDateUTC.getTime() - 1 * 60 * 60 * 1000); // Last 24 hours

    //  Convert UTC time to IST by adding 5:30 hours (5.5 * 60 * 60 * 1000 milliseconds)
    let endDateIST = new Date(endDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
    let startDateIST = new Date(startDateUTC.getTime() + 5.5 * 60 * 60 * 1000);
    const datasets = await Dataset.find().lean().sort({ _id: -1 });

    const transformedDatasets = datasets.map(transformDataset);

    //  Convert timestamps before filtering
    const filteredDatasets = transformedDatasets.filter((dataset) => {
      if (!dataset.ISOTIMESTAMP) return false;

      const datasetTimestamp = new Date(dataset.ISOTIMESTAMP.trim());
      if (isNaN(datasetTimestamp.getTime())) {
        console.warn(" Invalid Date Found:", dataset.ISOTIMESTAMP);
        return false;
      }

      return (
        datasetTimestamp.getTime() >= startDateIST.getTime() &&
        datasetTimestamp.getTime() <= endDateIST.getTime()
      );
    });

    if (!filteredDatasets.length) {
      return res.status(404).json({
        success: false,
        message: "No datasets found in the last 24 hours (IST)",
      });
    }

    res.json({
      success: true,
      totalRecords: filteredDatasets.length,
      data: filteredDatasets,
    });
  } catch (error) {
    console.error(" Error fetching datasets:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/manualDataset", async (req, res) => {
  try {
    const Dataset = await Dataset3.find().sort({ _id: -1 });
    console.log("GET /api/Datasets - Total Datasets:", Dataset.length);
    res.json(Dataset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// API endpoint to get Datasets based on selected date range

app.post("/api/rangeDataset", async (req, res) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  try {
    console.log("Received request with dates:", startDate, endDate);
    // Fetch Datasets based on the date range using MongoDB queries
    const filteredDatasets = await Dataset.find({
      isotimestamp: { $gte: startDate, $lte: endDate },
    }).lean();
    // Transform the datasets to include FILE_SIZE
    const transformedDatasets = filteredDatasets.map(transformDataset);
    // Return the transformed datasets
    res.json(transformedDatasets);
    return transformedDatasets;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// <------------------------Speedometer API------------------------------------->

app.get("/api/todays-dataset", async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set the time to the start of the day in UTC

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Set the time to the start of the next day in UTC

    const Datasets = await Dataset.find({
      isotimestamp: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString(),
      },
    });

    const transformedDatasets = Datasets.map(transformDataset);

    res.json(transformedDatasets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// <-----------------------Dashboard Schemas And API  (END)------------------------------->//

// <-----------------------LOGIN AND SIGNUP Schemas And API  (START)------------------------------->//

// Define the Mongoose Schema
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true }, // You can modify the required constraint as needed},
    name: { type: String, required: true },
    isDarkMode: { type: Boolean, require: true },
    sidebarExpansion: { type: Boolean, require: true },
    hideTask: { require: true, type: Boolean },
    resetToken: String, // Reset token field
    resetTokenExpiration: Date,
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
  },
  { isotimestamp: true }
);

// Create the Mongoose Model
const UserData = mongoose.model("userdatas", userSchema);
//define the Mongoose Schema for Admin
// Define the Mongoose Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true }, // You can modify the required constraint as needed},
  name: { type: String, required: true },
  isDarkMode: { type: Boolean, require: true },
  sidebarExpansion: { type: Boolean, require: true },
  hideTask: { require: true, type: Boolean },

  resetToken: String, // Reset token field
  resetTokenExpiration: Date,
});

// Create the Mongoose Model
const AdminData = mongoose.model("admindatas", adminSchema);
// Middleware to parse JSON data in the request body
app.use(express.json());

// Route to create a new user and generate a token
app.post("/signup", async (req, res) => {
  const { email, password, name, userType } = req.body;
  console.log("insignup");
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate a unique verification token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Create a new user document with unverified status
  const newUser = new UserData({
    email,
    password: hashedPassword,
    name,
    userType,
    isDarkMode: false,
    sidebarExpansion: false,
    hideTask: false,
    verificationToken, // Save the verification token
    verified: false, // Set the user as unverified
  });

  try {
    // Save the new user data to the database
    await newUser.save();

    // Send a verification email to the user
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "mahivishal28@gmail.com",
        pass: "Vishal@2612",
      },
    });

    const mailOptions = {
      from: '"Turtleneck" <mahivishal28@gmail.com>',
      to: email,
      subject: "User Account Verification",
      html: `<p>Dear ${name},</p>
        <p>Welcome to Turtleneck!</p>
        <p>Please click the following link to verify your email address:</p>
        <a href="http://192.168.1.131:8021/verify/${verificationToken}">Verify Email</a>
        <p>If you did not create an account on Turtleneck, please disregard this email.</p>
        <p>Best regards,</p>
        <p>The Turtleneck Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Signup successful. Verification email sent." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to save user data or send verification email" });
  }
});

// Route to handle email verification
app.post("/verify/:verificationToken", async (req, res) => {
  console.log("Verification route reached");

  const verificationToken = req.params.verificationToken;
  console.log("Verification token is", verificationToken);

  try {
    // Find the user by the verification token
    const user = await UserData.findOne({ verificationToken });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or already verified" });
    }

    // Update the user's status to "verified"
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send a confirmation email to the user
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "mahivishal28@gmail.com",
        pass: "Vishal@2612",
      },
    });

    const mailOptions = {
      from: '"Turtleneck" <mahivishal28@gmail.com>',
      to: user.email, // Define the 'email' variable here
      subject: "User Account Confirmation",
      html: `<p>Dear ${user.name},</p>
  <p>Welcome to Turtleneck!</p>
  <p>Your account has been successfully created, and you can now log in using the credentials you provided during registration.</p>
  <p>Thank you for choosing Turtleneck. </p>
  <p>Best regards,</p>
  <p>The Turtleneck Team</p>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Email creation successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// Route to create a new user and generate a token

// Create a new admin and generate a token
app.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new admin data instance using the AdminData model
    const newAdmin = new AdminData({
      name,
      email,
      password: hashedPassword, // Remember to hash/encrypt the password before saving
      userType,
    });

    // Save the new admin data to the database
    newAdmin.save().then((admin) => {
      // Generate a token for the admin
      const token = jwt.sign({ admin: newAdmin }, "secretkey", {
        expiresIn: "1800s",
      });

      // Send a confirmation email to the admin
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "mahivishal28@gmail.com",
          pass: "Vishal@2612",
        },
      });

      const mailOptions = {
        from: '"Turtleneck" <mahivishal28@gmail.com>',
        to: email, // Admin's email
        subject: "Admin Account Confirmation",
        html: `<p>Dear  ${admin.name},</p>
      <p>Thank you for signing up with our Website!</p>
      <p>Your admin account has been successfully created. You now have access to the following features:</p>
      <ul>
      <li>Create and manage user accounts</li>
        <li>Create Admin accounts</li>
        <li>Access and control administrative settings</li>
      
      </ul>
      <p>Please keep your login credentials secure and do not share them with anyone.</p>
  
      <p>Thank you for choosing our Website. We look forward to assisting you!</p>`,
      };

      transporter.sendMail(mailOptions);

      res.json({ token, message: "Admin registration successful." });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to register admin." });
  }
});

app.post("/refresh-token", async (req, res) => {
  // Extract the token from the request body
  const { token } = req.body;
  try {
    // Verify the token
    const decodedToken = jwt.verify(token, secretkey);

    // Extract user data from the decoded token
    const { authObject } = decodedToken;

    // Find the user in the database based on the extracted data
    let user;
    let admin;
    if (authObject && authObject._id) {
      user = await UserData.findOne({ _id: new ObjectId(authObject._id) });
      admin = await AdminData.findOne({ _id: new ObjectId(authObject._id) });
    }

    if (user) {
      usertype = "user";
    }

    if (admin) {
      userType = "admin";
    }

    if (!user && !admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Reissue a new token with the same user data and updated expiration time
    jwt.sign(
      { authObject },
      secretkey,
      { expiresIn: "1800s" },
      (err, newToken) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to generate new token" });
        } else {
          // Return the new token to the client
          return res.status(200).json({ newToken, userType: usertype });
        }
      }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

//Middleware function to verify the token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.token = token;
    next();
  } else {
    res.status(401).json({ result: "Invalid Token" });
  }
}

// Route to access the user's profile with token verification
app.post("/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(403).json({ result: "Invalid token" });
    } else {
      res.json({
        message: "Profile accessed",
        authData,
      });
    }
  });
});

// Route to retrieve all user data (GET request)
app.get("/users-data", (req, res) => {
  UserData.find({})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error("Error retrieving user data:", err);
      res.status(500).json({ error: "Error retrieving user data" });
    });
});

//Middleware to regenerate the token
function regenerateToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, secretkey, (err, decoded) => {
      if (err) {
        // Token has expired or is invalid, generate a new token
        const user = decoded?.user;
        if (user) {
          jwt.sign(
            { user },
            secretkey,
            { expiresIn: "1800s" },
            (err, newToken) => {
              if (err) {
                res.status(500).json({ error: "Failed to generate token" });
              } else {
                req.token = newToken;
                next();
              }
            }
          );
        } else {
          res.status(401).json({ result: "Invalid Token" });
        }
      } else {
        req.token = token;
        next();
      }
    });
  } else {
    res.status(401).json({ result: "Invalid Token" });
  }
}
// Route to access the user's profile with token verification and regeneration

app.post("/profile", regenerateToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(403).json({ result: "Invalid token" });
    } else {
      res.json({
        message: "Profile accessed",
        authData,
      });
    }
  });
});

// Define a route to check if an email exists
app.get("/check-email-exists/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Check if the email exists in the User collection
    const user = await UserData.findOne({ email });

    if (user) {
      // Email exists as a user
      res.json("user");
    } else {
      // Check if the email exists in the Admin collection
      const admin = await AdminData.findOne({ email });

      if (admin) {
        // Email exists as an admin
        res.json("admin");
      } else {
        // Email does not exist
        res.json("not-found");
      }
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define a route to handle admin and user password reset requests
app.post("/forgot-password", async (req, res) => {
  const { email, newPassword, resetToken } = req.body;

  try {
    // Search for the admin in the Admin collection
    const admin = await AdminData.findOne({ email });
    const user = await UserData.findOne({ email });

    if (!admin && !user) {
      return res.status(404).json({ error: "User not found" });
    }

    let authObject;

    if (user) {
      authObject = user;
    } else {
      authObject = admin;
    }

    if (resetToken) {
      if (!authObject.resetToken || authObject.resetToken !== resetToken) {
        return res
          .status(401)
          .json({ error: "Invalid or expired reset token" });
      }

      if (
        authObject.resetTokenExpiration &&
        authObject.resetTokenExpiration < Date.now()
      ) {
        return res
          .status(401)
          .json({ error: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      authObject.resetToken = undefined;
      authObject.resetTokenExpiration = undefined;
      authObject.password = hashedPassword;
      console.log("Saved reset token to database:", authObject.resetToken);
      await authObject.save();

      return res.json({ message: "Password reset successful" });
    } else {
      const resetToken = crypto.randomBytes(20).toString("hex");

      const resetTokenExpiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      authObject.resetToken = resetToken;
      authObject.resetTokenExpiration = resetTokenExpiration;
      console.log("Saved reset token to database:", authObject.resetToken);
      await authObject.save();

      const transporter = nodemailer.createTransport({
        service: "Gmail", // Use your email service provider
        auth: {
          user: "mahivishal28@gmail.com", // Replace with your email address
          pass: "Vishal@2612",
        },
      });

      const mailOptions = {
        from: "Turtleneck <mahivishal28@gmail.com>", // Replace with your email address
        to: email,
        subject: `${user ? "User" : "Admin"} Password Reset`, // Differentiate based on the object type
        html: `<p>You are receiving this email because you (or someone else) has requested the reset of the password for your ${
          user ? "user" : "admin"
        } account.</p>
             <p>Please click on the following link, or paste this into your browser to complete the process:</p>
             <a href="http://192.168.1.131:8021/reset-password?resetToken=${resetToken}">Reset Password</a>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            error: `Failed to send ${
              user ? "user" : "admin"
            } password reset email`,
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.json({
            message: `${
              user ? "User" : "Admin"
            } password reset email sent successfully`,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error handling password reset:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Define a route to handle password reset confirmation for admin and user
app.get("/forgot-password", async (req, res) => {
  const resetToken = req.query.resetToken; // Access the resetToken from the query parameter
  console.log("Token from password reset link:", resetToken);

  try {
    // Search for the admin or user by reset token
    const admin = await AdminData.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    const user = await UserData.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!admin && !user) {
      return res
        .status(404)
        .json({ error: "Admin or user not found or invalid token" });
    }

    // You can customize the response or redirection based on whether it's an admin or user
    if (admin) {
      // Redirect to an admin-specific password reset page
      res.redirect(
        `http://192.168.1.131:8021/admin-reset-password?resetToken=${resetToken}`
      );
    } else if (user) {
      // Redirect to a user-specific password reset page
      res.redirect(
        `http://192.168.1.131:8021/user-reset-password?resetToken=${resetToken}`
      );
    }
  } catch (error) {
    console.error("Error handling password reset confirmation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/update-password-by-token", async (req, res) => {
  const { newPassword, resetToken } = req.body;
  console.log("Provided Reset Token:", resetToken);
  try {
    let foundUser;

    // Search for the admin by reset token
    const admin = await AdminData.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() }, // Check if the token has not expired
    });

    if (!admin) {
      // If admin is not found, search for the user
      foundUser = await UserData.findOne({
        resetToken,
        resetTokenExpiration: { $gt: Date.now() }, // Check if the token has not expired
      });

      if (!foundUser) {
        return res
          .status(401)
          .json({ error: "Invalid or expired reset token" });
      }
    }

    const target = admin || foundUser; // Use the found admin or user

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's or admin's password with the new one
    target.password = hashedPassword;
    target.resetToken = undefined; // Clear the reset token after password update
    target.resetTokenExpiration = undefined; // Clear the reset token expiration after password update
    await target.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database to find the user or admin with the provided email
    const user = await UserData.findOne({ email });
    const admin = await AdminData.findOne({ email });

    if (!user && !admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Determine the object (user or admin) and usertype
    let authObject;
    let usertype;

    if (user) {
      authObject = user;
      usertype = "user";
    } else {
      authObject = admin;
      usertype = "admin";
    }

    // Logging details
    const logData = {
      timestamp: new Date().toISOString(),
      authObject,
    };

    const logFileName = "user_logs.log";

    const logFilePath = path.join(__dirname, "logs", logFileName);

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, authObject.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a token for the user or admin and send it back in the response
    jwt.sign(
      { authObject },
      secretkey,
      { expiresIn: "1800s" },
      (err, token) => {
        if (err) {
          return res.status(500).json({ error: "Failed to generate token" });
        } else {
          return res.json({ token, userType: usertype });
        }
      }
    );
    // Append log data to log file
    fs.appendFile(logFilePath, formatLogEntry(logData) + "\n", (err) => {
      if (err) {
        console.error("Error writing to log file:", err);
      }
    });

    function formatLogEntry(logData) {
      // Convert logData object to a formatted JSON string with each property in a different line
      return JSON.stringify(logData, null, 2).replace(/\\n/g, "\n");
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

//---------------for fetching user name-----------------------------------

function authenticateMiddleware(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (typeof authorizationHeader !== "undefined") {
    const tokenParts = authorizationHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = tokenParts[1];

    jwt.verify(token, secretkey, (error, decodedToken) => {
      if (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = decodedToken; // Set user data in request object
      next();
    });
  } else {
    res.status(401).json({ message: "Authentication token missing" });
  }
}

// Define Schema
const applicationSettingsSchema = new mongoose.Schema({
  inputFolder: String,
  outputFolder: String,
  multipart_file_size: String,
  file_transformation_timeout: String,
  notificationCount: String,
});

const ApplicationSettings = mongoose.model(
  "ApplicationSettings",
  applicationSettingsSchema
);

app.get("/api/appSettings", async (req, res) => {
  try {
    const appSettings = await ApplicationSettings.find({});

    res.json(appSettings);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// API endpoint to save input folder
app.post("/api/input-folder", (req, res) => {
  const { inputFolder } = req.body;
  ApplicationSettings.findOneAndUpdate(
    {},
    { inputFolder },
    { upsert: true, new: true }
  )
    .exec()
    .then((doc) => {
      console.log("Input folder saved successfully:", doc);
      res.status(200).send("Input folder saved successfully");
    })
    .catch((err) => {
      console.error("Error saving input folder:", err);
      res.status(500).send("Internal Server Error");
    });
});

// API endpoint to save output folder
app.post("/api/output-folder", (req, res) => {
  const { outputFolder } = req.body;
  ApplicationSettings.findOneAndUpdate(
    {},
    { outputFolder },
    { upsert: true, new: true }
  )
    .exec()
    .then((doc) => {
      console.log("Output folder saved successfully:", doc);
      res.status(200).send("Output folder saved successfully");
    })
    .catch((err) => {
      console.error("Error saving output folder:", err);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/api/changeTimeout", async (req, res) => {
  const { file_transformation_timeout } = req.body;

  try {
    // Update file_transformation_timeout in ApplicationSettings
    const updatedSettings = await ApplicationSettings.findOneAndUpdate(
      {},
      { file_transformation_timeout },
      { upsert: true, new: true }
    );

    // Retrieve multipart_file_size from ApplicationSettings
    const multipart_file_size = updatedSettings.multipart_file_size;
    console.log("multipart file_size: ", multipart_file_size);

    // Python scripts information
    const pythonExecutable = "python";
    const pythonScript1 = "update_nifi1_processor.py";
    const pythonScript2 = "update_nifi2_processor.py";

    // Flags to track status of Python processes
    let pythonProcess1Completed = false;
    let pythonProcess2Completed = false;

    // Function to check completion status and send response if both processes are completed
    const checkCompletionAndSendResponse = () => {
      if (pythonProcess1Completed && pythonProcess2Completed) {
        res.status(200).json({ message: "Timeout updated" });
      }
    };

    // Execute Python script 1
    const pythonProcess1 = exec(
      `${pythonExecutable} ${pythonScript1} "${file_transformation_timeout}" "${multipart_file_size}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing python script 1: ${error}`);
          res.status(500).json({ message: "Internal Server Error" });
        } else {
          console.log(`stdout for nifi-1: ${stdout}`);
          pythonProcess1Completed = true;
          checkCompletionAndSendResponse();
        }
      }
    );

    // Execute Python script 2
    const pythonProcess2 = exec(
      `${pythonExecutable} ${pythonScript2} "${file_transformation_timeout}" "${multipart_file_size}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing python script 2: ${error}`);
          res.status(500).json({ message: "Internal Server Error" });
        } else {
          console.log(`stdout for nifi-2: ${stdout}`);
          pythonProcess2Completed = true;
          checkCompletionAndSendResponse();
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/api/changeFilesize", async (req, res) => {
  // const { file_transformation_timeout } = req.body;
  const { multipart_file_size } = req.body;
  try {
    // Update file_transformation_timeout in ApplicationSettings
    const updatedSettings = await ApplicationSettings.findOneAndUpdate(
      {},
      { multipart_file_size },
      { upsert: true, new: true }
    );

    // Retrieve multipart_file_size from ApplicationSettings
    const file_transformation_timeout =
      updatedSettings.file_transformation_timeout;
    console.log("file_transformation_timeout: ", file_transformation_timeout);

    const pythonExecutable = "python";
    const pythonScript1 = "update_nifi2_processor.py";
    const pythonScript2 = "update_nifi2_processor.py";

    // Flags to track status of Python processes
    let pythonProcess1Completed = false;
    let pythonProcess2Completed = false;

    // Function to check completion status and send response if both processes are completed
    const checkCompletionAndSendResponse = () => {
      if (pythonProcess1Completed && pythonProcess2Completed) {
        res.status(200).json({ message: "Timeout updated" });
      }
    };

    const pythonProcess1 = exec(
      `${pythonExecutable} ${pythonScript1} "${file_transformation_timeout}" "${multipart_file_size}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing python script 1: ${error}`);
          res.status(500).json({ message: "Internal Server Error" });
        } else {
          console.log(`stdout for nifi-1: ${stdout}`);
          pythonProcess1Completed = true;
          checkCompletionAndSendResponse();
        }
      }
    );

    // Execute Python script 2
    const pythonProcess2 = exec(
      `${pythonExecutable} ${pythonScript2} "${file_transformation_timeout}" "${multipart_file_size}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing python script 2: ${error}`);
          res.status(500).json({ message: "Internal Server Error" });
        } else {
          console.log(`stdout for nifi-2: ${stdout}`);
          pythonProcess2Completed = true;
          checkCompletionAndSendResponse();
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// app.post('/api/changeFilesize', (req, res) => {
//   const { multipart_file_size} = req.body;

//   ApplicationSettings.findOneAndUpdate({}, { multipart_file_size }, { upsert: true, new: true })
//     .exec()
//     .then(doc => {
//       console.log('Filesize saved successfully:', doc);
//       res.status(200).json({message:'Filesize saved successfully',doc});
//     })
//     .catch(err => {
//       console.error('Error saving Filesize:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     });
// });

app.get(
  "/api/user",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    const user = await getUserInfoFromDatabase(
      new ObjectId(req.user.authObject._id)
    ); // Implement this function
    const admin = await getAdminInfoFromDatabase(
      new ObjectId(req.user.authObject._id)
    ); // Implement this function

    if (user) {
      // account=user;
      res.json({
        name: user.name,
        email: user.email,
        userType: user.userType,
        isDarkMode: user.isDarkMode,
        sidebarExpansion: user.sidebarExpansion,
        hideTask: user.hideTask,
      });
    } else if (admin) {
      // account=admin;
      res.json({
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        isDarkMode: admin.isDarkMode,
        sidebarExpansion: admin.sidebarExpansion,
        hideTask: admin.hideTask,
      }); // Return the admin's name
    } else {
      res.status(404).json({ message: "User not found" });
    }
  }
);

async function getUserInfoFromDatabase(loggedInUserId) {
  try {
    // console.log("in usergetinfo");
    let user = await UserData.findOne({ _id: new ObjectId(loggedInUserId) });

    if (!user) {
      // If user is not found in UserData, try to find in AdminData
      user = await AdminData.findOne({ _id: new ObjectId(loggedInUserId) });
    }

    // console.log('Retrieved user:', user);
    return user;
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return null;
  }
}

async function updateSettingsInDatabase(userId, newValue) {
  try {
    // Find the user by ID and update the name
    let updatedUser = await UserData.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { sidebarExpansion: newValue } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      updatedUser = await AdminData.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { sidebarExpansion: newValue } },
        { new: true } // Return the updated document
      );
    }
    console.log(updatedUser);
    // Log the updated user for debugging (optional)
    // console.log('Updated user:', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}

async function updateProfileSettingsInDatabase(userId, newValue) {
  try {
    // Find the user by ID and update the name
    let updatedUser = await UserData.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { hideTask: newValue } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      updatedUser = await AdminData.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { hideTask: newValue } },
        { new: true } // Return the updated document
      );
    }
    console.log(updatedUser);
    // Log the updated user for debugging (optional)
    // console.log('Updated user:', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}
async function updateDarkModeInDatabase(userId, newValue) {
  try {
    // Find the user by ID and update the name
    let updatedUser = await UserData.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { isDarkMode: newValue } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      updatedUser = await AdminData.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { isDarkMode: newValue } },
        { new: true } // Return the updated document
      );
    }
    console.log(updatedUser);
    // Log the updated user for debugging (optional)
    // console.log('Updated user:', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}
async function updateUserNameInDatabase(userId, newname) {
  try {
    // Find the user by ID and update the name
    let updatedUser = await UserData.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { name: newname } },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      updatedUser = await AdminData.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { name: newname } },
        { new: true } // Return the updated document
      );
    }
    console.log(updatedUser);
    // Log the updated user for debugging (optional)
    // console.log('Updated user:', updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}

async function updatePassword(userId, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let updatedUser = await AdminData.findOneAndUpdate(
      {
        _id: new ObjectId(userId),
      },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!updatedUser) {
      updatedUser = await UserData.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword } },
        { new: true }
      );
    }
    console.log(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}

async function updateUserSettingsInDatabase(userId, newData) {
  try {
    // Construct the update object based on the filled fields in newData
    const updateObject = {};
    if (newData.isDarkMode) {
      updateObject.isDarkMode = newData.isDarkMode;
    }
    if (newData.sidebarExpansion) {
      updateObject.sidebarExpansion = newData.sidebarExpansion;
    }
    if (newData.hideTask) {
      updateObject.hideTask = newData.hideTask;
    }

    // If there are no fields to update, return early
    if (Object.keys(updateObject).length === 0) {
      console.log("No fields to update.");
      return null;
    }

    // Find the user by ID and update the specified fields
    let updatedUser = await UserData.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateObject },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      updatedUser = await AdminData.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateObject },
        { new: true } // Return the updated document
      );
    }

    // Log the updated user for debugging (optional)
    console.log("Updated user:", updatedUser);

    return updatedUser;
  } catch (error) {
    console.error("Error updating user info:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}

//--------------for fetching admin name--------------------------------------------------

// API route to fetch admin name
app.get(
  "/api/admin",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    try {
      const loggedInAdminId = req.user.authObject._id; // Replace with the correct property

      // Query your MongoDB database to retrieve the admin's information
      // Here, assuming you have a MongoDB collection called 'adminData'
      const admin = await getAdminInfoFromDatabase(
        new ObjectId(loggedInAdminId)
      ); // Implement this function

      if (admin) {
        res.json({ name: admin.name, email: admin.email }); // Return the admin's name
      } else {
        res.status(404).json({ message: "Admin not found" });
      }
    } catch (error) {
      console.error("Error fetching admin information:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

async function getAdminInfoFromDatabase(loggedInAdminId) {
  try {
    // console.log("in admininfoget");
    // Assuming you have a model called AdminData
    const admin = await AdminData.findOne({
      _id: new ObjectId(loggedInAdminId),
    });
    // console.log('Retrieved admin:', admin);
    return admin;
  } catch (error) {
    console.error("Error retrieving admin information:", error);
    return null;
  }
}

//API for pdf generation

app.post("/api/create-bar", async (req, res) => {
  try {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">`;

    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const selectedFileType = req.body.selectedFileType;
    const selectedTransFileType = req.body.selectedTransFileType;
    const selectedStatusType = req.body.selectedStatusType;

    const baseQuery = {};

    if (startDate && endDate) {
      baseQuery.isotimestamp = { $gte: startDate, $lte: endDate };
    }

    // Check if selectedFileType is provided and add it to the base query
    // if (selectedFileType) {
    //   baseQuery.FILE_TYPE = selectedFileType;
    // }

    // Check if selectedTransFileType is provided and add it to the base query
    // if (selectedTransFileType) {
    //   baseQuery.TRANS_FILE_TYPE = selectedTransFileType;
    // }

    if (selectedStatusType) {
      baseQuery.STATUS = selectedStatusType;
    }

    const data1 = await fetchDataFromDb(baseQuery);

    const fileTypeData = {};
    data1.forEach((item) => {
      const fileType = item.FILE_TYPE;
      const fileSizeStr = item.FILE_SIZE;

      // Convert size to megabytes using the provided function
      const fileSizeMB = convertSizeToMegaBytes(fileSizeStr);

      if (!fileTypeData[fileType]) {
        fileTypeData[fileType] = {
          count: 0,
          totalSize: 0,
        };
      }

      fileTypeData[fileType].count++; // Increment the count for the file type
      fileTypeData[fileType].totalSize += fileSizeMB; // Update the total size for the file type
    });

    const tableData = Object.keys(fileTypeData).map((fileType) => {
      const { count, totalSize } = fileTypeData[fileType];

      return {
        fileType,
        fileCount: count,
        totalSizeMB: totalSize,
      };
    });

    const sortedTableData = tableData.sort((a, b) => b.fileCount - a.fileCount);

    async function fetchDataFromDb(baseQuery) {
      try {
        // Use the baseQuery to filter data based on selected filters
        // const filteredDatasets = await Dataset.find(baseQuery);
        const filteredDatasets = await Dataset.find({
          baseQuery,
        }).lean();

        // Transform the datasets to include FILE_SIZE
        const transformedDatasets = filteredDatasets.map(transformDataset);

        // Return the transformed datasets
        // res.json(transformedDatasets);
        return transformedDatasets;
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        throw error;
      }
    }

    const barWidth = 30; // Decreased bar width
    const spacing = 14; // Increased spacing

    const chartX = 50;
    const chartY = 50;
    const chartWidth = 500;
    const chartHeight = 200;
    const maxDataValue = Math.max(...tableData.map((item) => item.fileCount));
    const sliceColors = [
      " #87abaf",
      "#8fb1b6",
      "#96b7bc",
      "#9ebdc2",
      "#a5c3c8",
      "#adc8ce",
      "#b4ced4",
      "#bcd4da",
      "#c4d9e0",
    ];

    const titleX = chartX;
    const titleY = chartY - 30; // Adjusted for title position
    svg += `<text x="${titleX}" y="${titleY}" font-size="20" text-anchor="start">FILE COUNT STATISTIC</text>`;

    sortedTableData.forEach((item, index) => {
      const x = chartX + index * (barWidth + spacing); // Adjusted for spacing
      const barHeight = (item.fileCount / maxDataValue) * chartHeight;
      const y = chartY + chartHeight - barHeight;
      const sliceColor = sliceColors[index % sliceColors.length];
      // Draw the bar
      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${sliceColor}" />`;

      // Add label inside the bar and below it
      const labelX = x + barWidth / 2;
      const labelY = y + barHeight + 20; // Adjusted for label below the bar
      svg += `<text x="${labelX}" y="${labelY}" font-size="16" text-anchor="middle">${item.fileType}</text>`; // Use item._id for the name

      const countX = labelX;
      const countY = y - 10;
      svg += `<text x="${countX}" y="${countY}" font-size="14" text-anchor="middle">${item.fileCount}</text>`;
    });

    svg += `</svg>`;

    // Convert the SVG to an image (e.g., PNG)
    svg2img(svg, function (error, buffer) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // Save the image as a file
        fs.writeFileSync("bar_chart.png", buffer);
        res.sendFile("bar_chart.png", { root: __dirname });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Bar chart image saved as chart.png");
  }
});

app.post("/api/pie-chart", async (req, res) => {
  try {
    const startDate = req.body.startDate;

    const endDate = req.body.endDate;

    const selectedFileType = req.body.selectedFileType;

    const selectedTransFileType = req.body.selectedTransFileType;

    const selectedStatusType = req.body.selectedStatusType;

    const baseQuery = {};

    if (startDate && endDate) {
      baseQuery.isotimestamp = { $gte: startDate, $lte: endDate };
    }

    if (selectedStatusType) {
      baseQuery.STATUS = selectedStatusType;
    }

    const data1 = await fetchDataFromDb(baseQuery);

    const fileTypeData = {};

    data1.forEach((item) => {
      const fileType = item.FILE_TYPE;
      const fileSizeStr = item.FILE_SIZE;

      // Convert size to megabytes using the provided function
      const fileSizeMB = convertSizeToMegaBytes(fileSizeStr);

      if (!fileTypeData[fileType]) {
        fileTypeData[fileType] = {
          count: 0,
          totalSize: 0,
        };
      }
      fileTypeData[fileType].count++; // Increment the count for the file type

      fileTypeData[fileType].totalSize += fileSizeMB; // Update the total size for the file type
    });

    const tableData = Object.keys(fileTypeData).map((fileType) => {
      const { count, totalSize } = fileTypeData[fileType];

      return {
        fileType,
        fileCount: count,
        totalSizeMB: totalSize,
      };
    });
    const sortedTableData = tableData.sort(
      (a, b) => b.totalSizeMB - a.totalSizeMB
    );

    async function fetchDataFromDb(baseQuery) {
      try {
        // Use the baseQuery to filter data based on selected filters
        // const filteredDatasets = await Dataset.find(baseQuery);
        const filteredDatasets = await Dataset.find({
          baseQuery,
        }).lean();

        // Transform the datasets to include FILE_SIZE
        const transformedDatasets = filteredDatasets.map(transformDataset);

        // Return the transformed datasets
        // res.json(transformedDatasets);

        return transformedDatasets;
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        throw error;
      }
    }

    // Generate the SVG for the pie chart
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">`;

    const chartX = 50;
    const chartY = 50;
    const titleX = chartX;
    const titleY = chartY - 20; // Adjusted for title position
    svg += `<text x="${titleX}" y="${titleY}" font-size="20" text-anchor="start">FILE VOLUME CHART</text>`;

    const centerX = 300;
    const centerY = 200;
    const radius = 150;
    let startAngle = 0;

    const sliceColors = [
      "#87abaf",
      "#8fb1b6",
      "#96b7bc",
      "#9ebdc2",
      "#a5c3c8",
      "#adc8ce",
      "#b4ced4",
      "#bcd4da",
      "#c4d9e0",
    ];

    sortedTableData.forEach((item, index) => {
      const fileType = item.fileType;
      const totalSizeMB = item.totalSizeMB;

      // Calculate the angle for the pie slice based on total size
      const percentage = (totalSizeMB / getTotalSizeInMB(tableData)) * 100;
      const endAngle = startAngle + percentage * 3.6;

      // Calculate slice endpoints
      const x1 =
        centerX + radius * Math.cos((startAngle - 90) * (Math.PI / 180));
      const y1 =
        centerY + radius * Math.sin((startAngle - 90) * (Math.PI / 180));
      const x2 = centerX + radius * Math.cos((endAngle - 90) * (Math.PI / 180));
      const y2 = centerY + radius * Math.sin((endAngle - 90) * (Math.PI / 180));

      // Large arc flag (for arcs larger than 180 degrees)
      const largeArcFlag = 0;

      const sliceColor = sliceColors[index % sliceColors.length];

      console.log("slice color:", sliceColor);

      // Draw the pie slice with the assigned color
      svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${sliceColor}" />`;

      svg += `<path d="M ${centerX} ${centerY} L ${x1} ${y1}" stroke="#fff" fill="none" />`;
      // Calculate the label position for the pie slice
      const labelAngle = startAngle + (percentage / 2) * 3.6;
      const labelRadius = radius / 1.2; // Adjust this factor to control label distance from the center
      const labelX =
        centerX + labelRadius * Math.cos((labelAngle - 90) * (Math.PI / 180));
      const labelY =
        centerY + labelRadius * Math.sin((labelAngle - 90) * (Math.PI / 180));

      // Add the label and value to the pie slice
      svg += `<text x="${labelX}" y="${labelY}" font-size="14" text-anchor="middle">${fileType}</text>`;
      // svg += `<text x="${labelX}" y="${labelY + 20}" font-size="10" text-anchor="middle">${totalSizeMB.toFixed(0)} MB</text>`;

      // Update the starting angle for the next slice
      startAngle = endAngle;
    });

    // Close the SVG element
    svg += `</svg>`;

    svg2img(svg, function (error, buffer) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // Save the image as a file
        fs.writeFileSync("pie_chart.png", buffer);
        res.sendFile("pie_chart.png", { root: __dirname });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Bar chart image saved as pie_chart.png");
  }
});

app.post("/download-report", async (req, res) => {
  // Create a new PDF document
  const doc = new pdf();
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const dateRange = `Date Range: ${startDate} to ${endDate}`;

  const selectedFileType = req.body.selectedFileType;
  const selectedTransFileType = req.body.selectedTransFileType;
  const selectedStatusType = req.body.selectedStatusType;

  const filter1 = `Selected Input File Type: ${selectedFileType}`;
  const filter2 = `Selected Trans File Type: ${selectedTransFileType}`;
  const filter3 = `Selected Status Type: ${selectedStatusType}`;

  const borderWidth = 10; // Adjust the border width as needed
  const borderColor = "#006666"; // Adjust the border color as needed

  doc
    .rect(0, 0, doc.page.width, doc.page.height) // (x, y, width, height)
    .lineWidth(borderWidth)
    .strokeColor(borderColor)
    .stroke();

  doc.font("Helvetica-Bold");
  doc.fontSize(20).text("DATASET REPORT", { align: "center" });
  doc.fontSize(25).text("FILE TRANSFORMATION SYSTEM", 100, 110);
  doc.fontSize(15).text("This is an Automated Report", 200, 160);
  doc.image("report_logo.jpeg", { fit: [200, 200], align: "center" });
  doc.fontSize(15).text("FILTERS APPLIED", 50, 380);

  const positionx = 50;
  let positiony = 410;
  const plus = 30;

  if (startDate && endDate) {
    doc.fontSize(12).text(dateRange, 50, positiony);
    positiony += plus;
  }

  if (selectedFileType) {
    doc.fontSize(12).text(filter1, 50, positiony);
    positiony += plus;
  }

  if (selectedTransFileType) {
    doc.fontSize(12).text(filter2, 50, positiony);
    positiony += plus;
  }

  if (selectedStatusType) {
    doc.fontSize(12).text(filter3, 50, positiony);
    positiony += plus;
  }

  doc.info.Title = "Dataset Report";
  doc.info.Author = "FTS";
  doc.info.Subject = "File Statistics";

  doc.moveDown(); // Move down after writing the date range

  // Set response headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  const rowHeight = 42;
  const margin = 20;
  const topMargin = 60;
  let currentPageHeight = topMargin;
  const maxPageHeight = doc.page.height - margin;

  doc.pipe(res);

  try {
    console.log("Received request with dates:", startDate, endDate);

    // Create a base query for the date range
    const baseQuery = {};

    if (startDate && endDate) {
      baseQuery.isotimestamp = { $gte: startDate, $lte: endDate };
    }

    if (selectedFileType) {
      baseQuery.FILE_TYPE = selectedFileType;
    }

    if (selectedTransFileType) {
      baseQuery.TRANS_FILE_TYPE = selectedTransFileType;
    }

    if (selectedStatusType) {
      baseQuery.STATUS = selectedStatusType;
    }

    const pageSize = 15;
    let skip = 0;

    const length = await fetchSizeFromRange(pageSize, skip, baseQuery);
    doc.fontSize(15).text(`Number of Records: ${length}`, 220, 580);
    doc.addPage();

    const data1 = await fetchDataRangeFilter(baseQuery);

    if (data1.length === 0) {
      console.log("No data found for the specified filters");
    }

    const fileTypeData = {};

    // Function to draw a cell with text
    function drawCell(text, x, y, width, height, options = {}) {
      const {
        fontSize = 10,
        fontWeight = "normal",
        fontStyle = "normal",
      } = options;

      doc.rect(x, y, width, height).stroke();

      const textOptions = {
        width: width - 10,
        height: height - 10,
        size: fontSize,
        weight: fontWeight,
        style: fontStyle,
      };
      doc.font("Helvetica", fontStyle).fontSize(fontSize);
      doc.text(text, x + 5, y + 5, textOptions);
    }

    data1.forEach((item) => {
      const fileType = item.FILE_TYPE;
      const fileSizeStr = item.FILE_SIZE;
      const fileSizeMB = convertSizeToMegaBytes(fileSizeStr);

      if (!fileTypeData[fileType]) {
        fileTypeData[fileType] = { count: 0, totalSize: 0 };
      }

      fileTypeData[fileType].count++;
      fileTypeData[fileType].totalSize += fileSizeMB;
    });

    const totalSizeInMB = Object.values(fileTypeData).reduce(
      (total, fileType) => total + fileType.totalSize,
      0
    );

    const tableData = Object.keys(fileTypeData).map((fileType) => {
      const { count, totalSize } = fileTypeData[fileType];
      const percentage = (totalSize / totalSizeInMB) * 100;
      return { fileType, fileCount: count, totalSizeMB: totalSize, percentage };
    });

    doc.font("Helvetica-Bold").fontSize(9);
    const sortedTableData = tableData.sort((a, b) => b.fileCount - a.fileCount);
    const headings = ["fileType", "fileCount", "totalSizeMB", "percentage"];
    const headings2 = ["FILE TYPE", "COUNT", "VOLUME (MB)", "VOLUME %"];
    const columnWidths = [145, 145, 145, 145];

    // Add table headings
    headings2.forEach((heading, index) => {
      const x =
        margin +
        columnWidths.slice(0, index).reduce((total, width) => total + width, 0);
      const y = currentPageHeight;
      drawCell(heading, x, y, columnWidths[index], rowHeight);
    });

    currentPageHeight += rowHeight;

    // Add data with pagination
    sortedTableData.forEach((item, rowIndex) => {
      if (currentPageHeight + rowHeight > maxPageHeight) {
        doc.addPage();
        currentPageHeight = margin;
      }

      headings.forEach((heading, colIndex) => {
        const x =
          margin +
          columnWidths
            .slice(0, colIndex)
            .reduce((total, width) => total + width, 0);
        const y = currentPageHeight;

        let value = item[heading];
        if (heading === "totalSizeMB" || heading === "percentage") {
          value = value.toFixed(2);
        }

        drawCell(value, x, y, columnWidths[colIndex], rowHeight);
      });

      currentPageHeight += rowHeight;
      doc.moveDown();
    });

    function convertSizeToMegaBytes(size) {
      const [value, unit] = size.split(" ");
      const sizeInMegaBytes = parseFloat(value);
      if (!unit) {
        return sizeInMegaBytes / (1024 * 1024);
      }
      const unitLower = unit.toLowerCase();
      if (unitLower === "kb") {
        return sizeInMegaBytes / 1024;
      } else if (unitLower === "mb") {
        return sizeInMegaBytes;
      } else if (unitLower === "b") {
        return sizeInMegaBytes / (1024 * 1024);
      } else {
        return sizeInMegaBytes / (1024 * 1024);
      }
    }

    async function fetchDataFromDb(baseQuery) {
      try {
        const filteredDatasets = await Dataset.find({ baseQuery }).lean();
        const transformedDatasets = filteredDatasets.map(transformDataset);
        return transformedDatasets;
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        throw error;
      }
    }

    // doc.image('pie_chart.png', 0, currentPageHeight + 20, { width: 300, height: 200 });
    // doc.image('bar_chart.png', 300, currentPageHeight + 20, { width: 300, height: 250 });

    doc
      .rect(0, 0, doc.page.width, doc.page.height) // (x, y, width, height)
      .lineWidth(borderWidth)
      .strokeColor(borderColor)
      .stroke();

    doc.addPage();

    // Pagination variables for detailed data
    let detailCurrentPageHeight = margin;

    while (true) {
      const data = await fetchDataRangeFilter(pageSize, skip, baseQuery);

      if (data.length === 0) {
        break;
      }

      doc.moveDown();

      const headings = [
        "FILE_NAME",
        "isotimestamp",
        "FILE_TYPE",
        "TRANS_FILE_TYPE",
        "FILE_SIZE",
        "PROCESSING_TIME",
        "PROCESSING_SPEED",
        "MIME_TYPE",
      ];
      const headings2 = [
        "NAME",
        "DATE",
        "INPUT TYPE",
        "OUTPUT TYPE",
        "SIZE",
        "T.TIME",
        "SPEED",
        "MIME TYPE",
      ];
      const columnWidths = [40, 60, 80, 40, 50, 40, 50, 150];

      doc.font("Helvetica").fontSize(9);

      const tableWidth = columnWidths.reduce(
        (total, width) => total + width,
        0
      );

      function drawDetailCell(text, x, y, width, height) {
        doc.rect(x, y, width, height).stroke();
        const textOptions = { width: width - 10, height: height - 10 };
        doc.text(text, x + 5, y + 5, textOptions);
      }

      headings2.forEach((heading, index) => {
        const x =
          margin +
          columnWidths
            .slice(0, index)
            .reduce((total, width) => total + width, 0);
        const y = detailCurrentPageHeight;
        drawDetailCell(heading, x, y, columnWidths[index], rowHeight);
      });

      detailCurrentPageHeight += rowHeight;

      data.forEach((item, rowIndex) => {
        if (detailCurrentPageHeight + rowHeight > maxPageHeight) {
          doc.addPage();
          detailCurrentPageHeight = margin;
        }

        headings.forEach((heading, colIndex) => {
          const x =
            margin +
            columnWidths
              .slice(0, colIndex)
              .reduce((total, width) => total + width, 0);
          const y = detailCurrentPageHeight;

          let value = item[heading];
          if (heading === "isotimestamp") {
            value = value.slice(0, 10);
          }

          drawDetailCell(value, x, y, columnWidths[colIndex], rowHeight);
        });

        detailCurrentPageHeight += rowHeight;
        doc.moveDown();
      });

      skip += pageSize;
    }

    doc.end();
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/download-report", async (req, res) => {
  // Create a new PDF document
  const doc = new pdf();
  const borderWidth = 10; // Adjust the border width as needed
  const borderColor = "#006666"; // Adjust the border color as needed
  const pageSize1 = 13;
  let skip1 = 0;
  const length = await fetchSize(pageSize1, skip1);
  // Draw a rectangle to create the border around the page

  doc
    .rect(0, 0, doc.page.width, doc.page.height) // (x, y, width, height)
    .lineWidth(borderWidth)
    .strokeColor(borderColor)
    .stroke();

  doc.font("Helvetica-Bold");

  doc.fontSize(20).text("DATASET REPORT", { align: "center" });

  doc.fontSize(25).text("FILE TRANSFORMATION SYSTEM", 100, 120);

  doc.fontSize(15).text("This is an Automated Report", 220, 170);

  // Calculate the center of the page
  const centerX = doc.page.width / 2;

  // Image: 'report_logo.jpeg' in the center
  doc.image("report_logo.jpeg", centerX - 100, 250, {
    width: 200,
    height: 200,
  });

  doc.fontSize(15).text(`Number of Records:${length}`, 220, 600);
  doc.addPage();

  doc.info.Title = "Dataset Report";
  doc.info.Author = "FTS";
  doc.info.Subject = "File Statistics";

  // Set response headers for PDF download
  res.setHeader("Content-Type", "application/pdf");

  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  const rowHeight = 42;

  // Define page margins
  const margin = 20;
  const topMargin = 60;

  doc.pipe(res);

  try {
    const data12 = await fetchDataFromDatabase();

    const fileTypeData = {};

    doc.fontSize(20).text(`FILE TYPE STATISTICS `, 200, 20);

    // Function to draw a cell with text
    function drawCell(text, x, y, width, height, options = {}) {
      const {
        fontSize = 10,
        fontWeight = "normal",
        fontStyle = "normal",
      } = options;

      doc.rect(x, y, width, height).stroke();

      // Adjust the height based on text wrapping
      const textOptions = {
        width: width - 10,
        height: height - 10,
        size: fontSize,
        weight: fontWeight,
        style: fontStyle,
      };

      doc.font("Helvetica", fontStyle).fontSize(fontSize);
      doc.text(text, x + 5, y + 5, textOptions);
    }

    data12.forEach((item) => {
      const fileType = item.FILE_TYPE;
      const fileSizeStr = item.FILE_SIZE;

      // Convert size to megabytes using the provided function
      const fileSizeMB = convertSizeToMegaBytes(fileSizeStr);

      if (!fileTypeData[fileType]) {
        fileTypeData[fileType] = {
          count: 0,
          totalSize: 0,
        };
      }

      fileTypeData[fileType].count++; // Increment the count for the file type
      fileTypeData[fileType].totalSize += fileSizeMB; // Update the total size for the file type
    });

    const totalSizeInMB = Object.values(fileTypeData).reduce(
      (total, fileType) => total + fileType.totalSize,
      0
    );

    const tableData = Object.keys(fileTypeData).map((fileType) => {
      const { count, totalSize } = fileTypeData[fileType];
      const percentage = (totalSize / totalSizeInMB) * 100;
      return {
        fileType,
        fileCount: count,
        totalSizeMB: totalSize,
        percentage,
      };
    });
    doc.font("Helvetica-Bold").fontSize(9);
    const sortedTableData = tableData.sort((a, b) => b.fileCount - a.fileCount);
    const headings = ["fileType", "fileCount", "totalSizeMB", "percentage"];

    const headings2 = ["FILE TYPE", "COUNT", "VOLUME (MB)", "VOLUME %"];

    const columnWidths = [145, 145, 145, 145];
    let currentPageHeight = topMargin;
    const maxPageHeight = doc.page.height - margin;

    // Add headings
    headings2.forEach((heading, index) => {
      const x =
        margin +
        columnWidths.slice(0, index).reduce((total, width) => total + width, 0);
      const y = currentPageHeight;
      drawCell(heading, x, y, columnWidths[index], rowHeight);
    });

    currentPageHeight += rowHeight;

    // Add data with pagination
    sortedTableData.forEach((item, rowIndex) => {
      if (currentPageHeight + rowHeight > maxPageHeight) {
        doc.addPage();
        currentPageHeight = margin;
      }

      headings.forEach((heading, colIndex) => {
        const x =
          margin +
          columnWidths
            .slice(0, colIndex)
            .reduce((total, width) => total + width, 0);
        const y = currentPageHeight;

        let value = item[heading];
        if (heading === "totalSizeMB" || heading === "percentage") {
          value = value.toFixed(2);
        }

        drawCell(value, x, y, columnWidths[colIndex], rowHeight);
      });

      currentPageHeight += rowHeight;
      doc.moveDown();
    });

    async function fetchDataFromDatabase() {
      try {
        const datasets = await Dataset.find({}).lean();
        const transformedDatasets = datasets.map(transformDataset);
        return transformedDatasets;
      } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        throw error; // Re-throw the error to be handled in the route handler
      }
    }
    // Example usage:
    // const sizeInMB = convertSizeToMegaBytes("256 KB");

    doc
      .rect(0, 0, doc.page.width, doc.page.height) // (x, y, width, height)
      .lineWidth(borderWidth)
      .strokeColor(borderColor)
      .stroke();

    doc.addPage();

    // Create a base query for the date range
    const baseQuery = {};

    // Fetch data based on the constructed query
    console.log("base Query", baseQuery);

    const pageSize = 15;
    let page = 1;
    let skip = 0;
    while (true) {
      const data = await fetchDataRangeFilter(pageSize, skip, baseQuery);

      if (data.length === 0) {
        console.log("Break------>");
        break;
      }

      doc.moveDown();
      const headings = [
        "FILE_NAME",
        "isotimestamp",
        "FILE_TYPE",
        "TRANS_FILE_TYPE",
        "FILE_SIZE",
        "PROCESSING_TIME",
        "PROCESSING_SPEED",
        "MIME_TYPE",
      ];

      const headings2 = [
        "NAME",
        "DATE",
        "INPUT TYPE",
        "OUTPUT TYPE",
        "SIZE",
        "T.TIME",
        "SPEED",
        "MIME TYPE",
      ];

      // Define individual column widths for each attribute
      const columnWidths = [40, 60, 80, 40, 50, 40, 50, 150];

      doc.font("Helvetica").fontSize(9);

      const margin = 50;

      // Calculate the total table width based on individual column widths
      const tableWidth = columnWidths.reduce(
        (total, width) => total + width,
        0
      );

      // Function to draw a cell with text
      function drawCell(text, x, y, width, height) {
        doc.rect(x, y, width, height).stroke();

        // Adjust the height based on text wrapping
        const textOptions = { width: width - 10, height: height - 10 };
        doc.text(text, x + 5, y + 5, textOptions);
      }

      // Add headings
      headings2.forEach((heading, index) => {
        const x =
          margin +
          columnWidths
            .slice(0, index)
            .reduce((total, width) => total + width, 0);
        const y = margin;
        drawCell(heading, x, y, columnWidths[index], rowHeight);
      });

      // Add data
      data.forEach((item, rowIndex) => {
        headings.forEach((heading, colIndex) => {
          const x =
            margin +
            columnWidths
              .slice(0, colIndex)
              .reduce((total, width) => total + width, 0);
          const y = margin + (rowIndex + 1) * rowHeight; // +1 to skip the heading row

          let value = item[heading];
          if (heading === "isotimestamp") {
            value = value.slice(0, 10); // Include only the first 10 characters
          }

          drawCell(value, x, y, columnWidths[colIndex], rowHeight);
        });
        doc.moveDown();
      });

      // Check if a new page is needed
      if (data.length >= pageSize) {
        doc.addPage();
        // Increment the page when you move to a new page
        page++;
      }

      page++;
      skip += pageSize;
    }

    // End the document to send it
    doc.end();
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function fetchDataRangeFilter(pageSize, skip, baseQuery) {
  try {
    // Use the baseQuery to filter data based on selected filters

    const filteredDatasets = await Dataset.find(baseQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const transformedDatasets = filteredDatasets.map(transformDataset);

    return transformedDatasets;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error;
  }
}

async function fetchSizeFromRange(pageSize, skip, baseQuery) {
  try {
    // Use the baseQuery to filter data based on selected filters
    const filteredDatasets = await Dataset.find(baseQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const filteredDataLength = await Dataset.countDocuments(baseQuery); // Count documents that match the baseQuery

    console.log("filteredDataLength:--->", filteredDataLength);
    return filteredDataLength;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error;
  }
}

// Helper function to get the total size in megabytes (MB)
function getTotalSizeInMB(data) {
  return data.reduce((total, item) => total + item.totalSizeMB, 0);
}

// Helper function to generate random colors for pie slices
function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

// const fs = require('fs');
// const svg2img = require('svg2img');

app.get("/api/file-table", async (req, res) => {
  try {
    const data = await Dataset.aggregate([
      {
        $group: {
          _id: "$filetype",
          count: { $sum: 1 },
          sizes: { $push: "$http.multipart.size" }, // Collect all FILE_SIZE values for each FILE_TYPE
        },
      },
    ]);

    // Process the data to calculate total sizes in megabytes (MB)
    const tableData = data.map((item) => {
      const fileType = item._id;
      const fileCount = item.count;
      const sizes = item.sizes;
      let totalSizeKB = 0;

      sizes.forEach((size) => {
        // Split the string to extract the numeric value and unit
        const [numericValue, unit] = size.split(" ");

        // Convert the numeric value to kilobytes (KB)
        if (unit === "KB") {
          totalSizeKB += parseFloat(numericValue);
        } else if (unit === "MB") {
          totalSizeKB += parseFloat(numericValue) * 1024; // Convert MB to KB
        }
      });

      // Convert the total size to megabytes (MB)
      const totalSizeMB = totalSizeKB / 1024;

      return {
        fileType,
        fileCount,
        totalSizeMB,
      };
    });

    // Generate an SVG representation of the table
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">`;
    const tableX = 50;
    const tableY = 50;
    const rowHeight = 30;
    const tableWidth = 550;

    // Create table headers
    svg += `<text x="${tableX + 20}" y="${
      tableY + rowHeight
    }" font-size="16" text-anchor="start">FILE_TYPE</text>`;
    svg += `<text x="${tableX + 220}" y="${
      tableY + rowHeight
    }" font-size="16" text-anchor="start">Files Count</text>`;
    svg += `<text x="${tableX + 420}" y="${
      tableY + rowHeight
    }" font-size="16" text-anchor="start">FILE_SIZE (MB)</text>`;

    // Create table rows
    tableData.forEach((item, index) => {
      const rowY = tableY + (index + 2) * rowHeight;
      svg += `<text x="${
        tableX + 20
      }" y="${rowY}" font-size="14" text-anchor="start">${
        item.fileType
      }</text>`;
      svg += `<text x="${
        tableX + 220
      }" y="${rowY}" font-size="14" text-anchor="start">${
        item.fileCount
      }</text>`;
      svg += `<text x="${
        tableX + 420
      }" y="${rowY}" font-size="14" text-anchor="start">${item.totalSizeMB.toFixed(
        2
      )}</text>`;
    });

    // Add borders to the table and its cells
    const tableHeight = (tableData.length + 2) * rowHeight;
    svg += `<rect x="${tableX}" y="${tableY}" width="${tableWidth}" height="${tableHeight}" fill="none" stroke="black" stroke-width="1"/>`;

    // Close the SVG element
    svg += `</svg>`;

    // Convert the SVG to an image (e.g., PNG) using svg2img
    svg2img(svg, function (error, buffer) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        // Save the image as a file
        fs.writeFileSync("table_image.png", buffer);
        res.sendFile("table_image.png", { root: __dirname });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function convertSizeToMegaBytes(size) {
  // Split the size string into value and unit
  const [value, unit] = size.split(" ");

  // Convert the value to a number
  const sizeInMegaBytes = parseFloat(value);
  // If no unit is provided, assume bytes (B)
  if (!unit) {
    return sizeInMegaBytes / (1024 * 1024); // Convert bytes (B) to megabytes (MB)
  }
  // Convert the unit to lowercase for consistency
  const unitLower = unit.toLowerCase();

  if (unitLower === "kb") {
    return sizeInMegaBytes / 1024; // Convert kilobytes (KB) to megabytes (MB)
  } else if (unitLower === "mb") {
    return sizeInMegaBytes; // Size is already in megabytes
  } else if (unitLower === "b") {
    return sizeInMegaBytes / (1024 * 1024); // Convert bytes (B) to megabytes (MB)
  } else {
    // Handle other units as needed
    return sizeInMegaBytes / (1024 * 1024);
  }
}

async function fetchDataFromMongoDB(pageSize, skip) {
  try {
    const datasets = await Dataset.find().skip(skip).limit(pageSize).lean();

    const transformedDatasets = datasets.map(transformDataset);

    return transformedDatasets;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error; // Re-throw the error to be handled in the route handler
  }
}

async function fetchSize(pageSize, skip) {
  try {
    const data = await Dataset.find().skip(skip).limit(pageSize).exec();

    const dataLength = await Dataset.countDocuments({}); // Count all documents in the collection

    console.log("data length---->", dataLength);

    return dataLength;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error; // Re-throw the error to be handled in the route handler
  }
}

// Function to fetch data from MongoDB
async function fetchDataFromMongoDB(pageSize, skip) {
  try {
    const data = await Dataset.find(
      {},
      {
        UNIQUE_ID: 1,
        isotimestamp: 1,
        FILE_SIZE: 1,
        FILE_NAME: 1,
        STATUS: 1,
        FILE_MD5SUM: 1,
        MIME_TYPE: 1,
        TRANS_FILE_NAME: 1,
        TRANSFORM_TIMESTAMP: 1,
        PROCESSING_TIME: 1,
        TRANS_FILE_TYPE: 1,
        TRANS_FILE_MD5: 1,
        IOCDOMAIN: 1,
        IOCEMAIL: 1,
        FILE_TYPE: 1,
        IOCURL: 1,
        IOCIP: 1,
      }
    )
      .skip(skip)
      .limit(pageSize);

    return data;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error; // Re-throw the error to be handled in the route handler
  }
}

// const uploadDirectory = path.join(__dirname, 'ManuallyUploadedFiles');
const uploadDirectory = path.join(
  os.homedir(),
  "Desktop",
  "ManuallyUploadedFiles"
);

// Configure Multer to specify the destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Request Body:", req.body);

    // if (typeof req.body.folderPath === 'string') {
    const folderPath = req.body.folderPath || "Files";

    console.log("Received folderPath:", folderPath);
    const destinationPath = path.join(uploadDirectory, folderPath);
    console.log("files uploaded to:", destinationPath);

    try {
      fs.mkdirSync(destinationPath, { recursive: true });
      console.log("Directory created successfully");
    } catch (error) {
      console.error("Error creating directory:", error);
    }

    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// <------------- Endpoint to handle file uploads---------------->
app.post("/uploadFiles", upload.array("file"), (req, res) => {
  console.log("Received request:", req.body);
  console.log("Files uploaded successfully");
  res.status(200).json({ status: 200, message: "Files uploaded successfully" });
});

// File path for storing index
const indexFilePath = path.join(__dirname, "logs", "index.json");
// Function to read the index from the file
function readIndex(callback) {
  fs.readFile(indexFilePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // If the file doesn't exist, initialize index as 0
        callback(null, 0);
      } else {
        // Handle other errors
        callback(err);
      }
    } else {
      // Parse the index from the file
      const index = parseInt(data);
      callback(null, index);
    }
  });
}

// Function to write the updated index to the file
function writeIndex(index, callback) {
  fs.writeFile(indexFilePath, index.toString(), "utf8", callback);
}

app.post("/listFolders", (req, res) => {
  console.log("in listfolder api");
  const { inputFolderName } = req.body;
  const { loggedInUserId } = req.body;
  const inputFolder = path.join(os.homedir(), "Desktop");
  const inputDirectory = path.join(inputFolder, "ManuallyUploadedFiles");

  const inputFolderPath = path.join(inputDirectory, inputFolderName);
  console.log("Input Folder path:", inputFolderPath);

  // Create Output Folder named "TransformedFiles" in the downloads folder
  const outputFolderPath = path.join(
    os.homedir(),
    "Desktop",
    "ManuallyTransformedFiles"
  );

  // const outputFolderPath =  path.join(__dirname,'ManuallyTransformedFiles')

  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
    console.log(`Output folder created: ${outputFolderPath}`);
  }

  // Logging details
  const logData = {
    timestamp: new Date().toISOString(),
    inputFolderPath,
    outputFolderPath,
  };

  const logFileName = "upload_logs.log"; // Define the log file name with a .log extension

  // Log file path
  const logFilePath = path.join(__dirname, "logs", logFileName);

  // Log files present in the input folder
  fs.readdir(inputFolderPath, (err, files) => {
    if (err) {
      // Handle error
      console.error("Error reading input folder:", err);
    } else {
      readIndex((err, index) => {
        if (err) {
          console.error("Error reading index file:", err);
          return;
        }
        // const fileLogs = []
        files.forEach((file, idx) => {
          const fileIndex = index + idx + 1;
          // Log each file name
          logData[file] = fileIndex;
          // Information logs
        });
      });
    }

    function deleteFilesInDirectory(directory) {
      fs.readdir(directory, (err, files) => {
        if (err) {
          console.error(`Error reading directory ${directory}:`, err);
          return;
        }
        files.forEach((file) => {
          const filePath = path.join(directory, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            } else {
              console.log(`File ${filePath} deleted successfully.`);
            }
          });
        });
      });
    }

    function deleteDirectoriesInDirectory(directory) {
      fs.readdir(directory, (err, files) => {
        if (err) {
          console.error(`Error reading directory ${directory}:`, err);
          return;
        }

        files.forEach((file) => {
          const filePath = path.join(directory, file);

          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error(`Error getting stats of file ${filePath}:`, err);
              return;
            }

            if (stats.isDirectory()) {
              fs.rm(filePath, { recursive: true }, (err) => {
                if (err) {
                  console.error(`Error deleting directory ${filePath}:`, err);
                } else {
                  console.log(`Directory ${filePath} deleted successfully.`);
                }
              });
            }
          });
        });
      });
    }
    // Execute the Python script with input and output folder paths
    const pythonExecutable = "python";
    const pythonScript = "fts5.py";

    exec(
      `${pythonExecutable} ${pythonScript} "${inputFolderPath}" "${outputFolderPath}" "${loggedInUserId}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error}`);
          res.status(500).json({ error: "Internal server error" });
        }
        // Ensure stdout is not empty and valid JSON
        if (!stdout.trim()) {
          console.error("Error: Empty response from Python script");
          return res
            .status(500)
            .json({ error: "Internal Server Error", notificationCount: 1 });
        } else {
          // Parse the output from Python script
          try {
            console.log("Response from python", stdout);
            const response = JSON.parse(stdout);
            console.log("response", response);

            const status = response.status;

            console.log("Status----->", status);

            // res.status(200).json({ status:200, message: "sucess", notificationCount: 1 });
            switch (response.status) {
              case 200:
                res.status(200).json({
                  status: 200,
                  message: response.message,
                  notificationCount: 1,
                });
                break;
              case 400:
                res.status(400).json({
                  status: 400,
                  error: response.message,
                  notificationCount: 1,
                });
                break;
              default:
                res.status(500).json({
                  error: "Unknown error occurred",
                  notificationCount: 1,
                });
            }
          } catch (parseError) {
            res.status(500).json({
              status: 500,
              error: "Internal Server Error",
              notificationCount: 1,
            });
            // console.log('No Response Received')
          }
        }

        // Append log data to log file
        fs.appendFile(logFilePath, formatLogEntry(logData) + "\n", (err) => {
          if (err) {
            console.error("Error writing to log file:", err);
          }
        });

        function formatLogEntry(logData) {
          // Convert logData object to a formatted JSON string with each property in a different line
          return JSON.stringify(logData, null, 2).replace(/\\n/g, "\n");
        }

        deleteFilesInDirectory(inputFolderPath);
        deleteDirectoriesInDirectory(inputDirectory);
      }
    );
  });
});

app.post("/ftsAutomation", (req, res) => {
  console.log("In Transformation Automation API");

  const mainFolder = path.join(os.homedir(), "Desktop");
  const inputFolderName = "FTBT";
  const outputFolderName = "TransformedFiles";
  const inputFolderPath = path.join(mainFolder, inputFolderName);
  const outputFolderPath = path.join(mainFolder, outputFolderName);

  const logData = {
    timestamp: new Date().toISOString(),
    inputFolderPath,
    outputFolderPath,
  };

  const logFileName = "automation_logs.log"; // Define the log file name with a .log extension
  // Log file path
  const logFilePath = path.join(__dirname, "logs", logFileName);

  // Check if files are present in the input folder
  fs.readdir(inputFolderPath, (err, files) => {
    if (err) {
      // console.error('Error reading input folder:', err);
      console.log("Error reading input folder");
    } else {
      if (files.length === 0) {
        console.log("No files present in input folder. Skipping execution.");
        // return res.status(400).json({ error: 'No files present in input folder' });
      }

      console.log("Files present in input folder:");
      files.forEach((file, index) => {
        logData[file] = index + 1;
      });

      // Create Input Folder
      if (!fs.existsSync(inputFolderPath)) {
        fs.mkdirSync(inputFolderPath, { recursive: true });
        console.log(`Input folder created: ${inputFolderPath}`);
      }

      // Create Output Folder named "TransformedFiles" in the downloads folder
      if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath, { recursive: true });
        console.log(`Output folder created: ${outputFolderPath}`);
      }

      // Execute the Python script with input and output folder paths
      const pythonExecutable = "python"; // Use 'python' for Python 3.x
      const pythonScript = "fts_new.py"; // Replace with your Python script file name
      const pythonProcess = exec(
        `${pythonExecutable} ${pythonScript} "${inputFolderPath}" "${outputFolderPath}"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing Python script: ${error}`);
            res.status(500).json({ error: "Internal server error" });
            logData.responseStatus = "Error";
          } else {
            console.log(`Python script running output: ${stdout}`);
            res.json({ message: "Folders processed successfully." });
            logData.responseStatus = "Success";
          }
          // Append log data to log file
          // Append log data to log file
          fs.appendFile(logFilePath, formatLogEntry(logData) + "\n", (err) => {
            if (err) {
              console.error("Error writing to log file:", err);
            }
          });

          function formatLogEntry(logData) {
            // Convert logData object to a formatted JSON string with each property in a different line
            return JSON.stringify(logData, null, 2).replace(/\\n/g, "\n");
          }
        }
      );
    }
  });
});

// Define a route for downloading files
app.get("/download/:fileName", (req, res) => {
  // Extract the fileName parameter from the request
  const fileName = req.params.fileName;
  // Specify the directory where the files are stored
  const directory = path.join(
    os.homedir(),
    "Desktop",
    "ManuallyTransformedFiles"
  );

  // Construct the file path
  const filePath = path.join(directory, fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // If the file exists, create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    // If the file does not exist, return a 404 error
    res.status(404).send("File not found");
  }
});

app.post("/check-status", async (req, res) => {
  const { url } = req.body; // Get URL from request body

  if (!url) {
    console.log("Error: URL is required");
    return res
      .status(400)
      .json({ status: "Error", message: "URL is required" });
  }

  try {
    // Check the status of the provided URL
    const response = await axios.get(url, { timeout: 5000 });

    // If a response is received (even if empty), return Operational
    if (response.status >= 200 && response.status < 300) {
      console.log(
        `Operational: Response status ${response.status} for URL ${url}`
      );
      return res.json({ status: "Operational" });
    }
  } catch (error) {
    console.log(`HTTP request error: ${error.message} for URL ${url}`);
    // If HTTP request fails, check with ping
  }

  // Extract hostname from the URL for ping
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (urlError) {
    console.log(`Error parsing URL: ${urlError.message} for URL ${url}`);
    return res
      .status(400)
      .json({ status: "Error", message: "Invalid URL format" });
  }

  try {
    console.log(`Pinging ${hostname}...`);
    const pingResponse = await ping.promise.probe(hostname);
    if (pingResponse.alive) {
      console.log(`Operational: Ping successful for ${hostname}`);
      return res.json({ status: "Operational" });
    } else {
      console.log(`Down: Ping unsuccessful for ${hostname}`);
      return res.json({ status: "Down" });
    }
  } catch (pingError) {
    console.log(`Ping error: ${pingError.message} for ${hostname}`);
    return res.json({ status: "Down" });
  }
});

// Define Task schema
const taskSchema = new mongoose.Schema({
  description: String,
  done: Boolean,
  userEmail: String,
});

const Task = mongoose.model("Task", taskSchema);

// API endpoint to get all tasks
app.get("/api/tasks", authenticateMiddleware, async (req, res) => {
  const user = await getUserInfoFromDatabase(
    new ObjectId(req.user.authObject._id)
  ); // Implement this function
  const admin = await getAdminInfoFromDatabase(
    new ObjectId(req.user.authObject._id)
  ); // Implement this function

  if (user) {
    account = user;
  } else if (admin) {
    account = admin;
  }

  const userEmail = account.email;
  try {
    const tasks = await Task.find({ userEmail });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Define Task schema
const operationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Explicitly define _id as ObjectId
  description: String,
  status: Boolean,
  timestamp: String,
  userEmail: String,
});

const UserOperation = mongoose.model("operations", operationSchema);
// API endpoint to get all tasks

app.get("/api/userOperations", authenticateMiddleware, async (req, res) => {
  const user = await getUserInfoFromDatabase(
    new ObjectId(req.user.authObject._id)
  ); // Implement this function
  const admin = await getAdminInfoFromDatabase(
    new ObjectId(req.user.authObject._id)
  ); // Implement this function

  if (user) {
    account = user;
  } else if (admin) {
    account = admin;
  }

  const userEmail = account.email;
  try {
    const operations = await UserOperation.find({ userEmail }).sort({
      timestamp: -1,
    });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const AppOperations = mongoose.model("appoperations", operationSchema);

app.get("/api/appOperations", async (req, res) => {
  try {
    const appOperations = await AppOperations.find({}).sort({ _id: -1 });
    res.json(appOperations);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// Insert new record (fix duplicate _id issue)
app.post("/api/appOperations", async (req, res) => {
  try {
    const { description, status, timestamp, userEmail } = req.body;

    // Create a new document with a unique _id
    const newOperation = new AppOperations({
      _id: new mongoose.Types.ObjectId(), // Generate unique _id
      description,
      status,
      timestamp,
      userEmail,
    });

    // Save to database
    await newOperation.save();

    res.status(201).json({ message: "Record added successfully" });
  } catch (error) {
    console.error("Error adding record:", error);
    res.status(500).json({ error: "Failed to add record" });
  }
});
// API endpoint to add a new task
app.post("/api/tasks", async (req, res) => {
  const task = new Task({
    description: req.body.description,
    done: false,
    userEmail: req.body.userEmail,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save notification count
app.post("/notifications", async (req, res) => {
  try {
    const { notificationCount } = req.body;

    const newNotification = new ApplicationSettings({ notificationCount });
    await newNotification.save();

    res.status(201).json(newNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset notification count to 0
app.post("/reset/notifications", async (req, res) => {
  try {
    const notificationCount = 0; // ✅ Fixed variable declaration

    const updatedNotification = await ApplicationSettings.findOneAndUpdate(
      {}, // Find any document
      { notificationCount }, // Update notification count to 0
      { upsert: true, new: true } // Create if not exists, return updated doc
    );

    console.log("Notification Reset:", updatedNotification);

    res
      .status(200)
      .json({ message: "Notification Reset", updatedNotification });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// API endpoint to mark a task as done
app.put("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Toggle the 'done' state
    task.done = !task.done;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API endpoint to delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    const deletedTask = await Task.findByIdAndRemove(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(deletedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API to change Name

app.put(
  "/api/updateSettings",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    console.log("In settings update api");
    try {
      const userId = new ObjectId(req.user.authObject._id);
      const { newValue } = req.body;

      console.log("new value received:", newValue);

      // Update the user's name in the database
      const updatedUser = await updateSettingsInDatabase(userId, newValue);

      // Send the updated user information in the response
      res.json({
        sidebarExpansion: updatedUser.sidebarExpansion,
        isDarkMode: updatedUser.isDarkMode,
      });
    } catch (error) {
      console.error("Error updating user name:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.put(
  "/api/updateProfileSettings",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    console.log("In profile update api");
    try {
      const userId = new ObjectId(req.user.authObject._id);
      const { newValue } = req.body;

      console.log("new value received:", newValue);

      // Update the user's name in the database
      const updatedUser = await updateProfileSettingsInDatabase(
        userId,
        newValue
      );

      // Send the updated user information in the response
      res.json({ hideTask: updatedUser.hideTask });
    } catch (error) {
      console.error("Error updating user name:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.put(
  "/api/updateDarkMode",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    console.log("In dark mode update api");
    try {
      const userId = new ObjectId(req.user.authObject._id);
      const { newValue } = req.body;

      console.log("new Name received:", newValue);

      // Update the user's name in the database
      const updatedUser = await updateDarkModeInDatabase(userId, newValue);

      // Send the updated user information in the response
      res.json({ isDarkMode: updatedUser.isDarkMode });
    } catch (error) {
      console.error("Error updating user name:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.put(
  "/api/updatename",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    console.log("in name update api");
    try {
      const userId = new ObjectId(req.user.authObject._id);
      const { newname } = req.body;

      console.log("new Name received:", newname);

      // Update the user's name in the database
      const updatedUser = await updateUserNameInDatabase(userId, newname);

      // Send the updated user information in the response
      res.json({
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
      });
    } catch (error) {
      console.error("Error updating user name:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

app.put(
  "/api/updatePassword",
  regenerateToken,
  authenticateMiddleware,
  async (req, res) => {
    console.log("password changed");
    // const { email, password } = req.body;

    try {
      const userId = new ObjectId(req.user.authObject._id);
      const { oldPassword, newPassword } = req.body;

      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        req.user.authObject.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid old password." });
      }
      // Update the user's name in the database
      await updatePassword(userId, newPassword);
      // Send the updated user information in the response
      res.json({ message: "Password updated successfully." });
    } catch (error) {
      console.error("Error updating user name:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

const port = 8021;
const host = "192.168.1.131";

app.listen(port, () => {
  console.log(`Server started on http://${host}:${port}`);
});

app.get("/api", (req, res) => {
  res.json({ status: "Backend is working on apache!" });
});

//------------------------------------------------------------------------------
