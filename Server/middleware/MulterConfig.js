import multer from 'multer';
import path from 'path';

// Define allowed file types for image uploads and PDFs
const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;

// Configure storage settings (in memory, for sharp processing)
const storage = multer.memoryStorage();

// File validation to check file types and size
const fileFilter = (req, file, cb) => {
  const isFileValid = allowedFileTypes.test(path.extname(file.originalname).toLowerCase()) && 
                      allowedFileTypes.test(file.mimetype);

  if (isFileValid) {
    return cb(null, true); // file is valid
  } else {
    return cb(new Error('Only image and PDF files are allowed!'), false); // file is invalid
  }
};

// Configure single file upload for 'photo'
const uploadSingle = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  },
  fileFilter: fileFilter
}).single('photo'); // Handle single file under 'photo'

// Reusable function for multiple file uploads based on dynamic fields
const UploadMultiple = (fields) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: fileFilter
  }).fields(fields); // Handle dynamic fields
};


export { uploadSingle, UploadMultiple };
