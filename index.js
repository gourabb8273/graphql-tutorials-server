const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const axios = require("axios");
const cors = require("cors");

/* ----------------------------------
   Type Definitions
---------------------------------- */
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

/* ----------------------------------
    Helper Functions
---------------------------------- */
const fetchTodos = async () => {
  try {
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos?_limit=10");
    return data;
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
};

const fetchUsers = async () => {
  try {
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/users");
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const fetchUserById = async (id) => {
  try {
    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

/* ----------------------------------
   Resolvers
---------------------------------- */
const resolvers = {
  Todo: {
    user: (todo) => fetchUserById(todo.userId),
  },
  Query: {
    getTodos: () => fetchTodos(),
    getAllUsers: () => fetchUsers(),
    getUser: (_, { id }) => fetchUserById(id),
  },
};

/* ----------------------------------
    Start Apollo + Express Server
---------------------------------- */
async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use("/graphql", expressMiddleware(server));

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
