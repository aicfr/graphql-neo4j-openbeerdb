import parser from 'express-useragent';

const userAgents = [{
    id: '1',
    osName: 'Windows',
    osFamily: '10'
}, {
    id: '2',
    osName: 'Windows',
    osFamily: '8'
}];

let nextId = 3;

const resolvers = {
    Query: {
        findAll: () => { return userAgents; },
        findById: (root, { id }) => {
            return userAgents.find(userAgent => userAgent.id === id);
        },
        parse: (root, { userAgent }) => {
            var ua = parser.parse(userAgent);
            const newUserAgent = { id: nextId++, osName: ua.os, osFamily: ua.platform };
            return newUserAgent;
        }
    },
    Mutation: {
        add: (root, args) => {
            console.log(args);
            const newUserAgent = { id: nextId++, osName: args.osName };
            userAgents.push(newUserAgent);
            return newUserAgent;
        },
    }
};

export default resolvers;