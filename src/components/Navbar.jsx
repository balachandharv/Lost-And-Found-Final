import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useReport } from "../context/ReportContext";
import NotificationPanel from "./NotificationPanel"; // We will create this next

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
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-lg font-bold tracking-tight leading-none group-hover:text-indigo-400 transition-colors">CAMPUS</span>
              <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Lost & Found</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-12 relative">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search lost items..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {searchError && (
                <div className="absolute top-14 right-0 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-1 pointer-events-none font-bold">
                  {searchError}
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 border border-slate-700">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/item/${item.id}`);
                      setSearchTerm("");
                      setSuggestions([]);
                    }}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 border-b border-slate-700/50 last:border-none transition-colors group"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item.item}</span>
                      <span className="text-xs text-slate-400">📍 {item.location}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${item.type === "Lost"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
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
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-300 font-medium hover:text-white transition-colors hover:bg-slate-800 px-3 py-2 rounded-lg">Home</Link>
            <Link to="/items" className="text-slate-300 font-medium hover:text-white transition-colors hover:bg-slate-800 px-3 py-2 rounded-lg">Browse</Link>

            {user && user.role === "Admin" && (
              <Link to="/admin-dashboard" className="flex items-center gap-2 text-amber-400 font-semibold border border-amber-400/30 bg-amber-400/10 px-4 py-2 rounded-lg hover:bg-amber-400 hover:text-slate-900 transition-all">
                <span>🛡️</span> Admin
              </Link>
            )}

            <div className="w-px h-8 bg-slate-700"></div>

            {/* Notification Bell Placeholder - functionality in next step */}
            <div className="relative">
              <button className="text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
                <span className="text-xl">🔔</span>
                {/* <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span> */}
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 focus:outline-none group"
                >
                  <div className="text-right hidden lg:block">
                    <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user.name || "User"}</div>
                    <div className="text-xs text-slate-400">{user.role || "Member"}</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg border-2 border-slate-800 group-hover:border-indigo-500 transition-all shadow-lg">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
                    )}
                  </div>
                </button>

                {/* User Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-4 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <span>👤</span> My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                      >
                        <span>🚪</span> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="text-2xl">{showMobileMenu ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-in slide-in-from-top-4 shadow-2xl">
          <div className="p-4 space-y-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
            />

            <div className="space-y-2">
              <Link to="/" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-slate-700 hover:text-white" onClick={() => setShowMobileMenu(false)}>Home</Link>
              <Link to="/items" className="block text-slate-300 font-medium py-3 px-4 rounded-lg hover:bg-slate-700 hover:text-white" onClick={() => setShowMobileMenu(false)}>Browse Items</Link>
            </div>

            {user && user.role === "Admin" && (
              <Link to="/admin-dashboard" className="block text-amber-400 font-medium py-3 px-4 rounded-lg bg-amber-400/10 border border-amber-400/20" onClick={() => setShowMobileMenu(false)}>
                🛡️ Admin Dashboard
              </Link>
            )}

            <div className="border-t border-slate-700 pt-4">
              {user ? (
                <div>
                  <div className="flex items-center gap-4 mb-4 px-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{user.name}</div>
                      <div className="text-indigo-400 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="block text-slate-300 py-3 px-4 rounded-lg hover:bg-slate-700 hover:text-white" onClick={() => setShowMobileMenu(false)}>My Profile</Link>
                  <button
                    onClick={() => { logout(); setShowMobileMenu(false); }}
                    className="block w-full text-left text-red-400 py-3 px-4 rounded-lg hover:bg-red-500/10"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <Link to="/login" className="block w-full text-center bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg" onClick={() => setShowMobileMenu(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
