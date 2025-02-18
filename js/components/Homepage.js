import React from 'react';
import { ArrowRight, MapPin, Users, Activity, Globe, ChevronDown } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase.js';

const Homepage = () => {
  const handleLoginClick = async () => {
    try {
      document.getElementById('loading-spinner').classList.remove('hidden');
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Inloggen mislukt. Probeer het opnieuw.');
    } finally {
      document.getElementById('loading-spinner').classList.add('hidden');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Wandel de wereld rond,
              <br />
              <span className="text-blue-600">vanuit je eigen buurt</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Volg je dagelijkse wandelingen en ontdek waar je zou zijn als je in één rechte lijn doorwandelde. Van Gent naar Sint-Petersburg? Van Brussel naar Marrakech?
            </p>
            <button 
              onClick={handleLoginClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
              Begin je reis <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Volg je vooruitgang</h3>
              <p className="text-gray-600">Leg je dagelijkse wandelingen vast en zie je totale afstand groeien.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ontdek nieuwe plaatsen</h3>
              <p className="text-gray-600">Zie waar je kilometers je theoretisch naartoe hebben gebracht op de wereldkaart.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wandel samen</h3>
              <p className="text-gray-600">Nodig vrienden uit en motiveer elkaar om meer te bewegen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Hoe het werkt</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Maak een account</h3>
              <p className="text-gray-600">Begin met een gratis account</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Kies je startpunt</h3>
              <p className="text-gray-600">Voer je thuislocatie in</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Log je wandelingen</h3>
              <p className="text-gray-600">Voeg dagelijks je kilometers toe</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Ontdek je reis</h3>
              <p className="text-gray-600">Zie waar je zou zijn gekomen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Verhalen van wandelaars</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <img src="/api/placeholder/64/64" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h3 className="font-semibold mb-2">Sarah uit Gent</h3>
                  <p className="text-gray-600 mb-4">"Ik wandel elke dag tijdens mijn lunchpauze. Na 6 maanden ontdekte ik dat ik theoretisch in Stockholm zou zijn!"</p>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">843 km afgelegd</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-start gap-4">
                <img src="/api/placeholder/64/64" alt="User" className="w-16 h-16 rounded-full" />
                <div>
                  <h3 className="font-semibold mb-2">Marc uit Brugge</h3>
                  <p className="text-gray-600 mb-4">"Sinds ik met pensioen ben, wandel ik elke ochtend. Volgens de app ben ik nu ergens in Zuid-Frankrijk!"</p>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm">1247 km afgelegd</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits & CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-blue-100 mb-6">Geïnspireerd door een idee van Mark Dirksen</p>
          <h2 className="text-3xl font-bold mb-8">Begin vandaag nog met wandelen</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Wandelen is niet alleen gezond, het is ook een geweldige manier om je omgeving te verkennen. 
            Start nu en ontdek waar je kilometers je naartoe brengen!
          </p>
          <button 
            onClick={handleLoginClick}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
            Maak gratis account
          </button>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
