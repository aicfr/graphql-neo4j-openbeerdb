import http from 'http';
import { createServer } from 'http';
import app from './server';
import dotenv from 'dotenv';
dotenv.config()

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}/graphql`);
  console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
  console.log(`View GraphQL voyager at http://localhost:${PORT}/voyager`);
});