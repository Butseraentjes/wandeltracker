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

  // Landmarks array voor de afbeeldingscarrousel
  const landmarks = [
    { file: 'colosseum-rome.jpeg', name: 'Colosseum, Rome', distance: '1.437 km' },
    { file: 'acropolis-athene.jpeg', name: 'Acropolis, Athene', distance: '2.090 km' },
    { file: 'sagrada-familia-barcelona.jpeg', name: 'Sagrada Familia, Barcelona', distance: '1.275 km' },
    { file: 'cliffs-Moher-Ireland.jpeg', name: 'Cliffs of Moher, Ierland', distance: '1.021 km' },
    { file: 'Neuschwanstein-Castle.jpeg', name: 'Neuschwanstein Kasteel, Duitsland', distance: '692 km' },
    { file: 'parijs.jpeg', name: 'Eiffeltoren, Parijs', distance: '316 km' },
    { file: 'Grand-canyon.jpeg', name: 'Grand Canyon, VS', distance: '8.610 km' },
    { file: 'great-wall-china.jpeg', name: 'Chinese Muur, China', distance: '7.844 km' },
    { file: 'Machu-Picchu.jpeg', name: 'Machu Picchu, Peru', distance: '10.275 km' },
    { file: 'Taj-Mahal.jpeg', name: 'Taj Mahal, India', distance: '6.924 km' },
  ];

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-b from-yellow-50 to-white' },
    // Banner Section met afbeelding
    React.createElement('section', { className: 'relative' },
      React.createElement('div', { 
        className: 'w-full h-96 bg-cover bg-center',
        style: { backgroundImage: 'url("/wandeltracker/assets/banner.png")' }
      },
        React.createElement('div', { className: 'absolute inset-0 bg-orange-500 bg-opacity-40 flex items-center justify-center' },
          React.createElement('div', { className: 'text-center text-white p-6' },
            React.createElement('h1', { className: 'text-5xl font-bold mb-6' },
              'Wandel de wereld rond,',
              React.createElement('br'),
              React.createElement('span', { className: 'text-yellow-300' }, 'vanuit je eigen buurt')
            ),
            React.createElement('p', { className: 'text-xl mb-8 max-w-2xl mx-auto' },
              'Volg je dagelijkse wandelingen en ontdek waar je zou zijn als je in één rechte lijn doorwandelde.'
            ),
            React.createElement('button', {
              onClick: handleLoginClick,
              className: 'bg-pink-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors inline-flex items-center gap-2 shadow-lg'
            }, 'Begin je reis', React.createElement('span', {}, '→'))
          )
        )
      )
    ),

    // Landmarks Photo Carousel
    React.createElement('section', { className: 'py-20 bg-white' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-4 text-purple-600' }, 'Waar zou je kunnen komen?'),
        React.createElement('p', { className: 'text-center text-gray-600 mb-12 max-w-2xl mx-auto' }, 
          'Deze prachtige locaties zijn binnen wandelbereik, als je elke dag stapjes zet!'
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          landmarks.slice(0, 6).map((landmark, index) => 
            React.createElement('div', { 
              key: index, 
              className: 'relative overflow-hidden rounded-xl shadow-lg group cursor-pointer'
            },
              // Gebruik een placeholder afbeelding als fallback vanwege pad-problemen
              React.createElement('img', {
                src: `/api/placeholder/400/300?text=${landmark.name}`,
                alt: landmark.name,
                className: 'w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110'
              }),
              React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-purple-900 to-transparent opacity-80' }),
              React.createElement('div', { className: 'absolute bottom-0 left-0 right-0 p-6 text-white' },
                React.createElement('h3', { className: 'font-bold text-xl mb-1' }, landmark.name),
                React.createElement('p', { className: 'flex items-center' },
                  React.createElement('span', { className: 'mr-2' }, '👣'),
                  `Afstand: ${landmark.distance}`
                )
              )
            )
          )
        )
      )
    ),

    // Features Section
    React.createElement('section', { className: 'py-20 bg-gradient-to-r from-pink-500 to-orange-500 text-white' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center mb-16' }, 'Hoe werkt WandelTracker?'),
        React.createElement('div', { className: 'grid md:grid-cols-3 gap-10' },
          React.createElement('div', { className: 'bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-lg shadow-xl' },
            React.createElement('div', { className: 'bg-yellow-300 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg' },
              React.createElement('span', { className: 'text-3xl' }, '📍')
            ),
            React.createElement('h3', { className: 'text-xl font-semibold mb-4 text-center' }, 'Kies een route'),
            React.createElement('p', { className: 'text-center text-white' }, 
              'Kies een startpunt en bestemming om een route te maken. Bijvoorbeeld van Gent naar Rome!'
            )
          ),
          React.createElement('div', { className: 'bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-lg shadow-xl' },
            React.createElement('div', { className: 'bg-yellow-300 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg' },
              React.createElement('span', { className: 'text-3xl' }, '👣')
            ),
            React.createElement('h3', { className: 'text-xl font-semibold mb-4 text-center' }, 'Log je afstand'),
            React.createElement('p', { className: 'text-center text-white' },
              'Noteer elke dag je gewandelde afstand. Zelfs korte wandelingen tellen mee voor je eindbestemming!'
            )
          ),
          React.createElement('div', { className: 'bg-white bg-opacity-10 p-8 rounded-xl backdrop-blur-lg shadow-xl' },
            React.createElement('div', { className: 'bg-yellow-300 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg' },
              React.createElement('span', { className: 'text-3xl' }, '🗺️')
            ),
            React.createElement('h3', { className: 'text-xl font-semibold mb-4 text-center' }, 'Volg je voortgang'),
            React.createElement('p', { className: 'text-center text-white' },
              'Zie op de kaart hoe ver je bent gekomen en welke plekken je virtueel hebt bereikt!'
            )
          )
        )
      )
    ),

    // Success Stories Section met Testimonials en Foto's
    React.createElement('section', { className: 'py-20 bg-gradient-to-b from-white to-yellow-100' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center text-purple-600 mb-16' }, 'Verhalen van wandelaars'),
        React.createElement('div', { className: 'grid md:grid-cols-2 gap-8' },
          // Verhaal 1
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg border-2 border-pink-200' },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('div', { 
                className: 'min-w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center',
              },
                React.createElement('span', { className: 'text-3xl' }, '👩‍🦰')
              ),
              React.createElement('div', {},
                React.createElement('h3', { className: 'font-semibold mb-2 text-pink-600' }, 'Sarah uit Gent'),
                React.createElement('p', { className: 'text-gray-600 mb-4' },
                  '"In 6 maanden heb ik virtueel Athene bereikt! De app motiveerde me elke dag om meer stappen te zetten."'
                ),
                React.createElement('div', { className: 'flex items-center gap-2 text-orange-500 font-bold' },
                  React.createElement('span', { className: 'text-sm' }, '👣 2.090 km afgelegd')
                )
              )
            )
          ),
          // Verhaal 2
          React.createElement('div', { className: 'bg-white p-6 rounded-xl shadow-lg border-2 border-pink-200' },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('div', { 
                className: 'min-w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center',
              },
                React.createElement('span', { className: 'text-3xl' }, '👨‍🦳')
              ),
              React.createElement('div', {},
                React.createElement('h3', { className: 'font-semibold mb-2 text-pink-600' }, 'Marc uit Brugge'),
                React.createElement('p', { className: 'text-gray-600 mb-4' },
                  '"Sinds ik met pensioen ben, wandel ik elke ochtend. Na vier maanden bereikte ik virtueel Parijs!"'
                ),
                React.createElement('div', { className: 'flex items-center gap-2 text-orange-500 font-bold' },
                  React.createElement('span', { className: 'text-sm' }, '👣 316 km afgelegd')
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action Section
    React.createElement('section', { className: 'py-20 bg-gradient-to-r from-amber-500 to-pink-500 text-white' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4 text-center' },
        React.createElement('p', { className: 'text-yellow-200 mb-6 font-bold' }, 'Geïnspireerd? Begin vandaag nog!'),
        React.createElement('h2', { className: 'text-3xl font-bold mb-8' }, 'Waar wil jij naartoe wandelen?'),
        React.createElement('div', { className: 'flex flex-wrap gap-4 justify-center mb-10' },
          landmarks.slice(0, 5).map((landmark, index) => 
            React.createElement('span', { 
              key: index,
              className: 'px-4 py-2 bg-white bg-opacity-30 rounded-full text-sm backdrop-blur-sm'
            }, landmark.name)
          )
        ),
        React.createElement('button', {
          onClick: handleLoginClick,
          className: 'bg-white text-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-100 transition-colors shadow-xl'
        }, 'Start je wandel-avontuur')
      )
    )
  );
};

export default Homepage;
