import Image from "next/image";
import CheckoutForm from "./stripe_checkout";
import Navbar from "./components/Navbar";
export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <Navbar />
      {/* Header */}
      <header className="relative overflow-hidden bg-white dark:bg-gray-800 shadow-lg pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Project Lancelot
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate multiplayer tag game with proximity chat and dynamic obstacles
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
                Join Game
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                Create Room
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Game Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the thrill of tag like never before with our innovative features
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Team Play</h3>
            <p className="text-gray-600 dark:text-gray-300">
              1-3 Taggers vs 2-6 Runners. Strategic team gameplay with dynamic role switching.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎙️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Proximity Chat</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Chat with nearby players in real-time. Coordinate strategies or plan escapes!
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏗️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Dynamic Obstacles</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Navigate through challenging maps with strategic obstacles that change gameplay.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Join or Create a Room</h3>
                    <p className="text-gray-600 dark:text-gray-300">Set up your game lobby and invite friends to join the action.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose Your Role</h3>
                    <p className="text-gray-600 dark:text-gray-300">Become a cunning Tagger or an agile Runner in this thrilling chase game.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Play & Communicate</h3>
                    <p className="text-gray-600 dark:text-gray-300">Use proximity chat to strategize and experience dynamic gameplay with tagged players joining their taggers.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl p-8 h-80 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🎮</span>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Real-time multiplayer gaming experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Play?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Subscribe now to experience Lancelot
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <CheckoutForm />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Built with Modern Technology</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Next.js</span>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Phaser</span>            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Express.js</span>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">WebSockets</span>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Stripe</span>
          </div>
        </div>
      </section>
    </div>
  );
}
