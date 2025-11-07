const express = require("express");
const { ApolloServer } = require("@apollo/server");
const axios = require("axios");
const { expressMiddleware } = require("@as-integrations/express5");
const cors = require("cors");

async function startServer() {
  const app = express();

  const typeDefs = `

  type User {
      id: ID!
      name: String!
      email: String!
      phone: String!
      website: String!
    }

    type Todo {
      id: ID!
      title: String!
      completed: Boolean!
      user: User
    }

    type Query {
      getTodos: [Todo!]!
      getAllUsers: [User!]!
      getUser(id: ID!): User
    }
  `;

  const resolvers = {
    Todo: {
      user: (todo) =>
        axios
          .get(`https://jsonplaceholder.typicode.com/users/${todo.id}`)
          .then((response) => response.data)
          .catch((error) => {
            console.error("Error fetching user:", error);
            return null;
          }),
    },
    Query: {
      getTodos: () =>
        axios
          .get("https://jsonplaceholder.typicode.com/todos?_limit=10")
          .then((response) => response.data)
          .catch((error) => {
            console.error("Error fetching todos:", error);
            return [];
          }),
      // example static data
      //     [
      //     { id: "1", title: "Learn GraphQL", completed: false },
      //     { id: "2", title: "Build a GraphQL Server", completed: true },
      //   ],

      getAllUsers: () =>
        axios
          .get("https://jsonplaceholder.typicode.com/users")
          .then((response) => response.data)
          .catch((error) => {
            console.error("Error fetching todos:", error);
            return [];
          }),

      getUser: (parent, { id }) =>
        axios
          .get(`https://jsonplaceholder.typicode.com/users/${id}`)
          .then((response) => response.data)
          .catch((error) => {
            console.error("Error fetching todos:", error);
            return [];
          }),
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  app.use(express.json());
  app.use(cors());
  app.use("/graphql", expressMiddleware(server));

  app.listen(4000, () => {
    console.log("🚀 Server ready at http://localhost:4000/graphql");
  });
}

startServer();
