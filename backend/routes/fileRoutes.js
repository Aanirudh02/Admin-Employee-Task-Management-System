
const express    = require('express');
const router     = express.Router();
const mongoose   = require('mongoose');
const { streamFromGridFS, getFileInfo } = require('../utils/gridfs');

router.get('/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const info   = await getFileInfo(fileId);

    if (!info) return res.status(404).json({ message: 'File not found' });

    const contentType = info.contentType || 'application/octet-stream';

  
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${info.filename || 'image'}"`
    );

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

   
    if (info.length) {
      res.setHeader('Content-Length', info.length);
    }

    streamFromGridFS(fileId, res);
  } catch (err) {
    console.error('File serve error:', err.message);
    res.status(400).json({ message: 'Invalid file ID' });
  }
});

module.exports = router;