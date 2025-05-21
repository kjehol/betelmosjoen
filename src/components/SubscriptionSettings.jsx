import React, { useState, useEffect } from 'react';

const SubscriptionSettings = ({ onClose }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sjekk om OneSignal er initialisert
    if (window.OneSignal) {
      const checkSubscription = async () => {
        try {
          const isPushEnabled = await window.OneSignal.User.PushSubscription.optedIn;
          setSubscribed(isPushEnabled);
        } catch (error) {
          console.warn("Kunne ikke sjekke push-status:", error);
        } finally {
          setLoading(false);
        }
      };
      checkSubscription();
    } else {
      console.warn("OneSignal SDK ikke initialisert.");
      setLoading(false);
    }
  }, []);

  const handleSubscriptionChange = async () => {
    if (window.OneSignal) {
      try {
        setLoading(true);
        if (subscribed) {
          // Si opp abonnementet
          await window.OneSignal.User.PushSubscription.optOut();
          setSubscribed(false);
        } else {
          // Abonner
          await window.OneSignal.User.PushSubscription.optIn();
          setSubscribed(true);
        }
      } catch (error) {
        console.error("Kunne ikke endre push-status:", error);
      } finally {
        setLoading(false);
      }
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
