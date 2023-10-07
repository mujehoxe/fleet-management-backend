const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");

const client = mqtt.connect("mqtt://13.38.173.241");

const pgClient = new Client({
  connectionString: "postgresql://postgres:root@localhost/fleet_management",
});

pgClient.connect();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get("/uav-data", async (req, res) => {
  const uavId = req.query.uavId;
  const startTimestamp = req.query.startTimestamp;
  const endTimestamp = req.query.endTimestamp;

  if (!uavId || !startTimestamp) {
    res
      .status(400)
      .send("Missing required query parameters: uavId, and/or startTimestamp");
    return;
  }

  if (!endTimestamp) {
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      ws.uavId = uavId;
      ws.startTimestamp = startTimestamp;
    });
  } else {
    try {
      const queryText =
        "SELECT * FROM uav INNER JOIN uav_locations ON uav.uav_id = uav_locations.uav_id WHERE uav.uav_id = $1 AND uav_locations.timestamp BETWEEN $2 AND $3 ORDER BY uav_locations.timestamp ASC";
      const values = [uavId, startTimestamp, endTimestamp];
      const result = await pgClient.query(queryText, values);

      res.json(result.rows);
    } catch (e) {
      console.error(e.stack);
      res.status(500).send("Server error");
    }
  }
});

app.get("/uav-list", async (req, res) => {
  const result = await getUavList();

  res.json(result.rows);
});

async function getUavList() {
  const queryText = "SELECT * FROM uav";
  return await pgClient.query(queryText);
}

let uavs = [];
const getUavs = async () => {
  uavs = await getUavList();
  uavs = await uavs.rows;
};
getUavs();

const getRandomAltitudeStep = () => Math.random() * 2 - 1;

app.post("/uav-create", async (req, res) => {
  const { uav_id } = req.body;

  if (!uav_id) {
    res.status(400).send("Missing required query parameters: uavId");
    return;
  }

  const text = `
      INSERT INTO uav(uav_id, state) 
      VALUES($1, $2)
    `;

  const values = [uav_id, uavs.find((value) => "uav1" === value.uav_id)?.state];

  try {
    await pgClient.query(text, values);
  } catch (e) {
    console.error(e.stack);
  }

  publishRecursively(uav_id, values[1]);

  const dronePosition = {
    lon: (Math.random() * 2 - 1) * 180,
    lat: (Math.random() * 2 - 1) * 90,
    abs: Math.random() * 180,
    angle: 0,
  };

  const circleRadius = 0.001;
  const angleStep = (2 * Math.PI) / 360;

  const updatePosition = () => {
    dronePosition.angle += angleStep;
    if (dronePosition.angle >= 2 * Math.PI) {
      dronePosition.angle -= 2 * Math.PI;
    }

    dronePosition.lat += circleRadius * Math.sin(dronePosition.angle);
    dronePosition.lon += circleRadius * Math.cos(dronePosition.angle);

    dronePosition.abs += getRandomAltitudeStep();
    dronePosition.fx = 3;
    dronePosition.ns = 10;
  };

  setInterval(() => {
    updatePosition(dronePosition);
    for (let key of Object.keys(dronePosition)) {
      client.publish(`${uav_id}/gps/${key}`, String(dronePosition[key]));
    }
  }, Math.random() * 30000);

  res.sendStatus(201);
});

function publishRecursively(prefix, obj) {
  for (let key of Object.keys(obj)) {
    const newPrefix = `${prefix}/${key}`;
    if (obj[key] !== null && typeof obj[key] === "object") {
      publishRecursively(newPrefix, obj[key]);
    } else {
      client.publish(newPrefix, String(obj[key]));
    }
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
