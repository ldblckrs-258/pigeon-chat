const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Controller để xử lý upload file
exports.uploadFile = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err });
    }
    res.status(200).json({ message: "File uploaded successfully" });
  });
};
