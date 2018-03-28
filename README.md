# graphql-neo4j-openbeerdb
## Install

```
npm install
```

## Run

```
npm start
```

## GraphQL GUI

```
http://localhost:3000/graphiql
```

### Queries
#### Find all beers

```json
{
  findAll {
    beerID
    beerName
  }
}
```