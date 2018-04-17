import empty from 'is-empty';
import { NotFound } from '../errors';

export const resolvers = {
  Query: {
    findBeererById: (_, params, ctx) => {
      const session = ctx.driver.session(),
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})
          RETURN beerer;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          const beerer = result.records[0];
          if (empty(beerer)) {
            throw new NotFound({
              data: {
                beererID: params
              }
            });
          }

          return beerer.get("beerer").properties;
        });
    }
  },
  Beerer: {
    rated(beerer, _, ctx) {
      const session = ctx.driver.session(),
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
    checked(beerer, _, ctx) {
      const session = ctx.driver.session(),
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
    friends(beerer, _, ctx) {
      const session = ctx.driver.session(),
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
  // Mutation
  Mutation: {
    rate: (_, params, ctx) => {
      // TODO: Check input parameters
      const session = ctx.driver.session(),
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
    check: (_, params, ctx) => {
      // TODO: Check input parameters
      const session = ctx.driver.session(),
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
    addFriend: (_, params, ctx) => {
      // TODO: Check input parameters
      const session = ctx.driver.session(),
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