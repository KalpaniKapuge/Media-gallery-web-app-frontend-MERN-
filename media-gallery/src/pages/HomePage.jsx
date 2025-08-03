import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="p-8 max-w-xl mx-auto text-center space-y-6">
      <h1 className="text-4xl font-bold text-indigo-700">Welcome to Media Gallery</h1>
      <p className="text-lg text-gray-700">
        Upload, manage, and download your media easily.
      </p>
      <div className="space-x-4">
        <Link
          to="/register"
          className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded hover:bg-indigo-100"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
