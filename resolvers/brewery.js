import { v1 as neo4j } from 'neo4j-driver';
import empty from 'is-empty';

const driver = new neo4j.driver("bolt://neo4j", neo4j.auth.basic("neo4j", "openbeerdb"));

export const resolvers = {
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
          const geocode = result.records[0];
          return empty(geocode) ? { geocodeID: -1 } : geocode.get("geocode").properties;
        });
    }
  }
};