import { connectDB } from "./db/index.js"
import { app } from "./app.js"
import dotenv from "dotenv"

dotenv.config({ path: "./.env" })

const PORT = process.env.PORT

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log(`Error in application startup: ${error}`)
        throw error
    })
    const server = app.listen(PORT, () => {
        console.log(`Server is listening on: http://localhost:${PORT}`)
    })
    server.on("error", (error) => {
        console.log(`Error in server startup: ${error}`)
        throw error
    })
})
.catch((error) => {
    console.log(`Error in mongoDB connection: ${error}`)
    process.exit(1)
})