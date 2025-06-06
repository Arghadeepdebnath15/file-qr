const mongoose = require('mongoose');

const recentHistorySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  fileIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

// Update lastAccessed whenever the document is modified
recentHistorySchema.pre('save', function(next) {
  this.lastAccessed = new Date();
  next();
});

module.exports = mongoose.model('RecentHistory', recentHistorySchema); 