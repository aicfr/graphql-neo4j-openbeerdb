import express from 'express';
import jwt from "jsonwebtoken";
import cors from 'cors';
import bodyParser from 'body-parser';
import { v1 as neo4j } from 'neo4j-driver';
import { formatError } from 'apollo-errors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';
import { resolvers as beerResolvers } from './resolvers/beer';
import { resolvers as beererResolvers } from './resolvers/beerer';
import { resolvers as breweryResolvers } from './resolvers/brewery';
import schema from './schema/schema.graphql';
import dotenv from 'dotenv';
dotenv.config()

// Initialize the app
const app = express();

// enable CORS
app.use(cors())

let driver;
const resolvers = {};

// Put together a schema
const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: merge(resolvers, beerResolvers, beererResolvers, breweryResolvers)
});

function getUser(authorization, secrets) {
  const bearerLength = "Bearer ".length;
  if (authorization && authorization.length > bearerLength) {
    const token = authorization.slice(bearerLength);
    console.log(token)
    const verifiedToken = jwt.verify(token, process.env.AUTH0_SECRET)
    console.log(verifiedToken);
    // TODO: use sub
  }
}

function context(headers, secrets) {
  const authorization = headers["authorization"];

  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://neo4j',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'openbeerdb'
      )
    );
  }

  const user = getUser(authorization, secrets);

  return {
    user,
    driver,
    headers
  };
}

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  query: `
  // https://simple-auth0-token-creator.surge.sh/?domain=social-beer.eu.auth0.com&clientId=Wm56imkY7OWyDsoKnN1zGT6L510TB5qb
  {
    findBeer(filter: {name: "coro"}, first: 5) {
      beerName
      abv
      description
      picture
      rating {
        avg
        rating
      }
      brewery {
        breweryName
        address1
        city
        state
        zipCode
        country
        phoneNumber
        website
        description
        geocode {
          latitude
          longitude
        }
      }
      category {
        categoryName
      }
      style {
        styleName
      }
    }
  }
  `,
})
);

// The GraphQL endpoint
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(request => ({
    formatError,
    schema: executableSchema,
    context: context(request.headers, process.env)
  }))
);

export default app;