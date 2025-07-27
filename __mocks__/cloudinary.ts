export const v2 = {
  config: jest.fn(),
  uploader: {
    upload: jest.fn(),
    destroy: jest.fn(),
  },
  url: jest.fn(),
  utils: {
    api_sign_request: jest.fn(),
  },
  api: {
    resource: jest.fn(),
  },
};