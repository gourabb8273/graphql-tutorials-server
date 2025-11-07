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