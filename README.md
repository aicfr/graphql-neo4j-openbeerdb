[![Known Vulnerabilities](https://snyk.io/test/github/aicfr/graphql-neo4j-openbeerdb/badge.svg?targetFile=package.json)](https://snyk.io/test/github/aicfr/graphql-neo4j-openbeerdb?targetFile=package.json)

# graphql-neo4j-openbeerdb

![graph](graph.png "GraphQL schema")

## Install

```
npm install
```

## Run

```
npm start
```

## With Docker

For Neo4j installation and initialization : <https://github.com/aicfr/neo4j-openbeerdb>

```
docker run -d --name graphql-neo4j-openbeerdb --link neo4j:neo4j -p 3000:3000 aicfr/graphql-neo4j-openbeerdb
```

## GraphQL GUI

```
http://localhost:3000/graphiql
```

### Queries
#### Find beer

```json
{
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
```

#### Find beerer by id

```json
{
  findBeerer(id: 1) {
    beererName
    rated(first: 5) {
      beer {
        beerName
      }
      rate {
        rating
      }
    }
    checked(first: 5) {
      beer {
        beerName
      }
      check {
        location
      }
    }
    friends(first: 5) {
      friend {
        beererName
      }
      friendship {
        since
      }
    }
  }
}
```

#### Add rate

```json
mutation {
  rate(input: {me: 1, beerID: 11, rating: 1, comment: ""})
}
```

#### Add check

```json
mutation {
  check(input: {me: 1, beerID: 11, location: "Vineuil, FR", price: 4.5})
}
```

#### Add friend

```json
mutation {
  addFriend(input: {me: 1, friendID: 3})
}
```

### apollo-codegen

```
apollo-codegen introspect-schema schema/schema.graphql
```

### Generate graph

```
graphqlviz schema/schema.graphql -g | dot -Tpng -o graph.png
```