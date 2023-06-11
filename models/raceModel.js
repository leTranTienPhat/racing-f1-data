const mongoose = require('mongoose')

const raceSchema = mongoose.Schema(
  {
    year: { type: String, required: true },
    grandprix: {
      raceUrl: { type: String, required: true },
      raceName: { type: String, required: true },
    },
    // date: { type: Date, required: true },
    date: { type: String, required: true },
    winner: { type: String, required: true },
    car: { type: String, required: true },
    laps: { type: String, required: true },
    time: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

const Race = mongoose.model('Race', raceSchema)

module.exports = Race