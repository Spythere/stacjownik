import { useRegisterSW } from 'virtual:pwa-register/vue';

export default () => {
  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    immediate: true
  });

  return {
    needRefresh,
    updateServiceWorker,
    offlineReady
  };
};
