const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
var { expressjwt: jwt } = require("express-jwt");
const errorHandler = require("./helpers/error-handler");

// http://localhost:3000/api/v1/products
app.use(cors());

const api = process.env.API_URL;
app.options("*", cors());
//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));

async function isRevoked(req, token) {
  if (token.payload.role != "admin") {
    console.log("Not Admin");
    return true;
  }
  console.log("Admin");
  return false;
}

app.use(
  jwt({
    secret: process.env.access_secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/orders\/:id/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/v1\/reviews/, methods: ["POST"] },
      {
        url: /\/api\/v1\/cart(.*)/,
        methods: ["GET", "OPTIONS", "POST", "DELETE"],
      },
      `${api}/users/login`,
      `${api}/users/register`,
      `${api}/users/refresh`,
      {
        url: /\/api\/v1\/reviews\/user/,
        methods: ["GET"],
      },
    ],
  })
);

app.use(errorHandler);
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const reviewsRoutes = require("./routes/reviews");
app.use(`${api}/reviews`, reviewsRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/cart`, cartRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: "pet_shop",
  })
  .then(() => {
    console.log("Database Connection is ready....");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});
