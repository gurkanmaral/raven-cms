export default {
  routes: [
    {
      method: 'GET',
      path: '/products',
      handler: 'product.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/products/:id',
      handler: 'product.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/products',
      handler: 'product.create',
    },
    {
      method: 'PUT',
      path: '/products/:id',
      handler: 'product.update',
    },
    {
      method: 'DELETE',
      path: '/products/:id',
      handler: 'product.delete',
    },
  ],
}
