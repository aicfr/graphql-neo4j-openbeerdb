import express from 'express';
import bodyParser from 'body-parser';
import { v1 as neo4j } from 'neo4j-driver';
import { formatError } from 'apollo-errors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';
import { resolvers as beerResolvers } from './resolvers/beer';
import { resolvers as beererResolvers } from './resolvers/beerer';
import { resolvers as breweryResolvers } from './resolvers/brewery';
import schema from './schema/schema.graphql'

// Initialize the app
const app = express();

const resolvers = {};

// Put together a schema
const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: merge(resolvers, beerResolvers, beererResolvers, breweryResolvers)
});

let driver;

function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(
      secrets.NEO4J_URI || 'bolt://neo4j',
      neo4j.auth.basic(
        secrets.NEO4J_USER || 'neo4j',
        secrets.NEO4J_PASSWORD || 'openbeerdb'
      )
    );
  }
  return {
    driver,
    headers
  };
}

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  query: `{
    findBeer(filter: {name: "coro"}, first: 5) {
      beerName
      abv
      description
      picture
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