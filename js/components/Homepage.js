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

    // Header aanpassen bij scrollen
    const header = document.querySelector('header');
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      animateOnScroll();
    };

    // Voeg scroll event listener toe
    window.addEventListener('scroll', handleScroll);
    
    // Trigger bij eerste load
    setTimeout(animateOnScroll, 100);

    // Cleanup functie
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
  
  // Menu-items voor hoofdnavigatie
  const navItems = [
    { name: 'Home', url: '/' },
    { name: 'Hoe het werkt', url: '#features' },
    { name: 'Bestemmingen', url: '#destinations' },
    { name: 'Prijzen', url: '#pricing' },
    { name: 'Over ons', url: '#about' },
    { name: 'Contact', url: '#contact' }
  ];

  return React.createElement('div', { className: 'min-h-screen' },
    // Header/Navigatie
    React.createElement('header', { 
      className: 'fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-6 py-4'
    },
      React.createElement('div', { 
        className: 'container mx-auto flex flex-wrap justify-between items-center'
      },
        // Logo
        React.createElement('a', { 
          href: '/', 
          className: 'flex items-center'
        },
          React.createElement('span', { 
            className: 'text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600'
          }, 'WandelTracker')
        ),
        
        // Navigatie
        React.createElement('nav', { 
          className: 'hidden md:flex items-center space-x-6 text-gray-700'
        },
          navItems.map((item, index) => 
            React.createElement('a', { 
              key: index, 
              href: item.url, 
              className: 'hover:text-orange-500 transition-colors font-medium' 
            }, item.name)
          )
        ),
        
        // Mobile menu button
        React.createElement('div', { className: 'md:hidden flex items-center' },
          React.createElement('button', { 
            className: 'text-gray-700 hover:text-orange-500 focus:outline-none'
          },
            React.createElement('svg', { 
              className: 'w-6 h-6', 
              fill: 'none', 
              stroke: 'currentColor', 
              viewBox: '0 0 24 24'
            },
              React.createElement('path', { 
                strokeLinecap: 'round', 
                strokeLinejoin: 'round', 
                strokeWidth: 2, 
                d: 'M4 6h16M4 12h16m-7 6h7' 
              })
            )
          )
        )
      )
    ),

    // Hero Section met Banner
    React.createElement('section', { 
      className: 'pt-28 bg-gradient-to-b from-orange-600 via-amber-500 to-orange-50 relative overflow-hidden'
    },
      // Achtergrondeffecten
      React.createElement('div', { 
        className: 'absolute inset-0 overflow-hidden'
      },
        // Banner afbeelding
        React.createElement('div', {
          className: 'absolute inset-0 z-0 opacity-20',
          style: { 
            backgroundImage: 'url("assets/banner.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(2px)'
          }
        }),
        // Decoratieve elementen
        React.createElement('div', { 
          className: 'absolute w-64 h-64 rounded-full bg-yellow-400 top-1/4 right-0 -mr-32 opacity-20' 
        }),
        React.createElement('div', { 
          className: 'absolute w-96 h-96 rounded-full bg-orange-300 bottom-0 left-0 -ml-40 -mb-24 opacity-20' 
        })
      ),

      // Content container
      React.createElement('div', { 
        className: 'container mx-auto px-6 py-20 md:py-32 relative z-10' 
      },
        React.createElement('div', { 
          className: 'flex flex-col md:flex-row items-center' 
        },
          // Tekst content
          React.createElement('div', { 
            className: 'md:w-1/2 text-center md:text-left z-10 mb-12 md:mb-0' 
          },
            React.createElement('h1', { 
              className: 'text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight'
            }, 
              'Wandel de wereld rond,',
              React.createElement('span', { 
                className: 'block mt-2'
              }, 'vanuit je eigen buurt')
            ),
            React.createElement('p', { 
              className: 'text-xl text-white opacity-90 mb-8 max-w-lg' 
            }, 'Volg je dagelijkse wandelingen en ontdek waar je zou zijn als je in één rechte lijn doorwandelde. Van Brussel naar Rome? Van Gent naar Stockholm?'),
            
            // CTA Buttons
            React.createElement('div', { 
              className: 'flex flex-col sm:flex-row gap-4 justify-center md:justify-start' 
            },
              React.createElement('button', {
                onClick: handleLoginClick,
                className: 'px-8 py-4 rounded-full bg-white text-orange-600 font-bold text-lg shadow-lg hover:shadow-xl transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50'
              }, 
                React.createElement('span', { 
                  className: 'flex items-center justify-center' 
                },
                  'Begin je reis',
                  React.createElement('svg', { 
                    className: 'w-5 h-5 ml-2', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', { 
                      strokeLinecap: 'round', 
                      strokeLinejoin: 'round', 
                      strokeWidth: 2, 
                      d: 'M17 8l4 4m0 0l-4 4m4-4H3' 
                    })
                  )
                )
              ),
              React.createElement('button', {
                className: 'px-8 py-4 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
              }, 'Meer informatie')
            )
          ),
          
          // Hero afbeelding
          React.createElement('div', { 
            className: 'md:w-1/2 relative z-10 scroll-animate slide-up' 
          },
            React.createElement('div', { 
              className: 'relative mx-auto max-w-lg' 
            },
              React.createElement('div', { 
                className: 'absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl transform rotate-6 scale-105 opacity-30 blur-xl' 
              }),
              React.createElement('div', { 
                className: 'bg-white p-6 rounded-2xl shadow-2xl relative z-10' 
              },
                React.createElement('div', { 
                  className: 'bg-gray-100 rounded-xl overflow-hidden mb-4' 
                },
                  React.createElement('img', {
                    src: 'assets/colosseum-rome.jpeg',
                    alt: 'Colosseum, Rome',
                    className: 'w-full h-64 object-cover'
                  })
                ),
                React.createElement('h3', { 
                  className: 'text-xl font-bold text-gray-800 mb-1' 
                }, 'Rome, Italië'),
                React.createElement('div', { 
                  className: 'flex justify-between items-center' 
                },
                  React.createElement('span', { 
                    className: 'text-orange-600 font-medium' 
                  }, '1.437 km van Brussel'),
                  React.createElement('div', { 
                    className: 'bg-orange-100 text-orange-600 rounded-full px-3 py-1 text-sm font-medium' 
                  }, '324 dagen wandelen')
                )
              )
            )
          )
        ),
        
        // Scroll indicator
        React.createElement('div', { 
          className: 'absolute bottom-8 left-0 right-0 flex justify-center animate-bounce' 
        },
          React.createElement('a', { 
            href: '#features', 
            className: 'flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur text-white hover:bg-opacity-30' 
          },
            React.createElement('svg', { 
              className: 'w-6 h-6', 
              fill: 'none', 
              stroke: 'currentColor', 
              viewBox: '0 0 24 24'
            },
              React.createElement('path', { 
                strokeLinecap: 'round', 
                strokeLinejoin: 'round', 
                strokeWidth: 2, 
                d: 'M19 14l-7 7m0 0l-7-7m7 7V3' 
              })
            )
          )
        )
      )
    ),

    // Features Section
    React.createElement('section', { 
      id: 'features', 
      className: 'py-20 bg-white' 
    },
      React.createElement('div', { 
        className: 'container mx-auto px-6' 
      },
        React.createElement('div', { 
          className: 'text-center max-w-3xl mx-auto mb-16 scroll-animate fade-up' 
        },
          React.createElement('span', { 
            className: 'text-sm font-bold tracking-wider text-orange-600 uppercase' 
          }, 'Eenvoudig te gebruiken'),
          React.createElement('h2', { 
            className: 'text-4xl font-bold mt-2 mb-4 text-gray-900' 
          }, 'Hoe werkt WandelTracker?'),
          React.createElement('p', { 
            className: 'text-xl text-gray-600' 
          }, 'Drie eenvoudige stappen om je virtuele wandelreis te beginnen')
        ),
        
        React.createElement('div', { 
          className: 'grid md:grid-cols-3 gap-10' 
        },
          // Feature 1
          React.createElement('div', { 
            className: 'scroll-animate slide-up p-6 bg-orange-50 rounded-xl shadow transition-transform hover:translate-y-[-8px]'
          },
            React.createElement('div', { 
              className: 'w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center mb-6 mx-auto shadow-md text-white font-bold text-2xl'
            }, '1'),
            React.createElement('h3', { 
              className: 'text-xl font-bold text-center mb-4 text-gray-800' 
            }, 'Kies je startpunt'),
            React.createElement('p', { 
              className: 'text-center text-gray-600' 
            }, 'Maak een nieuw project aan met je thuislocatie als vertrekpunt voor je virtuele reis.')
          ),
          
          // Feature 2
          React.createElement('div', { 
            className: 'scroll-animate slide-up animation-delay-300 p-6 bg-orange-50 rounded-xl shadow transition-transform hover:translate-y-[-8px]'
          },
            React.createElement('div', { 
              className: 'w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center mb-6 mx-auto shadow-md text-white font-bold text-2xl'
            }, '2'),
            React.createElement('h3', { 
              className: 'text-xl font-bold text-center mb-4 text-gray-800' 
            }, 'Log je wandelingen'),
            React.createElement('p', { 
              className: 'text-center text-gray-600' 
            }, 'Noteer elke dag je wandelafstand. Zelfs korte wandelingen tellen mee voor je totaal.')
          ),
          
          // Feature 3
          React.createElement('div', { 
            className: 'scroll-animate slide-up animation-delay-600 p-6 bg-orange-50 rounded-xl shadow transition-transform hover:translate-y-[-8px]'
          },
            React.createElement('div', { 
              className: 'w-16 h-16 rounded-full bg-gradient-to-r from-orange-600 to-amber-700 flex items-center justify-center mb-6 mx-auto shadow-md text-white font-bold text-2xl'
            }, '3'),
            React.createElement('h3', { 
              className: 'text-xl font-bold text-center mb-4 text-gray-800' 
            }, 'Volg je voortgang'),
            React.createElement('p', { 
              className: 'text-center text-gray-600' 
            }, 'Zie op de kaart waar je kilometers je theoretisch naartoe hebben gebracht.')
          )
        )
      )
    ),

    // Destinations Section
    React.createElement('section', { 
      id: 'destinations', 
      className: 'py-20 bg-gray-50' 
    },
      React.createElement('div', { 
        className: 'container mx-auto px-6' 
      },
        React.createElement('div', { 
          className: 'text-center max-w-3xl mx-auto mb-16 scroll-animate fade-up' 
        },
          React.createElement('span', { 
            className: 'text-sm font-bold tracking-wider text-orange-600 uppercase' 
          }, 'Ontdek'),
          React.createElement('h2', { 
            className: 'text-4xl font-bold mt-2 mb-4 text-gray-900' 
          }, 'Mogelijke bestemmingen'),
          React.createElement('p', { 
            className: 'text-xl text-gray-600' 
          }, 'Ontdek waar je virtueel naartoe zou kunnen wandelen vanaf je startpunt')
        ),
        
        React.createElement('div', { 
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
        },
          landmarks.map((landmark, index) => 
            React.createElement('div', { 
              key: index, 
              className: 'scroll-animate fade-up animation-delay-300 bg-white rounded-xl overflow-hidden shadow group cursor-pointer hover:shadow-xl transition-shadow duration-300'
            },
              // Afbeeldingscontainer
              React.createElement('div', { 
                className: 'h-52 overflow-hidden relative' 
              }, 
                // Placeholder
                React.createElement('div', {
                  className: 'placeholder absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-200'
                }, landmark.name),
                
                // Afbeelding
                React.createElement('img', {
                  'data-src': `assets/${landmark.file}`,
                  alt: landmark.name,
                  className: 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-110',
                  style: { display: 'none' }
                }),
                
                // Gradient overlay
                React.createElement('div', {
                  className: 'absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60'
                })
              ),
              
              // Content
              React.createElement('div', { 
                className: 'relative p-6' 
              },
                React.createElement('div', {
                  className: 'absolute top-0 right-0 bg-orange-600 text-white py-1 px-4 rounded-bl-lg -mt-10 z-10 shadow-md'
                }, landmark.distance),
                React.createElement('h3', { 
                  className: 'text-xl font-bold mb-2 text-gray-900' 
                }, landmark.name),
                React.createElement('p', {
                  className: 'text-gray-600 mb-4'
                }, `Ontdek de schoonheid van ${landmark.name} door elke dag te wandelen en je vooruitgang bij te houden.`),
                React.createElement('div', {
                  className: 'flex justify-between items-center'
                },
                  React.createElement('span', {
                    className: 'text-orange-600 font-medium text-sm flex items-center'
                  },
                    React.createElement('svg', {
                      className: 'w-4 h-4 mr-1',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24'
                    },
                      React.createElement('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                      })
                    ),
                    'Ongeveer 20 minuten per dag'
                  ),
                  React.createElement('button', {
                    className: 'text-orange-600 hover:text-orange-800 font-medium text-sm'
                  }, 'Meer info →')
                )
              )
            )
          )
        )
      )
    ),

    // Pricing Section
    React.createElement('section', {
      id: 'pricing',
      className: 'py-20 bg-gradient-to-r from-orange-500 to-amber-600 text-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-6'
      },
        React.createElement('div', {
          className: 'text-center max-w-3xl mx-auto mb-16 scroll-animate fade-up'
        },
          React.createElement('span', {
            className: 'text-sm font-bold tracking-wider text-orange-100 uppercase'
          }, 'Abonnementen'),
          React.createElement('h2', {
            className: 'text-4xl font-bold mt-2 mb-4'
          }, 'Kies je ideale plan'),
          React.createElement('p', {
            className: 'text-xl text-orange-100'
          }, 'We bieden flexibele opties aan voor elke wandelaar')
        ),
        
        React.createElement('div', {
          className: 'grid md:grid-cols-3 gap-8'
        },
          // Free Plan
          React.createElement('div', {
            className: 'bg-white text-gray-900 rounded-xl overflow-hidden shadow-xl scroll-animate slide-up'
          },
            React.createElement('div', {
              className: 'p-8 border-b border-gray-200'
            },
              React.createElement('h3', {
                className: 'text-xl font-bold mb-4'
              }, 'Starter'),
              React.createElement('div', {
                className: 'flex items-baseline'
              },
                React.createElement('span', {
                  className: 'text-4xl font-bold'
                }, 'Gratis'),
                React.createElement('span', {
                  className: 'ml-1 text-gray-500'
                }, '/altijd')
              ),
              React.createElement('p', {
                className: 'mt-4 text-gray-600'
              }, 'Perfect om te beginnen met virtueel wandelen')
            ),
            React.createElement('div', {
              className: 'p-8'
            },
              React.createElement('ul', {
                className: 'space-y-4'
              },
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Onbeperkt wandelingen loggen'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Basisstatistieken'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  '1 virtuele route'
                ),
                React.createElement('li', {
                  className: 'flex items-center text-gray-400'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-red-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M6 18L18 6M6 6l12 12'
                    })
                  ),
                  'Geavanceerde kaarten'
                )
              ),
              React.createElement('button', {
                onClick: handleLoginClick,
                className: 'mt-8 w-full bg-orange-100 text-orange-600 font-bold py-3 px-6 rounded-lg hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50'
              }, 'Registreer gratis')
            )
          ),
          
          // Premium Plan
          React.createElement('div', {
            className: 'bg-white text-gray-900 rounded-xl overflow-hidden shadow-xl transform md:scale-105 scroll-animate slide-up animation-delay-300 relative'
          },
            // Most Popular Badge
            React.createElement('div', {
              className: 'absolute top-0 right-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-1 px-4 rounded-bl-lg font-medium text-sm shadow-md'
            }, 'Populairste'),
            
            React.createElement('div', {
              className: 'p-8 border-b border-gray-200 bg-orange-50'
            },
              React.createElement('h3', {
                className: 'text-xl font-bold mb-4'
              }, 'Premium'),
              React.createElement('div', {
                className: 'flex items-baseline'
              },
                React.createElement('span', {
                  className: 'text-4xl font-bold'
                }, '€4,99'),
                React.createElement('span', {
                  className: 'ml-1 text-gray-500'
                }, '/maand')
              ),
              React.createElement('p', {
                className: 'mt-4 text-gray-600'
              }, 'Ideaal voor enthousiaste wandelaars')
            ),
            React.createElement('div', {
              className: 'p-8'
            },
              React.createElement('ul', {
                className: 'space-y-4'
              },
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Alles uit het Starter plan'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Onbeperkte routes'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                 React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                'Geavanceerde kaarten'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Gedetailleerde statistieken'
                )
              ),
              React.createElement('button', {
                className: 'mt-8 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50'
              }, 'Begin met Premium')
            )
          ),
          
          // Pro Plan
          React.createElement('div', {
            className: 'bg-white text-gray-900 rounded-xl overflow-hidden shadow-xl scroll-animate slide-up animation-delay-600'
          },
            React.createElement('div', {
              className: 'p-8 border-b border-gray-200'
            },
              React.createElement('h3', {
                className: 'text-xl font-bold mb-4'
              }, 'Pro'),
              React.createElement('div', {
                className: 'flex items-baseline'
              },
                React.createElement('span', {
                  className: 'text-4xl font-bold'
                }, '€9,99'),
                React.createElement('span', {
                  className: 'ml-1 text-gray-500'
                }, '/maand')
              ),
              React.createElement('p', {
                className: 'mt-4 text-gray-600'
              }, 'Voor serieuze wandelaars die alles willen')
            ),
            React.createElement('div', {
              className: 'p-8'
            },
              React.createElement('ul', {
                className: 'space-y-4'
              },
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Alles uit het Premium plan'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  '3D terreinvisualisatie'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Groepswandelingen'
                ),
                React.createElement('li', {
                  className: 'flex items-center'
                },
                  React.createElement('svg', {
                    className: 'w-5 h-5 text-green-500 mr-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24'
                  },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7'
                    })
                  ),
                  'Persoonlijke coaching'
                )
              ),
              React.createElement('button', {
                className: 'mt-8 w-full bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50'
              }, 'Begin met Pro')
            )
          )
        )
      )
    ),

    // Testimonials Section
    React.createElement('section', {
      className: 'py-20 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-6'
      },
        React.createElement('div', {
          className: 'text-center max-w-3xl mx-auto mb-16 scroll-animate fade-up'
        },
          React.createElement('span', {
            className: 'text-sm font-bold tracking-wider text-orange-600 uppercase'
          }, 'Recensies'),
          React.createElement('h2', {
            className: 'text-4xl font-bold mt-2 mb-4 text-gray-900'
          }, 'Wat onze wandelaars zeggen'),
          React.createElement('p', {
            className: 'text-xl text-gray-600'
          }, 'Ontdek hoe WandelTracker anderen heeft gemotiveerd')
        ),
        
        React.createElement('div', {
          className: 'grid md:grid-cols-2 gap-8'
        },
          // Testimonial 1
          React.createElement('div', {
            className: 'bg-orange-50 p-8 rounded-xl shadow scroll-animate slide-right relative'
          },
            // Decorative elements
            React.createElement('div', {
              className: 'absolute top-6 left-6 text-5xl text-orange-200 leading-none font-serif'
            }, '"'),
            
            // Content
            React.createElement('div', {
              className: 'relative pl-8'
            },
              React.createElement('p', {
                className: 'text-gray-700 mb-6 italic leading-relaxed'
              }, 'Ik wandel elke dag tijdens mijn lunchpauze. Na 6 maanden ontdekte ik dat ik theoretisch in Stockholm zou zijn! De app motiveert me om dagelijks mijn wandelschoenen aan te trekken.'),
              
              React.createElement('div', {
                className: 'flex items-center'
              },
                React.createElement('div', {
                  className: 'w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-xl mr-4'
                }, 'S'),
                React.createElement('div', {
                  className: 'flex flex-col'
                },
                  React.createElement('h4', {
                    className: 'font-bold text-gray-900'
                  }, 'Sarah uit Gent'),
                  React.createElement('div', {
                    className: 'flex items-center'
                  },
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('span', {
                      className: 'ml-2 text-gray-600 text-sm'
                    }, '843 km afgelegd')
                  )
                )
              )
            )
          ),
          
          // Testimonial 2
          React.createElement('div', {
            className: 'bg-orange-50 p-8 rounded-xl shadow scroll-animate slide-left relative'
          },
            // Decorative elements
            React.createElement('div', {
              className: 'absolute top-6 left-6 text-5xl text-orange-200 leading-none font-serif'
            }, '"'),
            
            // Content
            React.createElement('div', {
              className: 'relative pl-8'
            },
              React.createElement('p', {
                className: 'text-gray-700 mb-6 italic leading-relaxed'
              }, 'Sinds ik met pensioen ben, wandel ik elke ochtend. Volgens WandelTracker ben ik nu ergens in Zuid-Frankrijk! Het is geweldig om een doel te hebben voor mijn dagelijkse wandelingen.'),
              
              React.createElement('div', {
                className: 'flex items-center'
              },
                React.createElement('div', {
                  className: 'w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-xl mr-4'
                }, 'M'),
                React.createElement('div', {
                  className: 'flex flex-col'
                },
                  React.createElement('h4', {
                    className: 'font-bold text-gray-900'
                  }, 'Marc uit Brugge'),
                  React.createElement('div', {
                    className: 'flex items-center'
                  },
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('svg', {
                      className: 'w-4 h-4 text-yellow-500',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20'
                    },
                      React.createElement('path', {
                        d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                      })
                    ),
                    React.createElement('span', {
                      className: 'ml-2 text-gray-600 text-sm'
                    }, '1247 km afgelegd')
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action Section
    React.createElement('section', {
      id: 'contact',
      className: 'py-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-6'
      },
        React.createElement('div', {
          className: 'max-w-3xl mx-auto text-center scroll-animate fade-up'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold mb-6'
          }, 'Klaar om je wandelreis te beginnen?'),
          React.createElement('p', {
            className: 'text-xl mb-10'
          }, 'Wandelen is niet alleen gezond, het is ook een geweldige manier om je omgeving te verkennen. Start nu en ontdek waar je kilometers je naartoe brengen!'),
          
          React.createElement('div', {
            className: 'flex flex-col md:flex-row gap-4 justify-center'
          },
            React.createElement('button', {
              onClick: handleLoginClick,
              className: 'px-8 py-4 bg-white rounded-full text-orange-600 font-bold text-lg hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
            }, 'Begin je reis'),
            React.createElement('button', {
              className: 'px-8 py-4 border-2 border-white rounded-full text-white font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
            }, 'Neem contact op')
          )
        )
      )
    ),
    
    // Footer
    React.createElement('footer', {
      className: 'bg-gray-900 text-white pt-16 pb-8'
    },
      React.createElement('div', {
        className: 'container mx-auto px-6'
      },
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-4 gap-8 mb-16'
        },
          // Column 1 - About
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('h3', {
              className: 'text-xl font-semibold mb-4'
            }, 'WandelTracker'),
            React.createElement('p', {
              className: 'text-gray-400 mb-4'
            }, 'Wij helpen wandelaars om hun dagelijkse wandelingen bij te houden en te visualiseren waar ze theoretisch naartoe zouden wandelen.'),
            React.createElement('div', {
              className: 'flex space-x-4'
            },
              React.createElement('a', {
                href: '#',
                className: 'text-gray-400 hover:text-white transition-colors'
              },
                React.createElement('svg', {
                  className: 'w-6 h-6',
                  fill: 'currentColor',
                  viewBox: '0 0 24 24'
                },
                  React.createElement('path', {
                    d: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z'
                  })
                )
              ),
              React.createElement('a', {
                href: '#',
                className: 'text-gray-400 hover:text-white transition-colors'
              },
                React.createElement('svg', {
                  className: 'w-6 h-6',
                  fill: 'currentColor',
                  viewBox: '0 0 24 24'
                },
                  React.createElement('path', {
                    d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
                  })
                )
              ),
              React.createElement('a', {
                href: '#',
                className: 'text-gray-400 hover:text-white transition-colors'
              },
                React.createElement('svg', {
                  className: 'w-6 h-6',
                  fill: 'currentColor',
                  viewBox: '0 0 24 24'

                            },
                  React.createElement('path', {
                    d: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
                  })
                )
              )
            )
          ),
          
          // Column 2 - Links
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('h3', {
              className: 'text-xl font-semibold mb-4'
            }, 'Links'),
            React.createElement('ul', {
              className: 'space-y-2'
            },
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Home')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#features',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Hoe het werkt')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#destinations',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Bestemmingen')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#pricing',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Prijzen')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#about',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Over ons')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#contact',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Contact')
              )
            )
          ),
          
          // Column 3 - Legal
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('h3', {
              className: 'text-xl font-semibold mb-4'
            }, 'Juridisch'),
            React.createElement('ul', {
              className: 'space-y-2'
            },
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Algemene voorwaarden')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Privacybeleid')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Cookiebeleid')
              ),
              React.createElement('li', {},
                React.createElement('a', {
                  href: '#',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'Disclaimer')
              )
            )
          ),
          
          // Column 4 - Contact
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('h3', {
              className: 'text-xl font-semibold mb-4'
            }, 'Contact'),
            React.createElement('ul', {
              className: 'space-y-2'
            },
              React.createElement('li', {
                className: 'flex items-start'
              },
                React.createElement('svg', {
                  className: 'w-5 h-5 text-gray-400 mr-2 mt-0.5',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24'
                },
                  React.createElement('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                  }),
                  React.createElement('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                  })
                ),
                React.createElement('span', {
                  className: 'text-gray-400'
                }, 'Korenmarkt 1, 9000 Gent, België')
              ),
              React.createElement('li', {
                className: 'flex items-center'
              },
                React.createElement('svg', {
                  className: 'w-5 h-5 text-gray-400 mr-2',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24'
                },
                  React.createElement('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  })
                ),
                React.createElement('a', {
                  href: 'mailto:info@wandeltracker.be',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, 'info@wandeltracker.be')
              ),
              React.createElement('li', {
                className: 'flex items-center'
              },
                React.createElement('svg', {
                  className: 'w-5 h-5 text-gray-400 mr-2',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24'
                },
                  React.createElement('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  })
                ),
                React.createElement('a', {
                  href: 'tel:+3293332222',
                  className: 'text-gray-400 hover:text-white transition-colors'
                }, '+32 9 333 22 22')
              )
            )
          )
        ),
        
        // Footer Bottom
        React.createElement('div', {
          className: 'pt-8 mt-8 border-t border-gray-800 text-sm text-gray-400'
        },
          React.createElement('div', {
            className: 'flex flex-col md:flex-row justify-between items-center'
          },
            React.createElement('p', {},
              '© 2025 WandelTracker. Alle rechten voorbehouden.'
            ),
            React.createElement('div', {
              className: 'mt-4 md:mt-0'
            },
              'Gemaakt met ',
              React.createElement('span', {
                className: 'text-red-500'
              }, '❤'),
              ' in België'
            )
          )
        )
      )
    )
  );
};

export default Homepage;

                                    
