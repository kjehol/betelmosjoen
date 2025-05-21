import React, { useState, useEffect } from 'react';

const SubscriptionSettings = ({ onClose }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sjekk om OneSignal er initialisert
    if (window.OneSignal) {
      window.OneSignal.isPushNotificationsEnabled(isEnabled => {
        setSubscribed(isEnabled);
        setLoading(false);
      });
    } else {
      console.warn("OneSignal SDK ikke initialisert.");
      setLoading(false);
    }
  }, []);

  const handleSubscriptionChange = async () => {
    if (window.OneSignal) {
      setLoading(true);
      if (subscribed) {
        // Si opp abonnementet
        window.OneSignal.setSubscription(false);
        setSubscribed(false);
      } else {
        // Abonner
        window.OneSignal.registerForPushNotifications();
        window.OneSignal.setSubscription(true);
        setSubscribed(true);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Varselinnstillinger</h2>
        {loading ? (
          <p>Laster inn...</p>
        ) : (
          <>
            <p className="mb-4">
              Du er for øyeblikket {subscribed ? 'abonnert' : 'ikke abonnert'} på push-varsler.
            </p>
            <button
              onClick={handleSubscriptionChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {subscribed ? 'Si opp abonnement' : 'Abonner'}
            </button>
          </>
        )}
        <button onClick={onClose} className="mt-4 text-blue-600 hover:underline block">
          Lukk
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
