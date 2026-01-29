import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useReport } from "../context/ReportContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { reports } = useReport();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) setSearchError("");

    if (value.trim().length > 0) {
      const matches = reports.filter(item => {
        // Exclude retrieved items
        const isRetrieved = ["Retrieved", "Returned", "Resolved", "Brought Back"].includes(item.status);
        if (isRetrieved) return false;

        return (
          (item.item && item.item.toLowerCase().includes(value.toLowerCase())) ||
          (item.location && item.location.toLowerCase().includes(value.toLowerCase())) ||
          (item.type && item.type.toLowerCase().includes(value.toLowerCase()))
        );
      }).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }

    if (location.pathname === "/items") {
      navigate(`/items?search=${encodeURIComponent(value)}`, { replace: true });
    }
  };

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) {
      setSearchError("Please enter a keyword");
      return;
    }
    navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
    setShowMobileMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold hover:opacity-90 transition-opacity">
            <span className="text-2xl">🔍</span>
            <span>College Lost & Found</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8 relative">
            <div className="relative flex items-center">
              <span className="absolute left-3 opacity-50 pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Search for lost items..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`w-full pl-10 pr-12 py-2 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-300 shadow-sm text-slate-900 ${searchError ? "ring-2 ring-red-400 bg-red-50 placeholder-red-300" : ""}`}
              />
              {searchError && (
                <div className="absolute top-11 right-4 bg-red-100 text-red-600 text-xs px-2 py-1 rounded shadow-md border border-red-200 animate-in fade-in slide-in-from-top-1 pointer-events-none">
                  {searchError}
                </div>
              )}
              <button
                onClick={handleSearchSubmit}
                className="absolute right-1 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-transform hover:scale-105"
                title="Search"
              >
                ➜
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-slate-100">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/item/${item.id}`);
                      setSearchTerm("");
                      setSuggestions([]);
                    }}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{item.item}</span>
                      <span className="text-xs text-slate-500">📍 {item.location}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${item.type === "Lost"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-green-50 text-green-600 border border-green-100"
                        }`}
                    >
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white font-medium hover:text-blue-100 transition-colors">Home</Link>
            <Link to="/items" className="text-white font-medium hover:text-blue-100 transition-colors">Browse Items</Link>

            {user && user.role === "Admin" && (
              <Link to="/admin-dashboard" className="flex items-center gap-1 text-red-200 font-semibold border border-red-200/30 px-3 py-1 rounded-full hover:bg-red-500/10 transition-colors">
                <span>🛡️</span> Admin
              </Link>
            )}

            <div className="w-px h-6 bg-blue-400/30"></div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center border-2 border-white/50 hover:border-white transition-all shadow-sm overflow-hidden"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold">{user.name ? user.name[0].toUpperCase() : "👤"}</span>
                  )}
                </button>
                {/* User Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-800">{user.name || "User"}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl focus:outline-none"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500 animate-in slide-in-from-top-2">
          <div className="p-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-4 pr-10 py-2 rounded-lg outline-none text-slate-900"
              />
              <button
                onClick={handleSearchSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600"
              >
                ➜
              </button>
            </div>

            <Link to="/" className="block text-white font-medium py-2 border-b border-blue-600" onClick={() => setShowMobileMenu(false)}>Home</Link>
            <Link to="/items" className="block text-white font-medium py-2 border-b border-blue-600" onClick={() => setShowMobileMenu(false)}>Browse Items</Link>

            {user && user.role === "Admin" && (
              <Link to="/admin-dashboard" className="block text-red-200 font-medium py-2 border-b border-blue-600" onClick={() => setShowMobileMenu(false)}>
                🛡️ Admin Dashboard
              </Link>
            )}

            {user ? (
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{user.name}</div>
                    <div className="text-blue-200 text-xs">{user.email}</div>
                  </div>
                </div>
                <Link to="/profile" className="block text-blue-200 py-2 hover:text-white" onClick={() => setShowMobileMenu(false)}>My Profile</Link>
                <button
                  onClick={() => { logout(); setShowMobileMenu(false); }}
                  className="block w-full text-left text-red-300 py-2 hover:text-red-100"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="block w-full text-center bg-white text-blue-600 py-2 rounded-lg font-bold" onClick={() => setShowMobileMenu(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
