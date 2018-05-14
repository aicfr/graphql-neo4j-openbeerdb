import empty from 'is-empty';

export const resolvers = {
  Query: {
    findBeerer: (_, params, ctx) => {

      const session = ctx.driver.session();

      const beererID = empty(params["filter"].id) ? '-1' : params["filter"].id;
      const beererName = params["filter"].name;
      const limit = params.first > 10 ? 10 : params.first;

      let where = `WHERE beerer.beererID = ` + beererID + ` OR LOWER(beerer.beererName) CONTAINS LOWER('` + beererName + `')`

      if (beererID != -1 && empty(beererName)) {
        where = `WHERE beerer.beererID =` + beererID
      }

      const query = `
          MATCH (beerer:Beerer)
          `+ where + `
          RETURN beerer
          LIMIT `+ limit + `;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          return result.records.map(record => {
            return record.get("beerer").properties;
          })
        });
    }
  },
  Beerer: {
    rated(beerer, args, ctx) {
      const session = ctx.driver.session(),
        limit = args.first > 5 ? 5 : args.first,
        params = { beererID: beerer.beererID },
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})-[rated:RATED]->(beer:Beer)
          RETURN beer,rated
          LIMIT `+ limit + `;
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
    checked(beerer, args, ctx) {
      const session = ctx.driver.session(),
        limit = args.first > 5 ? 5 : args.first,
        params = { beererID: beerer.beererID },
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})-[checked:CHECKED]->(beer:Beer)
          RETURN beer,checked
          LIMIT `+ limit + `;
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
    friends(beerer, args, ctx) {
      const session = ctx.driver.session(),
        limit = args.first > 5 ? 5 : args.first,
        params = { beererID: beerer.beererID },
        query = `
          MATCH (beerer:Beerer {beererID: $beererID})-[friendship:IS_FRIEND_OF]->(friendBeerer:Beerer)
          RETURN friendBeerer,friendship
          LIMIT `+ limit + `;
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