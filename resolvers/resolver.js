import { v1 as neo4j } from 'neo4j-driver';
const driver = new neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "openbeerdb"));

const resolvers = {
  Query: {
    beererById: (_, params) => {
      const session = driver.session(neo4j.session.READ),
        query = `
        MATCH (beerer:Beerer {beererID: $beererID})
        RETURN beerer;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records[0].get("beerer").properties;
        });
    },
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
  Beerer: {
    rated(beerer) {
      return [{ beerID: 1 }];
    }
  },
  Beer: {
    brewery(beer) {
      const session = driver.session(neo4j.session.READ),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer {beerID: $beerID}) -[:BREWED_AT] -> (brewery:Brewery)
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
          MATCH (beer:Beer {beerID: $beerID}) -[:BEER_CATEGORY] -> (category:Category)
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
          MATCH (beer:Beer {beerID: $beerID}) -[:BEER_STYLE] -> (style:Style)
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
          MATCH (brewery:Brewery {breweryID: $breweryID}) -[:GEOLOCATED_AT] -> (geocode:Geocode)
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
    rate: (_, params) => {
      const session = driver.session(neo4j.session.READ),
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})
          MATCH (beer:Beer {beerID: $beerID})
          CREATE (beerer)-[r:RATED]->(beer)
          SET r.rating = $rating, r.comment = $comment, r.timestamp = timestamp()
        `;
      return session.run(query, params["rate"])
        .then(result => {
          return true;
        })
    }
  }
};

export default resolvers;