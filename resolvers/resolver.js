const beers = [{
    id: '1',
    name: '1664'
}, {
    id: '2',
    name: 'Heineken'
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