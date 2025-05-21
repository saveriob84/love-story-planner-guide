
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthContext";

import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      if (user.role === 'vendor') {
        navigate('/vendor-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <header className="py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center">
          <img src="/wedding-logo.svg" alt="Wedding Planner" className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold text-wedding-navy">Wedding</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleLoginClick}
            className="text-wedding-navy hover:text-wedding-navy/80"
          >
            Accedi
          </button>
          <button
            onClick={handleRegisterClick}
            className="bg-wedding-blush text-wedding-navy px-4 py-2 rounded-md hover:bg-wedding-blush/90"
          >
            Registrati
          </button>
        </div>
      </header>

      <main>
        <HeroSection onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
        <FeaturesSection />
        <TestimonialsSection />
        
        {/* Vendor Section */}
        <section className="bg-wedding-sage/10 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-wedding-navy mb-4">
                Hai un'attività nel settore wedding?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Entra a far parte del nostro catalogo di fornitori e raggiungi le coppie che stanno pianificando il loro matrimonio.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
              <div className="p-8">
                <h3 className="text-xl font-bold text-wedding-navy mb-4">
                  Espandi il tuo business
                </h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-wedding-sage mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Crea il tuo profilo professionista</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-wedding-sage mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Promuovi i tuoi servizi nella nostra roadmap</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-wedding-sage mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Raggiungi centinaia di coppie nella tua zona</span>
                  </li>
                </ul>
                <button
                  onClick={handleRegisterClick}
                  className="w-full bg-wedding-sage text-white px-4 py-2 rounded-md hover:bg-wedding-sage/90"
                >
                  Registrati come fornitore
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-wedding-navy text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <img src="/wedding-logo.svg" alt="Wedding Planner" className="h-8 w-8 filter brightness-0 invert" />
                <span className="ml-2 text-xl font-bold">Wedding</span>
              </div>
              <p className="text-sm mt-2 text-gray-300">
                La tua guida passo dopo passo per un matrimonio perfetto
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white">
                Chi siamo
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Contatti
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Termini
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Wedding Planner. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onRegisterClick={handleRegisterClick}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
};

export default Index;
