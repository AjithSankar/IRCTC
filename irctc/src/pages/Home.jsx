import SearchForm from "../components/SearchForm";
import { useNavigate } from "react-router-dom";

export default function Home() {

  // Intialize navigate function
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-semibold tracking-wide">
          IRCTC NextGen
        </h1>
        <div className="space-x-3">
          <button onClick={handleLoginClick} className="bg-orange-500 px-4 py-1 rounded text-sm">
            LOGIN
          </button>
          <button onClick={handleRegisterClick} className="border border-white px-4 py-1 rounded text-sm">
            REGISTER
          </button>
        </div>
      </header>

      {/* Main Section */}
      <div className="flex justify-center items-start mt-16">
        <div className="bg-white w-[550px] rounded-lg shadow-xl p-6">
          
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            BOOK TICKET
          </h2>

          <SearchForm />

        </div>
      </div>
    </div>
  );
}