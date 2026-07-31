import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-4">
          📦 Expiry Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Never let your groceries, medicines, or products expire again.
          <br />
          Track, organize, and manage all your items in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {token ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition shadow-md"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg">➕ Add Items</h3>
            <p className="text-gray-600 text-sm">Store product name, category, and expiry date.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg">📋 View List</h3>
            <p className="text-gray-600 text-sm">See all your items sorted by expiry date.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg">🗑️ Manage</h3>
            <p className="text-gray-600 text-sm">Delete items when they are used or expired.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;