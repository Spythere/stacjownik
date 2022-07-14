module.exports = {
  pwa: {
    workboxPluginModule: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,

      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://stacjownik.eu-4.evennode.com/api/getSceneries'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'sceneries-cache'
          },
        },
      ],
    },
  },
};
