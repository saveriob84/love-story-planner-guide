
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

const HeroSection = ({ onRegisterClick }: HeroSectionProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-4.0.3')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="md:w-2/3">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-wedding-navy drop-shadow-sm">
            Pianifica il <span className="text-wedding-blush">matrimonio</span> dei tuoi sogni
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-3xl text-gray-700">
            La guida passo dopo passo per organizzare ogni dettaglio del tuo giorno speciale, dalla location alle bomboniere.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              onClick={onRegisterClick}
              className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90 font-medium text-base"
            >
              Inizia a pianificare
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-wedding-navy text-wedding-navy hover:bg-wedding-navy/5"
            >
              Scopri di più
            </Button>
          </div>
          
          <div className="mt-12 flex items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200">
                  {/* Placeholder for user avatars */}
                </div>
              ))}
            </div>
            <p className="ml-4 text-sm font-medium text-gray-700">
              +1.000 coppie hanno già pianificato il loro matrimonio con noi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
