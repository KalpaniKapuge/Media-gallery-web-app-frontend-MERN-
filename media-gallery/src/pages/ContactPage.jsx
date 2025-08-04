// ContactPage.jsx
import ContactForm from '../components/ContactForm.jsx';
import MessageList from '../components/MessageList.jsx';

export default function ContactPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-700 relative overflow-hidden p-8 text-white">
      {/* Animated Background Circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400 rounded-full opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-teal-400 rounded-full opacity-15 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-48 h-48 bg-cyan-300 rounded-full opacity-25 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-teal-900 backdrop-blur-sm bg-opacity-30">
        <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-md">
          Contact Us
        </h1>

        <section aria-labelledby="contact-form-heading" className="mb-12">
          <h2 id="contact-form-heading" className="sr-only">Contact Form</h2>
          <ContactForm />
        </section>

        <section aria-labelledby="your-messages-heading" className="mb-12">
          <h2 id="your-messages-heading" className="text-2xl font-semibold mb-4">
            Your Messages
          </h2>
          <MessageList adminView={false} />
        </section>

        {isAdmin && (
          <section aria-labelledby="admin-messages-heading">
            <h2 id="admin-messages-heading" className="text-2xl font-semibold mb-4">
              All Messages (Admin)
            </h2>
            <MessageList adminView={true} />
          </section>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
