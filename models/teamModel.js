const mongoose = require('mongoose')

const teamSchema = mongoose.Schema(
  {
    year: { type: String, required: true },
    pos: { type: String, required: true },
    team: {
      teamUrl: { type: String, required: true },
      teamName: { type: String, required: true }
    },
    pts: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

const Team = mongoose.model('Team', teamSchema)

module.exports = Team