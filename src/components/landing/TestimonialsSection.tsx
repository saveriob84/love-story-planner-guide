
const testimonials = [
  {
    content: "Grazie a questa piattaforma siamo riusciti a pianificare il nostro matrimonio senza stress. La checklist è stata fondamentale per non dimenticare nulla!",
    author: {
      name: "Maria e Luca",
      location: "Milano",
      imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3"
    }
  },
  {
    content: "La funzione dei promemoria ci ha salvati più volte! Non avremmo mai pensato che pianificare un matrimonio potesse essere così organizzato e semplice.",
    author: {
      name: "Giulia e Marco",
      location: "Roma",
      imageUrl: "https://images.unsplash.com/photo-1614436163996-25cee5f54290?ixlib=rb-4.0.3"
    }
  },
  {
    content: "Poter accedere alla nostra pianificazione da qualsiasi dispositivo è stato utilissimo. Abbiamo preso decisioni insieme anche quando eravamo lontani.",
    author: {
      name: "Francesca e Andrea",
      location: "Firenze",
      imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3"
    }
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-wedding-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-wedding-navy">
            Cosa dicono le coppie di noi
          </h2>
          <p className="mt-4 text-gray-500 max-w-3xl mx-auto">
            Migliaia di coppie hanno già utilizzato la nostra piattaforma per pianificare il matrimonio dei loro sogni.
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="wedding-card flex flex-col h-full p-8">
              <div className="flex-grow">
                <div className="text-wedding-gold flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
              
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded-full object-cover" 
                    src={testimonial.author.imageUrl} 
                    alt={testimonial.author.name} 
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-wedding-navy">{testimonial.author.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.author.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-wedding-navy">
            Unisciti alle <span className="text-wedding-blush font-bold">1,000+</span> coppie felici che hanno pianificato il loro matrimonio con noi!
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
