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

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-b from-blue-50 to-white' },
    // Hero Section
    React.createElement('section', { className: 'relative py-20 px-4' },
      React.createElement('div', { className: 'max-w-6xl mx-auto' },
        React.createElement('div', { className: 'text-center mb-16' },
          React.createElement('h1', { className: 'text-5xl font-bold text-gray-900 mb-6' },
            'Wandel de wereld rond,',
            React.createElement('br'),
            React.createElement('span', { className: 'text-blue-600' }, 'vanuit je eigen buurt')
          ),
          React.createElement('p', { className: 'text-xl text-gray-600 mb-8 max-w-2xl mx-auto' },
            'Volg je dagelijkse wandelingen en ontdek waar je zou zijn als je in één rechte lijn doorwandelde. Van Gent naar Sint-Petersburg? Van Brussel naar Marrakech?'
          ),
          React.createElement('button', {
            onClick: handleLoginClick,
            className: 'bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2'
          }, 'Begin je reis', React.createElement('span', {}, '→'))
        )
      )
    ),

    // Features Section
    React.createElement('section', { className: 'py-20 bg-white' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
        React.createElement('div', { className: 'grid md:grid-cols-3 gap-8' },
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg' },
            React.createElement('div', { className: 'bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4' },
              React.createElement('span', { className: 'text-blue-600 text-xl' }, '📍')
            ),
            React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Volg je vooruitgang'),
            React.createElement('p', { className: 'text-gray-600' }, 
              'Leg je dagelijkse wandelingen vast en zie je totale afstand groeien.'
            )
          ),
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg' },
            React.createElement('div', { className: 'bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4' },
              React.createElement('span', { className: 'text-blue-600 text-xl' }, '🌍')
            ),
            React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Ontdek nieuwe plaatsen'),
            React.createElement('p', { className: 'text-gray-600' },
              'Zie waar je kilometers je theoretisch naartoe hebben gebracht op de wereldkaart.'
            )
          ),
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg' },
            React.createElement('div', { className: 'bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4' },
              React.createElement('span', { className: 'text-blue-600 text-xl' }, '👥')
            ),
            React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Wandel samen'),
            React.createElement('p', { className: 'text-gray-600' },
              'Nodig vrienden uit en motiveer elkaar om meer te bewegen.'
            )
          )
        )
      )
    ),

    // How it Works Section
    React.createElement('section', { className: 'py-20 bg-gray-50' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-16' }, 'Hoe het werkt'),
        React.createElement('div', { className: 'grid md:grid-cols-4 gap-8' },
          // Step 1
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4' },
              React.createElement('span', { className: 'text-2xl font-bold text-blue-600' }, '1')
            ),
            React.createElement('h3', { className: 'font-semibold mb-2' }, 'Maak een account'),
            React.createElement('p', { className: 'text-gray-600' }, 'Begin met een gratis account')
          ),
          // Step 2
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4' },
              React.createElement('span', { className: 'text-2xl font-bold text-blue-600' }, '2')
            ),
            React.createElement('h3', { className: 'font-semibold mb-2' }, 'Kies je startpunt'),
            React.createElement('p', { className: 'text-gray-600' }, 'Voer je thuislocatie in')
          ),
          // Step 3
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4' },
              React.createElement('span', { className: 'text-2xl font-bold text-blue-600' }, '3')
            ),
            React.createElement('h3', { className: 'font-semibold mb-2' }, 'Log je wandelingen'),
            React.createElement('p', { className: 'text-gray-600' }, 'Voeg dagelijks je kilometers toe')
          ),
          // Step 4
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4' },
              React.createElement('span', { className: 'text-2xl font-bold text-blue-600' }, '4')
            ),
            React.createElement('h3', { className: 'font-semibold mb-2' }, 'Ontdek je reis'),
            React.createElement('p', { className: 'text-gray-600' }, 'Zie waar je zou zijn gekomen')
          )
        )
      )
    ),

    // Success Stories Section
    React.createElement('section', { className: 'py-20 bg-white' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-16' }, 'Verhalen van wandelaars'),
        React.createElement('div', { className: 'grid md:grid-cols-2 gap-8' },
          // Story 1
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg' },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('img', { 
                src: '/api/placeholder/64/64',
                alt: 'User',
                className: 'w-16 h-16 rounded-full'
              }),
              React.createElement('div', {},
                React.createElement('h3', { className: 'font-semibold mb-2' }, 'Sarah uit Gent'),
                React.createElement('p', { className: 'text-gray-600 mb-4' },
                  '"Ik wandel elke dag tijdens mijn lunchpauze. Na 6 maanden ontdekte ik dat ik theoretisch in Stockholm zou zijn!"'
                ),
                React.createElement('div', { className: 'flex items-center gap-2 text-blue-600' },
                  React.createElement('span', { className: 'text-sm' }, '👣 843 km afgelegd')
                )
              )
            )
          ),
          // Story 2
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg' },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('img', {
                src: '/api/placeholder/64/64',
                alt: 'User',
                className: 'w-16 h-16 rounded-full'
              }),
              React.createElement('div', {},
                React.createElement('h3', { className: 'font-semibold mb-2' }, 'Marc uit Brugge'),
                React.createElement('p', { className: 'text-gray-600 mb-4' },
                  '"Sinds ik met pensioen ben, wandel ik elke ochtend. Volgens de app ben ik nu ergens in Zuid-Frankrijk!"'
                ),
                React.createElement('div', { className: 'flex items-center gap-2 text-blue-600' },
                  React.createElement('span', { className: 'text-sm' }, '👣 1247 km afgelegd')
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action Section
    React.createElement('section', { className: 'py-20 bg-blue-600 text-white' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4 text-center' },
        React.createElement('p', { className: 'text-blue-100 mb-6' }, 'Geïnspireerd door een idee van Mark Dirksen'),
        React.createElement('h2', { className: 'text-3xl font-bold mb-8' }, 'Begin vandaag nog met wandelen'),
        React.createElement('p', { className: 'text-xl mb-8 max-w-2xl mx-auto' },
          'Wandelen is niet alleen gezond, het is ook een geweldige manier om je omgeving te verkennen. Start nu en ontdek waar je kilometers je naartoe brengen!'
        ),
        React.createElement('button', {
          onClick: handleLoginClick,
          className: 'bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors'
        }, 'Maak gratis account')
      )
    )
  );
};

export default Homepage;
