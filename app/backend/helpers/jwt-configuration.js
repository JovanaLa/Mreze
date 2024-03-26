const { expressjwt: jwt } = require("express-jwt");
require("dotenv/config");

const api = process.env.API_URL;

async function isRevoked(req, token) {
  if (token.payload.role !== "admin") {
    console.log("Not Admin");
    return true;
  }
  console.log("Admin");
  return false;
}

function configureJWT(app) {
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
        `${api}/users/logout`,
        `${api}/users/register`,
        `${api}/users/refresh`,
        {
          url: /\/api\/v1\/reviews\/user/,
          methods: ["GET"],
        },
      ],
    })
  );
}

module.exports = configureJWT;
