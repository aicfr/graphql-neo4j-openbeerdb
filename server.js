import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './graphql/api/resolver';

import schema from './data/schema.graphql'

// Initialize the app
const app = express();

// Put together a schema
const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers
});

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: executableSchema }));

export default app;