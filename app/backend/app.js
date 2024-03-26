const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv/config");
const connectDB = require("./helpers/database");
const configureJWT = require("./helpers/jwt-configuration");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(errorHandler);

connectDB();
configureJWT(app);

const api = process.env.API_URL;

const productsRoutes = require("./routes/productRoutes");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");

app.use(`${api}/reviews`, reviewsRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/cart`, cartRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running`);
});
