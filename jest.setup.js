// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') })

// Mock environment variables for Cloudinary
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud'
process.env.CLOUDINARY_API_KEY = 'test_key'
process.env.CLOUDINARY_API_SECRET = 'test_secret'
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test_cloud'