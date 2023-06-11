const mongoose = require('mongoose')

const fastestLapSchema = mongoose.Schema(
  {
    year: { type: String, required: true },
    grandprix: { type: String, required: true },
    driver: { type: String, required: true },
    car: { type: String, required: true },
    time: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

const FastestLap = mongoose.model('FastestLap', fastestLapSchema)

module.exports = FastestLap