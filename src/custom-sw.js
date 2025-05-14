self.addEventListener('push', event => {
  event.waitUntil((async () => {
    if (!event.data) return;

    let data;
    try {
      data = event.data.json();
    } catch (err) {
      console.error('Feil ved parsing av push-data:', err);
      return;
    }

    await self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      tag: data.tag || 'betel-push' // hindrer duplikater
    });

    const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clientsList.forEach(client =>
      client.postMessage({ type: 'NEW_PUSH', payload: data })
    );
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});