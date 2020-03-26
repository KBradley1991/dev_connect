//import axios from "axios";
const axios = require("axios");
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU3Y2RlZGIxMzNhYjUyYzVhYTkzMjhhIn0sImlhdCI6MTU4NTI0MTgyMCwiZXhwIjoxNTg1Mjc3ODIwfQ.3XTNZhCPrqd5VkHDZqv3BtQPH6QrLHpkii1U3PuNK0Y`;

const config = {
  headers: {
    // "Access-Control-Allow-Headers": "x-auth-token",
    "x-auth-token": token
  }
};

axios
  .get("http://localhost:5000/api/auth", config)
  .then(res => {
    console.log(res.data);
  })
  .catch(e => {
    console.error(e.response.data);
  });
