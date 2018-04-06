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
    beerName
    abv
    description
    brewery{
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
    style{
      styleName
    }
  }
}
```