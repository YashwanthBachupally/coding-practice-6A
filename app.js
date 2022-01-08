const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//districs api
app.get("/districts/", async (req, res) => {
  const getStatesQuery = `SELECT * FROM district;`;
  const dbRes = await db.all(getStatesQuery);
  res.send(dbRes);
});

//api 1 /.....Returns a list of all states in the state table

app.get("/states/", async (req, res) => {
  const getStatesQuery = `SELECT * FROM state;`;
  const dbRes = await db.all(getStatesQuery);
  res.send(
    dbRes.map((each) => ({
      stateId: each.state_id,
      stateName: each.state_name,
      population: each.population,
    }))
  );
});

// api 2 ...Returns a state based on the state ID

app.get("/states/:stateId/", async (req, res) => {
  const { stateId } = req.params;
  const getStatesQuery = `SELECT * FROM state WHERE state_id=${stateId};`;
  const dbRes = await db.get(getStatesQuery);
  //res.send(
  // ((each) => ({
  //   stateId: each.state_id,
  //   stateName: each.state_name,
  //   population: each.population,
  // }))
  //);
  res.send({
    stateId: dbRes.state_id,
    stateName: dbRes.state_name,
    population: dbRes.population,
  });
});

// api. 3.. Create a district in the district table,

app.post("/districts/", async (req, res) => {
  const districtDetails = req.body;
  const {
    stateId,
    districtName,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const dbQuery = `INSERT INTO district(district_id,district_name,,state_id,cases,cured,active,deaths)
    VALUES(
        '${districtName}',${stateId},${cases},${cured},${active},${deaths}
        );`;
  //dbRes = await db.run(dbQuery);
  // const district_id = dbRes.lastID;
  console.log(districtName, stateId);
  //res.send("District Successfully Added");
});

//api...4....Returns a district based on the district ID

app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const dbQuery = `SELECT * FROM district WHERE district_id=${districtId}`;
  const dbRes = await db.get(dbQuery);
  res.send({
    districtId: dbRes.district_id,
    districtName: dbRes.district_name,
    stateId: dbRes.state_id,
    cases: dbRes.cases,
    cured: dbRes.cured,
    active: dbRes.active,
    deaths: dbRes.deaths,
  });
});

// api,..5....Deletes a district from the district table based on the district ID
app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const dbQuery = `DELETE FROM district WHERE district_id=${districtId};`;
  const dbRes = await db.run(dbQuery);
  res.send("District Removed");
});

//api...6..Updates the details of a specific district based on the district ID

app.put("/districts/:districtId/", async (req, res) => {
  const districtDetails = req.body;
  const { districtId } = req.params;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const dbQuery = `UPDATE district SET 
  district_name=${districtName},
  state_id=${stateId},cases=${cases},
  cured=${cured},
  active=${active},deaths=${deaths} WHERE district_id=${districtId}`;
  const dbRes = await db.run(dbQuery);
  res.send(dbRes);
});

// api...7... Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get("/states/:stateId/stats/", async (req, res) => {
  const { stateId } = req.params;
  const dbQuery = `SELECT 
    SUM(cases) AS totalCases,
    SUM(cured) AS totalCured,
    SUM(active) AS totalActive,
    SUM(deaths) AS totalDeaths FROM district WHERE state_id=${stateId};`;
  const dbRes = await db.get(dbQuery);
  res.send(dbRes);
});

//api..8.....Returns an object containing the
//state name of a district based on the district ID

app.get("/districts/:districtId/details/", async (req, res) => {
  const { districtId } = req.params;
  const dbQuery = `SELECT state_name AS stateName FROM state JOIN district ON
  state.state_id=district.state_id WHERE district_id=${districtId};`;
  const dbRes = await db.get(dbQuery);
  res.send(dbRes);
});

module.exports = app;
