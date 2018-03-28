const beers = [{
  beerID: '1',
  beerName: '1664'
}, {
  beerID: '2',
  beerName: 'Heineken'
}];

let nextId = 3;

const resolvers = {
  Query: {
    findAll: () => { return beers; }
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