const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const imageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const documentTypes = [...imageTypes, "application/pdf"];

const imageFileFilter = (req, file, cb) => {
  if (!imageTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
  }
  cb(null, true);
};

const documentFileFilter = (req, file, cb) => {
  if (!documentTypes.includes(file.mimetype)) {
    return cb(new Error("Only image or PDF documents are allowed."));
  }
  cb(null, true);
};

const eventStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sahyog-events",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sahyog-profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto",
      },
    ],
  },
});

const uploadEventImage = multer({
  storage: eventStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadBloodDocument = multer({
  storage: multer.memoryStorage(),
  fileFilter: documentFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadEventImage,
  uploadProfileImage,
  uploadBloodDocument,
};