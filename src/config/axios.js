import axios from "axios"

const api = axios.create({

    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/searching-as-learning",
    headers: {
        "Content-Type": "application/json"
    }

})

export { api }