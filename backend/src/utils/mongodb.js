import mongoose from 'mongoose'

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connect to MongoDB successfully')
  } catch (error) {
    console.error('Connect to MongoDB failure')
  }
}

export const disconnectDb = async () => {
  await mongoose.connection.close()
  console.log('Close MongoDB successfully')
}
