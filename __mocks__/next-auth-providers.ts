const createProvider = (name: string) => {
  return jest.fn((config: any) => ({
    id: name,
    name,
    type: "oauth",
    ...config,
  }))
}

export default createProvider("default")
export const Google = createProvider("google")
export const Facebook = createProvider("facebook")
export const Apple = createProvider("apple")
export const Credentials = createProvider("credentials")