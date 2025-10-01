import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
});

const File = mongoose.models.File || mongoose.model("File", FileSchema);

export default File;
