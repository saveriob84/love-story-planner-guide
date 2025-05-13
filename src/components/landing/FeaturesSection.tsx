
import { CheckIcon, CalendarIcon, HeartIcon } from "lucide-react";

const features = [
  {
    name: 'Checklist interattiva',
    description: 'Segui il tuo percorso passo dopo passo con una timeline che ti guida dalla proposta al grande giorno.',
    icon: CheckIcon,
  },
  {
    name: 'Promemoria personalizzati',
    description: 'Ricevi notifiche per ogni scadenza importante per assicurarti di non dimenticare nulla.',
    icon: CalendarIcon,
  },
  {
    name: 'Profilo personalizzato',
    description: 'Salva tutte le tue preferenze, note e decisioni in un unico posto accessibile ovunque.',
    icon: HeartIcon,
  },
];

const FeaturesSection = () => {
  return (
    <div className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base font-semibold tracking-wide text-wedding-blush uppercase">Funzionalità</h2>
          <p className="mt-2 font-serif text-3xl font-extrabold text-wedding-navy sm:text-4xl">
            Il tuo assistente di matrimonio personale
          </p>
          <p className="mt-4 max-w-2xl text-gray-500 lg:mx-auto">
            Tutto ciò di cui hai bisogno per pianificare il matrimonio perfetto, senza stress e senza dimenticare nulla.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="wedding-card p-6">
                <div>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-wedding-blush/20 text-wedding-blush">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="mt-5">
                    <h3 className="font-serif text-lg font-medium text-wedding-navy">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h3 className="font-serif text-2xl font-extrabold text-wedding-navy sm:text-3xl">
              Una guida completa per ogni fase
            </h3>
            <p className="mt-3 text-lg text-gray-500">
              La nostra checklist è stata creata seguendo le migliori pratiche di pianificazione di matrimoni, ispirata a guide esperte come quella di Brides.com.
            </p>
            
            <div className="mt-8 space-y-4">
              {[
                'Pianificazione basata su timeline',
                'Suggerimenti per ogni fase',
                'Lista fornitori consigliati',
                'Gestione del budget',
              ].map((item) => (
                <div key={item} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-5 w-5 text-wedding-gold" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-base text-gray-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0 pl-0 lg:pl-8">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3"
                alt="Wedding planning checklist"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
