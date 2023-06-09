const express = require("express")
const cors = require("cors")
const axios = require("axios")
const cheerio = require("cheerio")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const mongoose = require('mongoose')
const Race = require("./models/raceModel")
const Driver = require("./models/driverModel")
const Team = require("./models/teamModel")
const FastestLap = require("./models/fastestLapModel")

const app = express();

app.use(express.json())
app.use(bodyParser.json({ limit: "50mb" }))
app.use(cors())
dotenv.config()
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
  })
)

// SCRAPE URL
const defaultYear = 2023
const raceUrl = `https://www.formula1.com/en/results.html/${defaultYear}/races.html`


// GET F1 YEARS 
app.get("/races/getyear", (req, res) => {
  const yearList = []
  try {
    axios(raceUrl).then(response => {
      const html = response.data
      const $ = cheerio.load(html)
      $(".resultsarchive-filter-container > .resultsarchive-filter-wrap:eq(0) > ul > li").each(function () {
        const year = $(this).find("a").attr("data-value")
        yearList.push(year)
      })
      res.status(200).json(yearList)
    })
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET F1 CATEGORY
app.get("/races/getcategory", (req, res) => {
  const categoryList = []
  try {
    axios(raceUrl).then(response => {
      const html = response.data
      const $ = cheerio.load(html)
      $(".resultsarchive-filter-container > .resultsarchive-filter-wrap:eq(1) > ul > li").each(function () {
        const category = $(this).find("a").attr("data-value")
        categoryList.push(category)
      })
      res.status(200).json(categoryList)
    })
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET F1 LOCATION BASED ON YEAR
// app.get("/races/getlocation/:year", (req, res) => {
//   const year = req.params.year
//   const locationList = []
//   const raceUrlBasedOnYear = `https://www.formula1.com/en/results.html/${year}/races.html`

//   try {
//     axios(raceUrlBasedOnYear).then(response => {
//       const html = response.data
//       const $ = cheerio.load(html)
//       $(".resultsarchive-filter-container > .resultsarchive-filter-wrap:eq(2) > ul > li").each(function () {
//         const location = $(this).find("a").attr("data-value")
//         locationList.push(location)
//       })
//       res.status(200).json(locationList)
//     })
//   } catch (error) {
//     res.status(500).json(error)
//   }
// })

// GET ALL INFO - RACES
app.get("/info/races/:year", (req, res) => {
  const { year } = req.params

  const raceUrlBasedOnYear = `https://www.formula1.com/en/results.html/${year}/races.html`

  const titles = []
  const details = []
  try {
    axios(raceUrlBasedOnYear).then(async (response) => {
      const html = response.data
      const $ = cheerio.load(html)

      // Get table Titles
      $(".resultsarchive-table > thead > tr > th").each(function () {
        const title = $(this).text().trim().toLowerCase().replace(' ', '')
        if (titles) titles.push(title)
      })

      // Get table details
      $(".resultsarchive-table > tbody tr").each(function () {
        let count = 0
        let raceObj = {}
        $(this).find("td").each((function () {
          let detail;
          switch (count) {
            case 0:
              break;
            case 1:
              const raceUrl = $(this).find("a").attr("href")
              const raceName = $(this).find("a").text().trim()
              detail = {
                raceUrl,
                raceName
              }
              break;
            case 3:
              $(this).find("span:lt(2)").each(function () {
                const nameFragment = $(this).text().trim()
                if (!detail) detail = nameFragment
                else detail += ' ' + $(this).text().trim()
              })
              break;
            default:
              detail = $(this).text().trim()
              break
          }
          if (detail) raceObj[titles[count]] = detail
          count++
        }))
        details.push(raceObj)
      })
      await Race.collection.drop()
      await Race.insertMany(details).then(
        res.status(200).json(`Updated all ${year} races`)
      )
    })
  }
  catch (error) {
    res.status(500).json(error)
  }
})

// GET ALL INFO - DRIVERS
app.get("/info/drivers/:year", (req, res) => {
  const { year } = req.params

  const raceUrlBasedOnYear = `https://www.formula1.com/en/results.html/${year}/drivers.html`

  const titles = []
  const details = []
  try {
    axios(raceUrlBasedOnYear).then(async (response) => {
      const html = response.data
      const $ = cheerio.load(html)

      // Get table Titles
      $(".resultsarchive-table > thead > tr > th").each(function () {
        const title = $(this).text().trim().toLowerCase().replace(' ', '')
        if (titles) titles.push(title)
      })

      // Get table details
      $(".resultsarchive-table > tbody tr").each(function () {
        let count = 0
        let driverObj = {}
        $(this).find("td").each((function () {
          let detail;
          switch (count) {
            case 2:
              let driverName = ''
              const driverUrl = $(this).find("a").attr("href")
              $(this).find("a > span:lt(2)").each(function () {
                const nameFragment = $(this).text().trim()
                if (!driverName) driverName = nameFragment
                else driverName += ' ' + $(this).text().trim()
              })
              detail = {
                driverUrl,
                driverName
              }
              break;
            case 4:
              const carUrl = $(this).find("a").attr("href")
              const carName = $(this).text().trim()
              detail = {
                carUrl,
                carName
              }
              break;
            default:
              detail = $(this).text().trim()
              break
          }
          if (detail) driverObj[titles[count]] = detail
          count++
        }))
        details.push({ year, ...driverObj })
      })
      await Driver.collection.drop()
      await Driver.insertMany(details).then(
        res.status(200).json(`Updated all ${year} Driver`)
      )
    })
  }
  catch (error) {
    res.status(500).json(error)
  }
})

// GET ALL INFO - TEAMS
app.get("/info/teams/:year", (req, res) => {
  const { year } = req.params

  const raceUrlBasedOnYear = `https://www.formula1.com/en/results.html/${year}/team.html`

  const titles = []
  const details = []
  try {
    axios(raceUrlBasedOnYear).then(async (response) => {
      const html = response.data
      const $ = cheerio.load(html)

      // Get table Titles
      $(".resultsarchive-table > thead > tr > th").each(function () {
        const title = $(this).text().toLowerCase()
        if (titles) titles.push(title)
      })

      // Get table details
      $(".resultsarchive-table > tbody tr").each(function () {
        let count = 0
        let teamObj = {}
        $(this).find("td").each((function () {
          let detail;
          switch (count) {
            case 2:
              const teamUrl = $(this).find("a").attr("href")
              const teamName = $(this).text().trim()
              detail = {
                teamUrl,
                teamName
              }
              break;
            default:
              detail = $(this).text().trim()
              break
          }
          if (detail) teamObj[titles[count]] = detail
          count++
        }))
        details.push({ year, ...teamObj })
      })
      // await Team.insertMany(details).then(
      //   res.status(200).json(`Updated all ${year} Teams`)
      // )
      await Team.collection.drop()
      await Team.insertMany(details).then(
        res.status(200).json(`Updated all ${year} Teams`)
      )
    })
  }
  catch (error) {
    res.status(500).json(error)
  }
})

// GET ALL INFO - FASTEST LAP
app.get("/info/fastest-laps/:year", (req, res) => {
  const { year } = req.params

  const raceUrlBasedOnYear = `https://www.formula1.com/en/results.html/${year}/fastest-laps.html`

  const titles = []
  const details = []
  try {
    axios(raceUrlBasedOnYear).then(async (response) => {
      const html = response.data
      const $ = cheerio.load(html)

      // Get table Titles
      $(".resultsarchive-table > thead > tr > th").each(function () {
        const title = $(this).text().toLowerCase().replace(' ', '')
        if (titles) titles.push(title)
      })

      // Get table details
      $(".resultsarchive-table > tbody tr").each(function () {
        let count = 0
        let fastestLapObj = {}
        $(this).find("td").each((function () {
          let detail;
          switch (count) {
            case 2:
              let driverName = ''
              $(this).find("span:lt(2)").each(function () {
                const nameFragment = $(this).text().trim()
                if (!driverName) driverName = nameFragment
                else driverName += ' ' + $(this).text().trim()
              })
              detail = driverName
              break;
            default:
              detail = $(this).text().trim()
              break
          }
          if (detail) fastestLapObj[titles[count]] = detail
          count++
        }))
        details.push({ year, ...fastestLapObj })
      })
      await FastestLap.collection.drop()
      await FastestLap.insertMany(details).then(
        res.status(200).json(`Updated all ${year} fastest laps`)
      )
    })
  }
  catch (error) {
    res.status(500).json(error)
  }
})

app.post("/update", async (req, res) => {
  try {
    const race = await Race.create(req.body)
    res.status(200).json(race)
  } catch (error) {
    res.status(500).json(error)
  }
})

mongoose
  .connect('mongodb+srv://admin:admin@f1raceapi.itzsjv5.mongodb.net/races?retryWrites=true&w=majority')
  .then(() => {
    console.log("connected to mongoDB")
    app.listen(process.env.PORT || 8000, () => {
      console.log("WEB CRAWLER IS RUNNING")
    })
  })
  .catch((error) => {
    console.log(error)
  })
