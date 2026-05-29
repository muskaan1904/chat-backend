import axios from "axios";

async function testSignup() {
  try {
    console.log("Sending post request to http://localhost:4000/api/auth/signup...");
    const res = await axios.post("http://localhost:4000/api/auth/signup", {
      username: "test_" + Date.now(),
      email: "test_" + Date.now() + "@example.com",
      password: "password123"
    });
    console.log("Response status:", res.status);
    console.log("Response data:", res.data);
  } catch (err) {
    console.error("Signup failed!");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Error message:", err.message);
    }
  }
}

testSignup();
