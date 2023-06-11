const mongoose = require('mongoose')

const driverSchema = mongoose.Schema(
  {
    year: { type: String, required: true },
    pos: { type: String, required: true },
    driver: {
      driverUrl: { type: String, required: true },
      driverName: { type: String, required: true }
    },
    nationality: { type: String, required: true },
    car: {
      carUrl: { type: String, required: true },
      carName: { type: String, required: true }
    },
    pts: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

const Driver = mongoose.model('Driver', driverSchema)

module.exports = Driver