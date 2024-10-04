const swaggerAutogen = require("swagger-autogen")({ language: "ko" });

const doc = {
  info: {
    title: "Scooter API Document",
    description: "test",
  },
  host: "http://localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointFiles = ["./app.js"];

swaggerAutogen(outputFile, endpointFiles, doc);
