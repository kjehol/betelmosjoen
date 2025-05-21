import React from 'react';
import Layout from './Layout';

export default function Gi() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Givertjeneste</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Om givertjenesten</h2>
          <p className="mb-4">
            Pinsekirken Betel drives av frivillige midler og givertjenesten er en viktig del av menighetens økonomi. 
            Tusen takk for din gave!
          </p>
          <p>
            Kontakt oss gjerne på <a href="mailto:post@betelmosjoen.no" className="text-blue-600 hover:underline">
            post@betelmosjoen.no</a> hvis du har spørsmål om givertjenesten.
          </p>
          <p>
            Nedenfor finner du informasjon om hvordan du kan gi til menigheten.
            Du kan gi en engangs-gave eller bli fast giver.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-10 shadow-md">
            <h3 className="text-xl text-center font-semibold mb-4">Gi over bank</h3>
            <p className="text-center mb-6">
                Ønsker du å bli fast giver kan du sette opp en fast månedlig overføring til konto:</p>
            <p className="font-bold text-3xl text-center">1503.48.52615</p>
          </div>
        </div>

        <div>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg shadow-md p-6 mb-10">
            <img
              src="/images/vipps.png"
              alt="Vipps"
              className="h-20 mb-4"
            />
            <h2 className="text-xl font-semibold text-center">Gi med Vipps</h2>
            <p className="mb-6 text-center">
                Du kan enkelt gi din gave til menigheten via Vipps ved å søke opp Pinsekirken Betel eller skrive inn vårt vippsnummer:
            </p>
              <p className="font-bold text-3xl">81044</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold">Om skattefradrag</h3>
          <p className="mb-4">
            Gaver til menigheten kan gi rett til skattefradrag.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Man kan få skattefradrag om man gir minimum 500 kr totalt i løpet av året.</li>
            <li>Man får tilbake 22% av gaven som skattefradrag opp til 25.000kr per person.</li>
            <li>Om du ønsker skattefradrag for gaven må du sende navn og personnummer til post@betelmosjoen.no (for registrering hos skattemyndighetene).</li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <img
            src="/images/gi.png"
            alt="Givertjeneste"
            className="w-3/5 h-auto"
          />
        </div>
      </div>
    </Layout>
  );
}
