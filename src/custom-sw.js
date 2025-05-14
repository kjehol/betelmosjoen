importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js')
self.addEventListener('push', event => {
    const data = event.data?.json();
    if (data) {
      // Vis notifikasjon
      event.waitUntil(
        self.registration.showNotification(data.title, {
          body: data.body,
          icon: '/icon-192x192.png'
        })
      );
      // Send melding til alle åpne faner
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => {
          clients.forEach(client =>
            client.postMessage({ type: 'NEW_PUSH', payload: data })
          );
        });
    }
  });