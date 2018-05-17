import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { graphiqlExpress, graphqlExpress } from "graphql-server-express";
import { context } from "./schema";

dotenv.config();

const PORT = process.env.PORT;
const server = express();

if (typeof process.env.NEO4J_USER === "undefined") {
  console.warn(
    "WARNING: process.env.NEO4J_USER is not defined. Check README.md for more information"
  );
}
if (typeof process.env.NEO4J_PASSWORD === "undefined") {
  console.warn(
    "WARNING: process.env.NEO4J_PASSWORD is not defined. Check README.md for more information"
  );
}
if (typeof process.env.NEO4J_URI === "undefined") {
  console.warn(
    "WARNING: process.env.NEO4J_URI is not defined. Check README.md for more information"
  );
}

server.use(
  "/graphql",
  bodyParser.json(),
  graphqlExpress(request => ({
    schema,
    rootValue,
    context: context(request.headers, process.env)
  }))
);

server.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql",
    query: ``
  })
);

server.listen(PORT, () => {
  console.log(
    `GraphQL Server is now running on http://localhost:${PORT}/graphql`
  );
  console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
});
