import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 to-teal-700 flex flex-col items-center justify-center px-6 py-12 text-white overflow-hidden relative">
      
      {/* Animated floating circles background */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-300 rounded-full opacity-30 animate-floatSlow" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-400 rounded-full opacity-20 animate-float" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-200 rounded-full opacity-15 animate-floatSlow delay-2000" />

      {/* Hero section */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col md:flex-row items-center gap-10">
        {/* Left side - text */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-5xl font-extrabold drop-shadow-lg transform transition-transform duration-700 hover:scale-105">
            Your <span className="text-cyan-300">Media Gallery</span>, <br />
            Simplified & Secured
          </h1>
          <p className="text-lg text-teal-100 max-w-md mx-auto md:mx-0">
            Upload, organize, and download your favorite photos and videos easily and securely from anywhere.
          </p>

          <div className="mt-8 flex justify-center md:justify-start gap-6">
            <button
              onClick={() => navigate('/register')}
              className="bg-cyan-300 text-teal-900 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-cyan-400 transition transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border border-cyan-300 text-cyan-300 px-8 py-3 rounded-lg hover:bg-cyan-300 hover:text-teal-900 transition transform hover:scale-105"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right side - image */}
        <div className="flex-1 max-w-md relative group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
            alt="Media gallery preview"
            className="rounded-xl shadow-xl object-cover w-full h-64 md:h-80 transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay with fade-in on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-teal-900 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
        </div>
      </div>

      {/* Footer note */}
      <footer className="relative z-10 mt-16 text-teal-200 text-sm text-center max-w-lg select-none opacity-80">
        &copy; {new Date().getFullYear()} Media Gallery. Secure your memories with us.
      </footer>

      {/* Custom animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-20px) }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-floatSlow {
          animation: floatSlow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
