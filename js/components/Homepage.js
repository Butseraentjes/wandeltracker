// Homepage.js
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
