import { makeExecutableSchema } from "graphql-tools";
import { v1 as neo4j } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const typeDefs = `

type Video {
  ref: String,
  degree: Int @cypher(statement: "RETURN SIZE((this)<--())")
  start: String,
  end: String
}

type Person {
  name: String
  degree: Int @cypher(statement: "RETURN SIZE((this)-->())")
  videos: [Video] @relation(name: "REFERENCES", direction: "OUT")
}

type Query {
  findTopPeople(first: Int, offset: Int): [Person] @relation(name: "REFERENCES", direction: "IN")
  findPeople(substring: String, first: Int, offset: Int): [Person] @cypher(statement: "MATCH (p:Person) WHERE toLower(p.name) CONTAINS toLower($substring) RETURN p")
}
`;

const resolvers = {
  Query: {
    findTopPeople(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    },
    findPeople(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    }
  }
};

// Required: Export the GraphQL.js schema object as "schema"
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Optional: Export a function to get context from the request. It accepts two
// parameters - headers (lowercased http headers) and secrets (secrets defined
// in secrets section). It must return an object (or a promise resolving to it).
let driver;

export function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(
      secrets.NEO4J_URI || "bolt://localhost:7687",
      neo4j.auth.basic(
        secrets.NEO4J_USER || "neo4j",
        secrets.NEO4J_PASSWORD || "letmein"
      )
    );
  }
  return { driver };
}

// Optional: Export a root value to be passed during execution
// export const rootValue = {};

// Optional: Export a root function, that returns root to be passed
// during execution, accepting headers and secrets. It can return a
// promise. rootFunction takes precedence over rootValue.
// export function rootFunction(headers, secrets) {
//   return {
//     headers,
//     secrets,
//   };
// };
