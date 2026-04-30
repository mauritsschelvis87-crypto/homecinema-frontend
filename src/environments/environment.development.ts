export const environment = {
  production: false,
  apiUrl: 'http://localhost:26856/api',
  devSession: {
    enabled: true,
    email: 'test@test.com',
    password: 'test',
    address: {
      street: 'teststraat 10',
      postalCode: '1234AB',
      city: 'Leiden',
      country: 'Netherlands',
    },
  },
  catalogSession: {
    enabled: false,
  },
};
