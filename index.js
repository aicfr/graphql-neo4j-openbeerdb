import http from 'http';
import { createServer } from 'http';
import app from './server';

const PORT = 3000;

const server = http.createServer(app);

server.listen(process.env.PORT || PORT, () => {
    console.log(`GraphQL Server is now running on http://localhost:${PORT}/graphql`);
    console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
});