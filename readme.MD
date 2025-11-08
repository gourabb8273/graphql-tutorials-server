# 🚀 GraphQL Server with Apollo + Subscriptions

This backend is a Node.js-based GraphQL API built using **Apollo Server**, **Express**, and **graphql-ws**.  
It supports both queries and real-time subscriptions via WebSocket.

---

## 📦 Tech Stack

- **Node.js**
- **Express**
- **Apollo Server v4**
- **graphql-ws** (for subscriptions)
- **@graphql-tools/schema**
- **Axios** (for data fetching from REST API)
- **CORS**

---

## 🧠 Features

- Query todos and users from JSONPlaceholder API.
- Fetch individual users by ID.
- Real-time **Todo updates via GraphQL Subscriptions**.
- Graceful server shutdown.
- Combined HTTP and WebSocket support on the same `/graphql` endpoint.

---
## ⚙️ Setup & Run

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Start the server
node index.js
The server runs at:

GraphQL HTTP Endpoint: http://localhost:4000/graphql

WebSocket Endpoint: ws://localhost:4000/graphql
```

Example Queries
🔍 Fetch Todos
query {
  getTodos {
    id
    title
    completed
    user {
      id
      name
      email
      phone
    }
  }
}

🔄 Real-Time Todo Subscription
subscription {
  todoAdded {
    id
    title
    completed
    user {
      id
      name
      email
      phone
    }
  }
}

🧹 Graceful Shutdown

To stop the server safely, press Ctrl + C — it will close HTTP and WebSocket servers gracefully.

# Query can be done like - nested

query GetAllTodos($getUserId: ID!) {
  getTodos {
    title
    completed
    user {
      name
      email
      phone
    }
  }
  getUser(id: $getUserId){
     name
     email
   }
}