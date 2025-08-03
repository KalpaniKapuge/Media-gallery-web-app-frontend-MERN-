import ContactForm from '../components/ContactForm';
import MessageList from '../components/MessageList';

export default function ContactPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Contact</h2>
      <ContactForm />
      <h3 className="mt-6 text-xl">Your Messages</h3>
      <MessageList adminView={false} />
      {isAdmin && (
        <>
          <h3 className="mt-6 text-xl">All Messages (Admin)</h3>
          <MessageList adminView={true} />
        </>
      )}
    </div>
  );
}
