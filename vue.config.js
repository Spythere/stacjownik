module.exports = {
  pwa: {
    workboxPluginModule: 'GenerateSW',
    workboxOptions: {
      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://stacjownik.eu-4.evennode.com/api/getSceneries'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'sceneries-cache',
            expiration: {
              maxAgeSeconds: 24 * 60 * 60, // 24 hours
            },
          },
        },
      ],
    },
  },
};
