import empty from 'is-empty';

export const resolvers = {
  Brewery: {
    geocode(brewery, _, ctx) {
      const session = ctx.driver.session(),
        params = { breweryID: brewery.breweryID },
        query = `
          MATCH (brewery:Brewery {breweryID: $breweryID}) -[:GEOLOCATED_AT] -> (geocode:Geocode)
          RETURN geocode;
        `;
      return session.run(query, params)
        .then(result => {
          session.close();
          const geocode = result.records[0];
          return empty(geocode) ? { geocodeID: -1 } : geocode.get("geocode").properties;
        });
    }
  }
};