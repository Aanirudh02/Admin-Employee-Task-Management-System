
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

let bucket;

const getBucket = () => {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  }
  return bucket;
};

const uploadToGridFS = (buffer, filename, mimetype, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const b = getBucket();
    const uploadStream = b.openUploadStream(filename, {
      contentType: mimetype,
      metadata
    });

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);

    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });
};

/**
 * Stream a file from GridFS to an Express response
 */
const streamFromGridFS = (fileId, res) => {
  const b = getBucket();
  const downloadStream = b.openDownloadStream(fileId);

  downloadStream.on('error', (err) => {
    res.status(404).json({ message: 'File not found' });
  });

  downloadStream.pipe(res);
};

/**
 * Get file metadata by _id
 */
const getFileInfo = async (fileId) => {
  const b = getBucket();
  const files = await b.find({ _id: fileId }).toArray();
  return files[0] || null;
};

module.exports = { uploadToGridFS, streamFromGridFS, getFileInfo, getBucket };