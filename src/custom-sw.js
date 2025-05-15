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

self.addEventListener('message', event => {
  if (event.data.type === 'GET_DATA') {
    // Håndter forespørsler fra klienten
    event.ports[0].postMessage({
      msg: 'Hello from the service worker!'
    });
  }
});