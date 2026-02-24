import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connection_instance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Connection name: ${connection_instance.connection.name}`)
        console.log(`Connection host: ${connection_instance.connection.host}`)
    } catch (error) {
        console.log(`Error in db connection: ${error}`)
        throw error
    }
}

export { connectDB }