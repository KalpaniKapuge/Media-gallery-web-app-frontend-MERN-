import ContactForm from '../components/ContactForm.jsx';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const navigate = useNavigate();

  const handleMessageSent = (newMessage) => {
    window.dispatchEvent(new Event('messageSent'));
    navigate('/contact/my-messages', { state: { newMessage } });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative overflow-hidden p-8">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-7 text-teal-800">
        <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-md">Contact Us</h1>

        <section aria-labelledby="contact-form-heading" className="mb-12">
          <h2 id="contact-form-heading" className="sr-only">Contact Form</h2>
          <ContactForm onMessageSent={handleMessageSent} />
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse {
          animation: pulse 7s infinite ease-in-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </main>
  );
}
