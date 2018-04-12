import express from 'express';
import bodyParser from 'body-parser';
import { formatError } from 'apollo-errors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers/resolver';
import schema from './schema/schema.graphql'

// Initialize the app
const app = express();

// Put together a schema
const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers
});

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  query: `{
    findBeer(filter: {beerName: "coro"}) {
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
app.use('/graphql',
  bodyParser.json(),
  graphqlExpress({
    formatError,
    schema: executableSchema
  }));

export default app;