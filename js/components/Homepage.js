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

  // Landmarks array voor de afbeeldingsweergave
  const landmarks = [
    { file: 'colosseum-rome.jpeg', name: 'Colosseum, Rome', distance: '1.437 km' },
    { file: 'acropolis-athene.jpeg', name: 'Acropolis, Athene', distance: '2.090 km' },
    { file: 'sagrada-familia-barcelona.jpeg', name: 'Sagrada Familia, Barcelona', distance: '1.275 km' },
    { file: 'cliffs-Moher-Ireland.jpeg', name: 'Cliffs of Moher, Ierland', distance: '1.021 km' },
    { file: 'Neuschwanstein-Castle.jpeg', name: 'Neuschwanstein Kasteel, Duitsland', distance: '692 km' },
    { file: 'parijs.jpeg', name: 'Eiffeltoren, Parijs', distance: '316 km' },
  ];

  return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
    // Banner Section
    React.createElement('section', { className: 'relative' },
      React.createElement('div', { 
        className: 'w-full h-96 bg-cover bg-center',
        style: { 
          backgroundImage: 'url("../assets/banner.png")',
          backgroundColor: '#1a365d' // Fallback achtergrond als de afbeelding niet laadt
        }
      },
        React.createElement('div', { className: 'absolute inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center' },
          React.createElement('div', { className: 'text-center text-white p-6 max-w-4xl' },
            React.createElement('h1', { className: 'text-4xl font-bold mb-6' },
              'Wandel de wereld rond,',
              React.createElement('br'),
              'vanuit je eigen buurt'
            ),
            React.createElement('p', { className: 'text-xl mb-8' },
              'Volg je dagelijkse wandelingen en ontdek waar je zou zijn als je in één rechte lijn doorwandelde. Van Gent naar Sint-Petersburg? Van Brussel naar Marrakech?'
            ),
            React.createElement('button', {
              onClick: handleLoginClick,
              className: 'primary-btn px-8 py-4 text-lg'
            }, 'Begin je reis', React.createElement('span', { className: 'ml-2' }, '→'))
          )
        )
      )
    ),

    // Features Section
    React.createElement('section', { className: 'py-16 bg-white' },
      React.createElement('div', { className: 'container mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-12 text-gray-800' }, 'Hoe werkt WandelTracker?'),
        React.createElement('div', { className: 'grid md:grid-cols-3 gap-8' },
          // Feature 1
          React.createElement('div', { className: 'p-6 bg-white rounded-lg shadow-md' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto' },
              React.createElement('span', { className: 'text-blue-600 text-2xl' }, '1')
            ),
            React.createElement('h3', { className: 'text-xl font-semibold text-center mb-3 text-gray-800' }, 'Kies je startpunt'),
            React.createElement('p', { className: 'text-center text-gray-600' }, 
              'Maak een nieuw project aan met je thuislocatie als vertrekpunt voor je virtuele reis.'
            )
          ),
          // Feature 2
          React.createElement('div', { className: 'p-6 bg-white rounded-lg shadow-md' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto' },
              React.createElement('span', { className: 'text-blue-600 text-2xl' }, '2')
            ),
            React.createElement('h3', { className: 'text-xl font-semibold text-center mb-3 text-gray-800' }, 'Log je wandelingen'),
            React.createElement('p', { className: 'text-center text-gray-600' },
              'Noteer elke dag je wandelafstand. Zelfs korte wandelingen tellen mee voor je totaal.'
            )
          ),
          // Feature 3
          React.createElement('div', { className: 'p-6 bg-white rounded-lg shadow-md' },
            React.createElement('div', { className: 'bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto' },
              React.createElement('span', { className: 'text-blue-600 text-2xl' }, '3')
            ),
            React.createElement('h3', { className: 'text-xl font-semibold text-center mb-3 text-gray-800' }, 'Volg je voortgang'),
            React.createElement('p', { className: 'text-center text-gray-600' },
              'Zie op de kaart waar je kilometers je theoretisch naartoe hebben gebracht.'
            )
          )
        )
      )
    ),

    // Destinations Showcase
    React.createElement('section', { className: 'py-16 bg-gray-50' },
      React.createElement('div', { className: 'container mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-4 text-gray-800' }, 'Mogelijke bestemmingen'),
        React.createElement('p', { className: 'text-center text-gray-600 mb-12 max-w-2xl mx-auto' }, 
          'Ontdek waar je virtueel naartoe zou kunnen wandelen vanaf je startpunt.'
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          landmarks.map((landmark, index) => 
            React.createElement('div', { 
              key: index, 
              className: 'bg-white rounded-lg shadow-md overflow-hidden'
            },
              // Hier houden we de img tag, maar we geven een placeholder data-src attribuut om de bedoeling duidelijk te maken
              React.createElement('div', { 
                className: 'h-48 bg-gray-200 overflow-hidden',
                style: { position: 'relative' }
              }, 
                // Placeholder voor afbeelding die niet geladen kan worden
                React.createElement('div', {
                  className: 'absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-200'
                }, landmark.name),
                // De echte img tag met data-src zodat duidelijk is wat je bedoeling is
                React.createElement('img', {
                  'data-src': `../assets/${landmark.file}`,
                  alt: landmark.name,
                  className: 'w-full h-full object-cover',
                  style: { display: 'none' } // Verborgen in deze demo
                })
              ),
              React.createElement('div', { className: 'p-4' },
                React.createElement('h3', { className: 'font-bold text-lg mb-2 text-gray-800' }, landmark.name),
                React.createElement('p', { className: 'text-gray-600 flex items-center gap-2' },
                  '👣 Afstand vanaf Brussel: ',
                  React.createElement('span', { className: 'font-medium text-blue-600' }, landmark.distance)
                )
              )
            )
          )
        )
      )
    ),

    // Success Stories Section
    React.createElement('section', { className: 'py-16 bg-white' },
      React.createElement('div', { className: 'container mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-12 text-gray-800' }, 'Ervaringen van wandelaars'),
        React.createElement('div', { className: 'grid md:grid-cols-2 gap-8' },
          // Story 1
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow-md border border-gray-100' },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('div', { 
                className: 'w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold'
              }, 'S'),
              React.createElement('div', {},
                React.createElement('h3', { className: 'font-semibold mb-2 text-gray-800' }, 'Sarah uit Gent'),
                React.createElement('p', { className: 'text-gray-600 mb-4' },
                  '"Ik wandel elke dag tijdens mijn lunchpauze. Na 6 maanden ontdekte ik dat ik theoretisch in Stockholm zou zijn!"'
                ),
                React.createElement('div', { className: 'text-sm text-blue-600 font-medium' },
                  '👣 843 km afgelegd'
                )
              )
            )
          ),
          // Story 2
          React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow-md border border-gray-100' },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('div', { 
                className: 'w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold'
              }, 'M'),
              React.createElement('div', {},
                React.createElement('h3', { className: 'font-semibold mb-2 text-gray-800' }, 'Marc uit Brugge'),
                React.createElement('p', { className: 'text-gray-600 mb-4' },
                  '"Sinds ik met pensioen ben, wandel ik elke ochtend. Volgens de app ben ik nu ergens in Zuid-Frankrijk!"'
                ),
                React.createElement('div', { className: 'text-sm text-blue-600 font-medium' },
                  '👣 1247 km afgelegd'
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action Section
    React.createElement('section', { className: 'py-16 bg-blue-600 text-white' },
      React.createElement('div', { className: 'container mx-auto px-4 text-center' },
        React.createElement('h2', { className: 'text-3xl font-bold mb-6' }, 'Begin vandaag nog met wandelen'),
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
