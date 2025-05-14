self.addEventListener('push', event => {
  event.waitUntil((async () => {
    const data = event.data?.json();
    if (!data) return;
    await self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png'
    });
    const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clientsList.forEach(client =>
      client.postMessage({ type: 'NEW_PUSH', payload: data })
    );
  })());
});