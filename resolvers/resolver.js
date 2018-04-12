import { v1 as neo4j } from 'neo4j-driver';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import empty from 'is-empty';
import HttpsProxyAgent from 'https-proxy-agent';

const driver = new neo4j.driver("bolt://neo4j", neo4j.auth.basic("neo4j", "openbeerdb"));
const myCache = new NodeCache();

const resolvers = {
  Query: {
    findBeererById: (_, params) => {
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
    /*
      So bad...
    */
    findBeer: (_, params) => {
      const beerID = params["filter"].beerID;
      const beerName = params["filter"].beerName;
      let query = ``;

      if (empty(beerID)) {
        // Search by name
        query = `
          MATCH (beer:Beer)
          WHERE LOWER(beer.beerName) CONTAINS LOWER('`+ beerName + `')
          RETURN beer
          LIMIT 10;
        `;
      } else {
        // Search by ID
        query = `
          MATCH (beer:Beer {beerID: `+ beerID + `})
          RETURN beer
          LIMIT 10;
        `;
      }

      const session = driver.session(neo4j.session.READ);
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records.map(record => {
            return record.get("beer").properties;
          })
        });
    }
  },
  // Beerer
  Beerer: {
    rated(beerer) {
      const session = driver.session(neo4j.session.READ),
        params = { beererID: beerer.beererID },
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})-[rated:RATED]->(beer:Beer)
          RETURN beer,rated
          LIMIT 5;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records.map(record => {
            return {
              beer: record.get("beer").properties,
              rate: record.get("rated").properties
            }
          })
        });
    },
    checked(beerer) {
      const session = driver.session(neo4j.session.READ),
        params = { beererID: beerer.beererID },
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})-[checked:CHECKED]->(beer:Beer)
          RETURN beer,checked
          LIMIT 5;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records.map(record => {
            return {
              beer: record.get("beer").properties,
              check: record.get("checked").properties
            }
          })
        });
    },
    friends(beerer) {
      const session = driver.session(neo4j.session.READ),
        params = { beererID: beerer.beererID },
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})-[friendship:IS_FRIEND_OF]->(friendBeerer:Beerer)
          RETURN friendBeerer,friendship
          LIMIT 5;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records.map(record => {
            return {
              friend: record.get("friendBeerer").properties,
              friendship: record.get("friendship").properties
            }
          })
        });
    }
  },
  // Beer
  Beer: {
    picture(beer) {
      try {
        return myCache.get(beer.beerID.low, true);
      } catch (err) {
        // TODO: Proxy configuration by env
        return fetch(`https://api.qwant.com/api/search/images?count=1&offset=1&q=` + encodeURIComponent(beer.beerName),
          { agent: new HttpsProxyAgent(process.env.HTTP_PROXY_AGENT_URL) })
          .then(res => res.json())
          .then(result => {
            const picture = result.data.result.items[0].media;
            myCache.set(beer.beerID.low, picture);
            return picture;
          });
      }
    },
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
  // Brewery
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
  // Mutation
  Mutation: {
    rate: (_, params) => {
      const session = driver.session(neo4j.session.READ),
        query = `
          MATCH (beerer:Beerer {beererID: $me})
          MERGE (beer:Beer {beerID: $beerID})
          MERGE (beerer)-[r:RATED]->(beer)
          SET r.rating = $rating,r.comment = $comment,r.createdAt = timestamp()
        `;
      return session.run(query, params["input"])
        .then(result => {
          session.close();
          return true;
        })
    },
    check: (_, params) => {
      const session = driver.session(neo4j.session.READ),
        query = `
          MATCH (beerer:Beerer {beererID: $me})
          MATCH (beer:Beer {beerID: $beerID})
          CREATE (beerer)-[c:CHECKED]->(beer)
          SET c.location = $location,c.price = $price,c.createdAt = timestamp()
        `;
      return session.run(query, params["input"])
        .then(result => {
          session.close();
          return true;
        })
    },
    addFriend: (_, params) => {
      const session = driver.session(neo4j.session.READ),
        query = `
          MATCH (me:Beerer {beererID: $me})
          MERGE (friend:Beerer {beererID: $friendID})
          MERGE (me)-[i:IS_FRIEND_OF]->(friend)
          SET i.since = timestamp()
        `;
      return session.run(query, params["input"])
        .then(result => {
          session.close();
          return true;
        })
    }
  }
};

export default resolvers;