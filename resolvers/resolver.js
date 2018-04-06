import { v1 as neo4j } from 'neo4j-driver';
const driver = new neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "openbeerdb"));

let nextId = 3;

const resolvers = {
  Query: {
    findBeerByName: (_, params) => {
      const session = driver.session(neo4j.session.READ),
        query = `
          MATCH (beer:Beer)
          WHERE LOWER(beer.beerName) CONTAINS LOWER($name)
          RETURN beer
          LIMIT 10;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records.map(record => {
            return record.get("beer").properties;
          })
        });
    }
  },
  Beer: {
    brewery(beer) {
      const session = driver.session(neo4j.session.READ),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer) -[:BREWED_AT] -> (brewery:Brewery)
          WHERE beer.beerID = $beerID
          RETURN brewery;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records[0].get("brewery").properties;
        });
    },
    category(beer) {
      const session = driver.session(neo4j.session.READ),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer) -[:BEER_CATEGORY] -> (category:Category)
          WHERE beer.beerID = $beerID
          RETURN category;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records[0].get("category").properties;
        });
    },
    style(beer) {
      const session = driver.session(neo4j.session.READ),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer) -[:BEER_STYLE] -> (style:Style)
          WHERE beer.beerID = $beerID
          RETURN style;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records[0].get("style").properties;
        });
    }
  },
  Brewery: {
    geocode(brewery) {
      const session = driver.session(neo4j.session.READ),
        params = { breweryID: brewery.breweryID },
        query = `
          MATCH (brewery:Brewery) -[:GEOLOCATED_AT] -> (geocode:Geocode)
          WHERE brewery.breweryID = $breweryID
          RETURN geocode;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records[0].get("geocode").properties;
        });
    }
  },
  Mutation: {
    add: (root, args) => {
      console.log(args);
      const newBeer = { id: nextId++, name: args.name };
      beers.push(newBeer);
      return newBeer;
    },
  }
};

export default resolvers;