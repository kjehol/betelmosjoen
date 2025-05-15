import { useEffect } from "react";

export default function FacebookFeed() {
  useEffect(() => {
    // Last inn Facebook SDK hvis det ikke allerede er der
    function parseFB() {
      if (window.FB && window.FB.XFBML) {
        window.FB.XFBML.parse();
      }
    }
    if (!window.FB) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v22.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => parseFB();
      document.body.appendChild(script);
    } else {
      parseFB();
    }
    // Rerender plugin ved resize
    window.addEventListener("resize", parseFB);
    return () => {
      window.removeEventListener("resize", parseFB);
    };
  }, []);

  return (
    <div className="w-full flex justify-center" style={{ margin: "0 auto", width: "100%" }}>
      <div
        className="fb-page"
        data-href="https://www.facebook.com/pinsekirken"
        data-tabs="timeline"
        data-width=""
        data-height=""
        data-small-header="true"
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
