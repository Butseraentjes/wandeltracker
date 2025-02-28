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

  // React hooks voor animatie-effecten
  React.useEffect(() => {
    // Lazy loading voor afbeeldingen
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      const src = img.getAttribute('data-src');
      const testImage = new Image();
      testImage.onload = function() {
        img.src = src;
        img.style.display = 'block';
        img.classList.add('fade-in');
        const placeholder = img.parentElement.querySelector('.placeholder');
        if (placeholder) placeholder.style.display = 'none';
      };
      testImage.onerror = () => console.warn(`Kon afbeelding niet laden: ${src}`);
      testImage.src = src;
    });

    // Scroll animaties voor elementen
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = (rect.top <= window.innerHeight * 0.8);
        if (isVisible) {
          el.classList.add('animate');
        }
      });
    };

    // Voeg scroll event listener toe
    window.addEventListener('scroll', animateOnScroll);
    // Trigger bij eerste load
    setTimeout(animateOnScroll, 100);

    // Toevoegen van dynamische achtergrondeffecten
    const addBackgroundParticles = () => {
      const heroSection = document.querySelector('.hero-section');
      if (!heroSection) return;
      
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('bg-particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        heroSection.appendChild(particle);
      }
    };

    // Voeg dynamische achtergrond toe
    addBackgroundParticles();

    // Cleanup functie
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  }, []);

  // Landmarks array voor de afbeeldingsweergave
  const landmarks = [
    { file: 'colosseum-rome.jpeg', name: 'Colosseum, Rome', distance: '1.437 km' },
    { file: 'acropolis-athene.jpeg', name: 'Acropolis, Athene', distance: '2.090 km' },
    { file: 'sagrada-familia-barcelona.jpeg', name: 'Sagrada Familia, Barcelona', distance: '1.275 km' },
    { file: 'cliffs-Moher-Ireland.jpeg', name: 'Cliffs of Moher, Ierland', distance: '1.021 km' },
    { file: 'Neuschwanstein-Castle.jpeg', name: 'Neuschwanstein Kasteel, Duitsland', distance: '692 km' },
    { file: 'parijs.jpeg', name: 'Eiffeltoren, Parijs', distance: '316 km' },
  ];

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-b from-indigo-50 via-white to-blue-50' },
    // Moderne hero sectie met animatie en gradient
    React.createElement('section', { 
      className: 'hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900'
    },
      // Overlay met textuur voor diepte
      React.createElement('div', { 
        className: 'absolute inset-0 opacity-20',
        style: { 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }
      }),
      
      // Content container
      React.createElement('div', { className: 'container mx-auto px-6 z-10 text-center relative' },
        // Dynamische elementen (cirkels) voor design
        React.createElement('div', { 
          className: 'absolute -top-20 -left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'
        }),
        React.createElement('div', { 
          className: 'absolute top-0 -right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'
        }),
        React.createElement('div', { 
          className: 'absolute -bottom-20 left-20 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000'
        }),
        
        // Main hero content
        React.createElement('div', { className: 'max-w-4xl mx-auto' },
          React.createElement('h1', { 
            className: 'text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight hero-title'
          }, 
            'Wandel de wereld rond,',
            React.createElement('span', { 
              className: 'block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300'
            }, 'vanuit je eigen buurt')
          ),
          React.createElement('p', { 
            className: 'text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed'
          },
            'Volg je dagelijkse wandelingen en ontdek waar je zou zijn als je in één rechte lijn doorwandelde. Van Brussel naar Rome? Van Gent naar Stockholm?'
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-center gap-4' },
            React.createElement('button', {
              onClick: handleLoginClick,
              className: 'px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'
            }, 
              React.createElement('span', { className: 'flex items-center' },
                'Begin je reis',
                React.createElement('svg', { 
                  xmlns: "http://www.w3.org/2000/svg", 
                  className: "h-5 w-5 ml-2", 
                  viewBox: "0 0 20 20", 
                  fill: "currentColor"
                },
                  React.createElement('path', { 
                    fillRule: "evenodd", 
                    d: "M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z", 
                    clipRule: "evenodd" 
                  })
                )
              )
            ),
            React.createElement('button', {
              className: 'px-8 py-4 rounded-full bg-white bg-opacity-10 text-white text-lg font-semibold transition-all hover:bg-opacity-20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-filter backdrop-blur-sm'
            }, 'Meer informatie')
          ),
          
          // Scroll indicator
          React.createElement('div', { className: 'absolute bottom-10 left-0 right-0 flex justify-center animate-bounce' },
            React.createElement('a', { href: '#features', className: 'text-white' },
              React.createElement('svg', { 
                xmlns: "http://www.w3.org/2000/svg", 
                className: "h-8 w-8", 
                fill: "none", 
                viewBox: "0 0 24 24", 
                stroke: "currentColor"
              },
                React.createElement('path', { 
                  strokeLinecap: "round", 
                  strokeLinejoin: "round", 
                  strokeWidth: 2, 
                  d: "M19 14l-7 7m0 0l-7-7m7 7V3" 
                })
              )
            )
          )
        )
      )
    ),

    // Features Section (moderne stijl)
    React.createElement('section', { 
      id: 'features', 
      className: 'py-24 bg-gradient-to-b from-white to-indigo-50'
    },
      React.createElement('div', { className: 'container mx-auto px-6' },
        React.createElement('div', { className: 'text-center max-w-3xl mx-auto mb-20 scroll-animate fade-up' },
          React.createElement('h2', { 
            className: 'text-4xl font-bold mb-6 text-indigo-900 tracking-tight' 
          }, 'Hoe werkt WandelTracker?'),
          React.createElement('p', { 
            className: 'text-xl text-indigo-700 opacity-80' 
          }, 'Drie eenvoudige stappen om je virtuele wandelreis te beginnen')
        ),
        
        React.createElement('div', { className: 'grid md:grid-cols-3 gap-12' },
          // Feature 1
          React.createElement('div', { 
            className: 'scroll-animate slide-up p-8 bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          },
            React.createElement('div', { 
              className: 'w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mb-8 mx-auto text-white text-3xl font-bold shadow-lg'
            }, '1'),
            React.createElement('h3', { 
              className: 'text-2xl font-bold text-center mb-4 text-indigo-900' 
            }, 'Kies je startpunt'),
            React.createElement('p', { 
              className: 'text-center text-gray-600 leading-relaxed' 
            }, 'Maak een nieuw project aan met je thuislocatie als vertrekpunt voor je virtuele reis.')
          ),
          
          // Feature 2
          React.createElement('div', { 
            className: 'scroll-animate slide-up animation-delay-300 p-8 bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          },
            React.createElement('div', { 
              className: 'w-20 h-20 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center mb-8 mx-auto text-white text-3xl font-bold shadow-lg'
            }, '2'),
            React.createElement('h3', { 
              className: 'text-2xl font-bold text-center mb-4 text-indigo-900' 
            }, 'Log je wandelingen'),
            React.createElement('p', { 
              className: 'text-center text-gray-600 leading-relaxed' 
            }, 'Noteer elke dag je wandelafstand. Zelfs korte wandelingen tellen mee voor je totaal.')
          ),
          
          // Feature 3
          React.createElement('div', { 
            className: 'scroll-animate slide-up animation-delay-600 p-8 bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl'
          },
            React.createElement('div', { 
              className: 'w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center mb-8 mx-auto text-white text-3xl font-bold shadow-lg'
            }, '3'),
            React.createElement('h3', { 
              className: 'text-2xl font-bold text-center mb-4 text-indigo-900' 
            }, 'Volg je voortgang'),
            React.createElement('p', { 
              className: 'text-center text-gray-600 leading-relaxed' 
            }, 'Zie op de kaart waar je kilometers je theoretisch naartoe hebben gebracht.')
          )
        )
      )
    ),

    // Destinations Section (moderne kaartenstijl)
    React.createElement('section', { 
      className: 'py-24 bg-gradient-to-b from-indigo-50 to-blue-50'
    },
      React.createElement('div', { className: 'container mx-auto px-6' },
        React.createElement('div', { className: 'text-center max-w-3xl mx-auto mb-16 scroll-animate fade-up' },
          React.createElement('h2', { 
            className: 'text-4xl font-bold mb-6 text-indigo-900 tracking-tight' 
          }, 'Mogelijke bestemmingen'),
          React.createElement('p', { 
            className: 'text-xl text-indigo-700 opacity-80' 
          }, 'Ontdek waar je virtueel naartoe zou kunnen wandelen vanaf je startpunt.')
        ),
        
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10' },
          landmarks.map((landmark, index) => 
            React.createElement('div', { 
              key: index, 
              className: `scroll-animate slide-up animation-delay-${index * 200} relative group overflow-hidden rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl`
            },
              // Afbeeldingscontainer
              React.createElement('div', { 
                className: 'h-60 overflow-hidden relative'
              }, 
                // Placeholder
                React.createElement('div', {
                  className: 'placeholder absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-200'
                }, landmark.name),
                
                // Afbeelding
                React.createElement('img', {
                  'data-src': `assets/${landmark.file}`,
                  alt: landmark.name,
                  className: 'w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110',
                  style: { display: 'none' }
                }),
                
                // Gradient overlay
                React.createElement('div', {
                  className: 'absolute inset-0 bg-gradient-to-t from-indigo-900 to-transparent opacity-80'
                })
              ),
              
              // Content
              React.createElement('div', { 
                className: 'absolute bottom-0 left-0 right-0 p-6 transition-transform duration-300 transform translate-y-0 group-hover:translate-y-0'
              },
                React.createElement('h3', { 
                  className: 'font-bold text-2xl mb-2 text-white' 
                }, landmark.name),
                React.createElement('div', { 
                  className: 'flex items-center mb-2' 
                },
                  React.createElement('span', { 
                    className: 'inline-block bg-blue-500 bg-opacity-50 text-white text-sm font-medium py-1 px-3 rounded-full backdrop-filter backdrop-blur-sm' 
                  }, 
                    '👣 ' + landmark.distance
                  )
                ),
                React.createElement('div', {
                  className: 'h-0 group-hover:h-auto overflow-hidden transition-all duration-300'
                },
                  React.createElement('p', {
                    className: 'text-blue-100 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700'
                  }, `Ontdek wat ${landmark.name} te bieden heeft wanneer je virtueel arriveert. Begin met wandelen en volg je voortgang!`)
                )
              )
            )
          )
        )
      )
    ),

    // Testimonials Section
    React.createElement('section', { 
      className: 'py-24 bg-gradient-to-b from-blue-50 to-white'
    },
      React.createElement('div', { className: 'container mx-auto px-6' },
        React.createElement('div', { className: 'text-center max-w-3xl mx-auto mb-16 scroll-animate fade-up' },
          React.createElement('h2', { 
            className: 'text-4xl font-bold mb-6 text-indigo-900 tracking-tight' 
          }, 'Ervaringen van wandelaars'),
          React.createElement('p', { 
            className: 'text-xl text-indigo-700 opacity-80' 
          }, 'Ontdek hoe WandelTracker anderen heeft gemotiveerd')
        ),
        
        React.createElement('div', { className: 'grid md:grid-cols-2 gap-10' },
          // Testimonial 1
          React.createElement('div', { 
            className: 'scroll-animate slide-right bg-white p-8 rounded-2xl shadow-xl relative'
          },
            // Decoratie elementen
            React.createElement('div', {
              className: 'absolute -top-4 -left-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center z-10'
            },
              React.createElement('div', {
                className: 'w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl'
              }, 'S')
            ),
            React.createElement('div', {
              className: 'absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full opacity-60'
            }),
            
            // Content
            React.createElement('div', { className: 'relative pl-6' },
              React.createElement('div', {
                className: 'text-4xl text-indigo-200 absolute top-0 left-0'
              }, '"'),
              React.createElement('p', { 
                className: 'text-gray-600 mb-6 leading-relaxed italic' 
              }, 'Ik wandel elke dag tijdens mijn lunchpauze. Na 6 maanden ontdekte ik dat ik theoretisch in Stockholm zou zijn! Het is een geweldige motivatie om elke dag een wandeling te maken.'),
              React.createElement('div', { className: 'flex items-center' },
                React.createElement('div', {},
                  React.createElement('h4', { 
                    className: 'font-bold text-indigo-900' 
                  }, 'Sarah uit Gent'),
                  React.createElement('div', { 
                    className: 'flex items-center text-sm text-indigo-600 mt-1 font-medium' 
                  }, '👣 843 km afgelegd')
                )
              )
            )
          ),
          
          // Testimonial 2
          React.createElement('div', { 
            className: 'scroll-animate slide-left bg-white p-8 rounded-2xl shadow-xl relative'
          },
            // Decoratie elementen
            React.createElement('div', {
              className: 'absolute -top-4 -left-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center z-10'
            },
              React.createElement('div', {
                className: 'w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl'
              }, 'M')
            ),
            React.createElement('div', {
              className: 'absolute -top-2 -left-2 w-8 h-8 bg-teal-400 rounded-full opacity-60'
            }),
            
            // Content
            React.createElement('div', { className: 'relative pl-6' },
              React.createElement('div', {
                className: 'text-4xl text-indigo-200 absolute top-0 left-0'
              }, '"'),
              React.createElement('p', { 
                className: 'text-gray-600 mb-6 leading-relaxed italic' 
              }, 'Sinds ik met pensioen ben, wandel ik elke ochtend. Volgens de app ben ik nu ergens in Zuid-Frankrijk! Het is geweldig om een doel te hebben voor mijn dagelijkse wandelingen.'),
              React.createElement('div', { className: 'flex items-center' },
                React.createElement('div', {},
                  React.createElement('h4', { 
                    className: 'font-bold text-indigo-900' 
                  }, 'Marc uit Brugge'),
                  React.createElement('div', { 
                    className: 'flex items-center text-sm text-indigo-600 mt-1 font-medium' 
                  }, '👣 1247 km afgelegd')
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action Section
    React.createElement('section', { 
      className: 'py-24 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white relative overflow-hidden'
    },
      // Achtergrond decoraties
      React.createElement('div', {
        className: 'absolute top-0 left-0 w-full h-full overflow-hidden opacity-20',
        style: {
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }
      }),
        
      // Floating globes
      React.createElement('div', {
        className: 'absolute top-1/4 left-10 w-16 h-16 rounded-full bg-white opacity-20 animate-float'
      }),
      React.createElement('div', {
        className: 'absolute bottom-1/4 right-10 w-24 h-24 rounded-full bg-white opacity-20 animate-float animation-delay-2000'
      }),
      React.createElement('div', {
        className: 'absolute top-3/4 left-1/3 w-12 h-12 rounded-full bg-white opacity-10 animate-float animation-delay-1000'
      }),
      
      // Content container
      React.createElement('div', { className: 'container mx-auto px-6 z-10 relative' },
        React.createElement('div', { className: 'text-center max-w-3xl mx-auto scroll-animate scale-up' },
          React.createElement('h2', { 
            className: 'text-4xl font-bold mb-6 tracking-tight' 
          }, 'Begin vandaag nog met wandelen'),
          React.createElement('p', { 
            className: 'text-xl mb-10 opacity-90 leading-relaxed' 
          }, 'Wandelen is niet alleen gezond, het is ook een geweldige manier om je omgeving te verkennen. Start nu en ontdek waar je kilometers je naartoe brengen!'),
          
          React.createElement('div', { className: 'flex flex-col sm:flex-row gap-4 justify-center' },
            React.createElement('button', {
              onClick: handleLoginClick,
              className: 'px-8 py-4 rounded-full bg-white text-indigo-600 text-lg font-semibold transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
            }, 'Maak gratis account'),
            React.createElement('button', {
              className: 'px-8 py-4 rounded-full border-2 border-white border-opacity-30 text-white text-lg font-semibold transition-all hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
            }, 'Bekijk voorbeelden')
          )
        )
      )
    )
  );
};

export default Homepage;
