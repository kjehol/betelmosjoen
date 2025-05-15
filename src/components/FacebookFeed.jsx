import { useEffect } from "react";

export default function FacebookFeed() {
  useEffect(() => {
    // Last inn Facebook SDK hvis det ikke allerede er der
    if (!window.FB) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    } else {
      // Allerede lastet, parse elementer igjen
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="max-w-md w-full mx-auto my-8">
      <div
        className="fb-page"
        data-href="https://www.facebook.com/pinsekirken"
        data-tabs="timeline"
        data-width=""
        data-height=""
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="false"
      >
        <blockquote
          cite="https://www.facebook.com/pinsekirken"
          className="fb-xfbml-parse-ignore"
        >
          <a href="https://www.facebook.com/pinsekirken">Pinsekirken Betel Mosjøen</a>
        </blockquote>
      </div>
    </div>
  );
}
