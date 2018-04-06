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
#### Find beer by name

```json
{
  findBeerByName(name: "corona") {
    beerName
    abv
    description
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