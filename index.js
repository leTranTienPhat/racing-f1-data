const express = require("express")
const cors = require("cors")
const axios = require("axios")
const cheerio = require("cheerio")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")

const app = express();

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
// const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki"
const url = "https://www.formula1.com/en/results.html/2023/races.html"

// GET ALL RACES
app.get("/races", (req, res) => {
  const racesInfo = []
  const limit = Number(req.query.limit)
  try {
    axios(url).then(response => {
      const html = response.data
      const $ = cheerio.load(html)
      $(".resultsarchive-table > tbody tr").each(function () {
        const raceUrl = $(this).find("a").attr("href")
        const raceName = $(this).find("a").text().trim()
        const raceUrlSplitArray = raceUrl.split("/")
        const raceYear = raceUrlSplitArray[3]
        const raceId = raceUrlSplitArray[5]
        racesInfo.push({
          raceUrl: `http://localhost:8000/races/${raceYear}/${raceId}/${raceName}`,
          raceId: raceId,
          raceName: raceName,
          raceYear: raceYear,
        })
      })
      if (limit && limit > 0) res.status(200).json(racesInfo.slice(0, limit))
      else res.status(200).json(racesInfo)
    })
  } catch (error) {
    res.status(500).json(error)
  }
})

// GET A RACE 

app.listen(8000, () => {
  console.log("Server is running")
})