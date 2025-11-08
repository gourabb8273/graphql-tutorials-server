import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import axios from "axios";
import cors from "cors";

// websocket import
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";

/* ------------------------------
   Schema & Type Definitions
-------------------------------- */
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

  type Subscription {
    todoAdded: Todo
  }
`;

const fetchTodos = async () => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos?_limit=10");
  return data;
};

const fetchUsers = async () => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/users");
  return data;
};

const fetchUserById = async (id) => {
  if (!id) return null;
  const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
  return data;
};

const resolvers = {
  Todo: {
      user: (todo) => {
      // If user already exists (like in subscription), return it directly
      if (todo.user) return todo.user;
      if (todo.userId) return fetchUserById(todo.userId);
      return null;
    },
  },
  Query: {
    getTodos: () => fetchTodos(),
    getAllUsers: () => fetchUsers(),
    getUser: (_, { id }) => fetchUserById(id),
  },
  Subscription: {
    todoAdded: {
      subscribe: async function* () {
        while (true) {
          await new Promise((r) => setTimeout(r, 5000));
          yield {
            todoAdded: {
              id: String(Math.floor(Math.random() * 10000)),
              title: "New Todo from Subscription",
              completed: false,
              user: {
                userId: String(Math.floor(Math.random() * 10000)),
                name: "John Doe",
                email: "john@example.com",
                phone: "1234567890",
                website: "example.com",
              },
            },
          };
        }
      },
    },
  },
};

/* ------------------------------
   Apollo + WebSocket Server
-------------------------------- */
async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // WebSocket setup for subscriptions
  const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });
  const serverCleanup = useServer({ schema }, wsServer);

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  app.use(cors(), express.json(), expressMiddleware(apolloServer));

  const PORT = 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 GraphQL endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(`🔄 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await apolloServer.stop();
    wsServer.close(() => console.log("✅ WebSocket server closed"));
    httpServer.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer();