const beers = [{
  beerID: 1,
  beerName: 'Hocus Pocus',
  description: "Our take on a classic summer ale.  A toast to weeds, rays, and summer haze.  A light, crisp ale for mowing lawns, hitting lazy fly balls, and communing with nature, Hocus Pocus is offered up as a summer sacrifice to clodless days. Its malty sweetness finishes tart and crisp and is best apprediated with a wedge of orange.",
  abv: 4.5,
  breweryID: 812,
  categoryID: 11,
  styleID: 116
}, {
  beerID: 2,
  beerName: 'Full Moon Winter Ale',
  description: "This full-bodied ale is brewed with roasted malts and a hint of Dark Belgian sugar for a perfectly balanced taste.",
  abv: 5.6,
  breweryID: 878,
  categoryID: 5,
  styleID: 72
}];

const breweries = {};
breweries['812'] = {
  breweryID: 812,
  breweryName: 'Magic Hat',
  address1: '5 Bartlett Bay Road',
  city: 'South Burlington',
  state: 'Vermont',
  zipCode: '5403',
  country: 'United States',
  phoneNumber: '1-802-658-2739',
  website: 'http://www.magichat.net',
  description: 'Burlington microbrewers of Humble Patience, Fat Angel, #9, Blind Faith IPA, and Heart of Darkness Oatmeal Stout.',
  geocodeID: 763
};

breweries['878'] = {
  breweryID: 878,
  breweryName: 'Molson Breweries of Canada',
  address1: '175 Bloor Street East',
  city: 'Toronto',
  state: 'Ontario',
  country: 'Canada',
  phoneNumber: '1-416-975-1786',
  geocodeID: 828
};

const geocodes = {};
geocodes['763'] = { geocodeID: 763, latitude: 44.4284, longitude: -73.2131 }
geocodes['828'] = { geocodeID: 828, latitude: 43.6706, longitude: -79.3824 }

const categories = {};
categories['5'] = { categoryID: 5, categoryName: 'Belgian and French Ale' }
categories['11'] = { categoryID: 11, categoryName: 'Other Style' }

const styles = {};
styles['72'] = { styleID: 72, styleName: 'Other Belgian-Style Ales' }
styles['116'] = { styleID: 116, styleName: 'Light American Wheat Ale or Lager' }

let nextId = 3;

const resolvers = {
  Query: {
    findAll: () => { return beers; }
  },
  Beer: {
    brewery(beer) {
      return breweries[beer.breweryID];
    },
    category(beer) {
      return categories[beer.categoryID];
    },
    style(beer) {
      return styles[beer.styleID];
    }
  },
  Brewery: {
    geocode(brewery) {
      return geocodes[brewery.geocodeID];
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