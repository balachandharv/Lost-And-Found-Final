import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useReport } from "../context/ReportContext";
import { Search, Menu, X, Bell, User, LogOut, Box, PlusCircle, Shield, Home, Grid } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const { reports } = useReport();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      const matches = reports.filter(item => {
        const isRetrieved = ["Retrieved", "Returned", "Resolved", "Brought Back"].includes(item.status);
        if (isRetrieved) return false;
        return (
          (item.item && item.item.toLowerCase().includes(value.toLowerCase())) ||
          (item.location && item.location.toLowerCase().includes(value.toLowerCase()))
        );
      }).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    navigate(`/items?search=${encodeURIComponent(searchTerm)}`);
    setShowMobileMenu(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Box size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 text-lg font-bold tracking-tight leading-none">CAMPUS</span>
              <span className="text-indigo-600 text-xs font-bold tracking-widest uppercase">PORTAL</span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8 relative">
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search lost items..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            {/* Search Suggestions */}
            {suggestions.length > 0 && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/item/${item.id}`);
                      setSearchTerm("");
                      setSuggestions([]);
                    }}
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-none"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 text-sm">{item.item}</span>
                      <span className="text-xs text-slate-500">{item.location}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.type === "Lost" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <Link to="/" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors px-3 py-2 text-sm rounded-md hover:bg-indigo-50 flex items-center gap-2">
                <Home size={16} /> Home
              </Link>
              <Link to="/items" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors px-3 py-2 text-sm rounded-md hover:bg-indigo-50 flex items-center gap-2">
                <Grid size={16} /> Browse
              </Link>
            </nav>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              {user && user.role === "Admin" && (
                <Link to="/admin-dashboard" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-2 rounded-lg transition-colors" title="Admin Dashboard">
                  <Shield size={20} />
                </Link>
              )}

              <button className="text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
                <Bell size={20} />
                {/* Notification dot placeholder */}
                {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span> */}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 pl-2 py-1 pr-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all focus:ring-2 focus:ring-indigo-100"
                  >
                    <div className="text-right hidden lg:block pl-2">
                      <div className="text-xs font-bold text-slate-700 leading-tight">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{user.role}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md"
                        >
                          <User size={16} /> My Profile
                        </Link>
                        {user.role === 'Admin' && (
                          <Link
                            to="/admin-dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md"
                          >
                            <Shield size={16} /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn btn-primary px-5 py-2">
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-600 hover:text-indigo-600 p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1">
              <Link to="/" className="flex items-center gap-3 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50" onClick={() => setShowMobileMenu(false)}>
                <Home size={18} className="text-slate-400" /> Home
              </Link>
              <Link to="/items" className="flex items-center gap-3 text-slate-700 font-medium py-2.5 px-4 rounded-lg hover:bg-slate-50" onClick={() => setShowMobileMenu(false)}>
                <Grid size={18} className="text-slate-400" /> Browse Items
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 text-slate-700 py-2.5 px-4 rounded-lg hover:bg-slate-50" onClick={() => setShowMobileMenu(false)}>
                    <User size={18} /> My Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 text-red-600 py-2.5 px-4 rounded-lg hover:bg-red-50 text-left"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="block w-full text-center btn btn-primary py-3" onClick={() => setShowMobileMenu(false)}>
                  Sign In
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
