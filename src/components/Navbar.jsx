import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useReport } from "../context/ReportContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, LogOut, Box, PlusCircle, Shield, Home, Grid } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();
  const { reports } = useReport();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Helper for active link styling
  const isActive = (path) => location.pathname === path;

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
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl border-slate-200/80 shadow-md' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">

          {/* 1. Mobile Menu Button (Left) */}
          <button
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 2. Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group relative z-10">
            <img src={process.env.PUBLIC_URL + "/MainLogo.png"} alt="Brand Logo" className="h-10 md:h-12 w-auto object-contain" />
            <div className="flex flex-col hidden sm:flex">
              <span className="text-slate-900 text-lg font-bold tracking-tight leading-none">LOST</span>
              <span className="text-indigo-600 text-xs font-bold tracking-widest uppercase">& FOUND</span>
            </div>
          </Link>

          {/* 3. Desktop Search Bar (Hidden on Mobile) */}
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

          {/* 4. Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-1">
              <Link to="/" className={`font-medium transition-all duration-200 px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                isActive('/') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}>
                <Home size={16} /> Home
              </Link>
              <Link to="/items" className={`font-medium transition-all duration-200 px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                isActive('/items') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}>
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

              <NotificationBell />

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
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-slate-200 overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
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

          {/* 5. Mobile Profile Actions (Right) - NEW */}
          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 text-indigo-600 border border-slate-200 flex items-center justify-center font-bold text-sm shadow-sm active:scale-95 transition-transform overflow-hidden"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name ? user.name[0].toUpperCase() : "U"}</span>
                  )}
                </button>

                {/* Mobile Dropdown (Same as Desktop but positioned for mobile) */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
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
              <Link to="/login" className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 text-indigo-600">
                <User size={20} />
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden bg-white border-t border-slate-100 shadow-xl fixed left-0 right-0 z-40 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="p-4 space-y-4"
            >
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <Link to="/" className={`flex items-center gap-3 font-medium py-2.5 px-4 rounded-lg transition-colors ${
                  isActive('/') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
                }`} onClick={() => setShowMobileMenu(false)}>
                  <Home size={18} className={isActive('/') ? 'text-indigo-500' : 'text-slate-400'} /> Home
                </Link>
                <Link to="/items" className={`flex items-center gap-3 font-medium py-2.5 px-4 rounded-lg transition-colors ${
                  isActive('/items') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
                }`} onClick={() => setShowMobileMenu(false)}>
                  <Grid size={18} className={isActive('/items') ? 'text-indigo-500' : 'text-slate-400'} /> Browse Items
                </Link>
                <Link to="/report-lost" className={`flex items-center gap-3 font-medium py-2.5 px-4 rounded-lg transition-colors ${
                  isActive('/report-lost') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
                }`} onClick={() => setShowMobileMenu(false)}>
                  <PlusCircle size={18} className={isActive('/report-lost') ? 'text-indigo-500' : 'text-slate-400'} /> Report Lost Item
                </Link>
              </div>

              {/* If user is NOT logged in, show 'Sign In' in drawer as fallback/reinforcement */}
              {!user && (
                <div className="pt-2 border-t border-slate-100">
                  <Link to="/login" className="block w-full text-center btn btn-primary py-3" onClick={() => setShowMobileMenu(false)}>
                    Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
