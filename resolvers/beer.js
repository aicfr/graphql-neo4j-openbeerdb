import fetch from 'node-fetch';
import NodeCache from 'node-cache';
import empty from 'is-empty';
import HttpsProxyAgent from 'https-proxy-agent';

const myCache = new NodeCache();

export const resolvers = {
  Query: {
    findBeer: (_, params, ctx) => {
      const session = ctx.driver.session();

      const beerID = empty(params["filter"].id) ? '-1' : params["filter"].id;
      const beerName = params["filter"].name;
      const limit = params.first > 10 ? 10 : params.first;

      let where = `WHERE beer.beerID = ` + beerID + ` OR LOWER(beer.beerName) CONTAINS LOWER('` + beerName + `')`

      if (beerID != -1 && empty(beerName)) {
        where = `WHERE beer.beerID =` + beerID
      }

      const query = `
          MATCH (beer:Beer)
          `+ where + `
          RETURN beer
          LIMIT `+ limit + `;
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
    rating(beer, _, ctx) {
      const session = ctx.driver.session(),
        params = { beerID: beer.beerID },
        query = `
          MATCH ()-[r:RATED]->(beer:Beer {beerID: $beerID})
          RETURN avg(r.rating) AS avg, count(*) AS rating
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          const record = result.records[0];
          return {
            avg: record.get("avg"),
            rating: empty(record.get("avg")) ? null : record.get("rating")
          }
        });
    },
    picture(beer) {
      try {
        return myCache.get(beer.beerID.low, true);
      } catch (err) {
        const proxyUrl = process.env.HTTP_PROXY_AGENT_URL;
        const proxy = empty(proxyUrl) ? null : new HttpsProxyAgent(proxyUrl);
        return fetch(`https://api.qwant.com/api/search/images?count=1&offset=1&q=` + "beer " + encodeURIComponent(beer.beerName),
          { agent: proxy })
          .then(res => res.json())
          .then(result => {
            let picture
            const item = result.data.result.items[0];
            if (!empty(item)) {
              picture = item.media;
              myCache.set(beer.beerID.low, picture);
            }

            return picture;
          });
      }
    },
    brewery(beer, _, ctx) {
      const session = ctx.driver.session(),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer {beerID: $beerID}) -[:BREWED_AT] -> (brewery:Brewery)
          RETURN brewery;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          const brewery = result.records[0];
          return empty(brewery) ? { breweryID: -1 } : brewery.get("brewery").properties;
        });
    },
    category(beer, _, ctx) {
      const session = ctx.driver.session(),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer {beerID: $beerID}) -[:BEER_CATEGORY] -> (category:Category)
          RETURN category;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          const category = result.records[0];
          return empty(category) ?
            { categoryID: 11, categoryName: "Other Style" } :
            category.get("category").properties;
        });
    },
    style(beer, _, ctx) {
      const session = ctx.driver.session(),
        params = { beerID: beer.beerID },
        query = `
          MATCH (beer:Beer {beerID: $beerID}) -[:BEER_STYLE] -> (style:Style)
          RETURN style;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          const style = result.records[0];
          return empty(style) ?
            { styleID: 132, styleName: "Out of Category" } :
            style.get("style").properties;
        });
    }
  }
};