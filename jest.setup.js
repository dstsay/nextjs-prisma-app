// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') })

// Ensure critical environment variables are set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nextjs_prisma_test_db'
}
if (!process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL
}

// Mock environment variables for Cloudinary
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud'
process.env.CLOUDINARY_API_KEY = 'test_key'
process.env.CLOUDINARY_API_SECRET = 'test_secret'
process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test_cloud'

// Global test timeout for integration tests
jest.setTimeout(30000)

// Polyfills for Next.js server components - must be before any imports
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers || {})
      this.body = init?.body
    }
    
    async json() {
      return JSON.parse(this.body)
    }
    
    async text() {
      return this.body
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || 'OK'
      this.headers = new Headers(init?.headers || {})
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this._headers.set(key.toLowerCase(), value)
        })
      }
    }
    
    get(name) {
      return this._headers.get(name.toLowerCase())
    }
    
    set(name, value) {
      this._headers.set(name.toLowerCase(), value)
    }
    
    entries() {
      return this._headers.entries()
    }
  }
}

// Mock NextResponse for API route tests
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data, init = {}) => {
        const response = {
          body: JSON.stringify(data),
          status: init.status || 200,
          headers: new Headers(init.headers || {}),
          json: async () => data,
          text: async () => JSON.stringify(data)
        }
        return response
      }
    },
    NextRequest: class NextRequest {
      constructor(input, init) {
        this.url = input
        this.method = init?.method || 'GET'
        this.headers = new Headers(init?.headers || {})
        this._body = init?.body
      }
      
      async json() {
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
      }
    }
  }
})