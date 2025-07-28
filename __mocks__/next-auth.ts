export const auth = jest.fn()

export const signIn = jest.fn()
export const signOut = jest.fn()

export const handlers = {
  GET: jest.fn(),
  POST: jest.fn(),
}

const NextAuth = jest.fn(() => ({
  auth,
  signIn,
  signOut,
  handlers,
}))

export default NextAuth