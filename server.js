import express from 'express';
import { express as middleware } from 'graphql-voyager/middleware';
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
import schema from './schema/schema.graphql'

// Initialize the app
const app = express();

// enable CORS
app.use(cors());

let driver;
const resolvers = {};

// Put together a schema
const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: merge(resolvers, beerResolvers, beererResolvers, breweryResolvers)
});

function context(headers, secrets) {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'neo4j'
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
    context: context(request.headers),
    tracing: true,
    cacheControl: true
  })),
);

// GraphQL voyager endpoint
app.use('/voyager', middleware({ endpointUrl: '/graphql' }));

// Browser endpoint
app.use('/browser', express.static(__dirname + '/browser'));

export default app;