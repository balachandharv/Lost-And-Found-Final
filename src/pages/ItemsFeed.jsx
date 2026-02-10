import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import { Search, Package, MapPin, Calendar, HelpCircle, Filter, X } from "lucide-react";

function ItemsFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reports } = useReport();
  const { user } = useAuth();

  const currentFilter = searchParams.get("filter") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter === "all") searchParams.delete("filter");
    else searchParams.set("filter", newFilter);
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory === "all") searchParams.delete("category");
    else searchParams.set("category", newCategory);
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const filteredItems = React.useMemo(() => {
    if (!reports) return []; // Safeguard against undefined reports

    const seenIds = new Set();
    const retrievedStatuses = ["Retrieved", "Returned", "Resolved", "Brought Back"];

    return reports.filter(item => {
      // 0. Basic Integrity Check
      if (!item || !item.id) return false;

      // 1. Search Query
      const matchesSearch = (item.item && item.item.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Approval Status (Only show approved or active items)
      const isApproved = item.status !== "PendingApproval";

      // 3. Type/Status Filter
      let matchesType = false;
      if (currentFilter === "retrieved") {
        matchesType = retrievedStatuses.includes(item.status);
      } else {
        if (retrievedStatuses.includes(item.status)) matchesType = false; // Hide retrieved items from main feeds
        else if (currentFilter === "all") matchesType = true;
        else matchesType = item.type && item.type.toLowerCase() === currentFilter.toLowerCase();
      }

      // 4. Category Filter
      let matchesCategory = false;
      if (currentCategory === "all") matchesCategory = true;
      else matchesCategory = item.category && item.category.toLowerCase() === currentCategory.toLowerCase();

      if (matchesType && matchesCategory && matchesSearch && isApproved) {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      }
      return false;
    });
  }, [reports, searchQuery, currentFilter, currentCategory]);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "electronics", label: "Electronics" },
    { id: "clothing", label: "Clothing" },
    { id: "books", label: "Books" },
    { id: "keys", label: "Keys/Cards" },
    { id: "accessories", label: "Accessories" },
    { id: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Items</h1>
            <p className="text-slate-500">
              {searchQuery ? `Search results for "${searchQuery}"` : "View all reported lost and found items."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/report-lost" className="btn btn-secondary">
              Report Lost
            </Link>
            <Link to="/report-found" className="btn btn-primary">
              Report Found
            </Link>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(currentFilter !== "all" || currentCategory !== "all" || searchQuery) && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Active Filters:</span>
            <div className="flex flex-wrap gap-2">
              {currentFilter !== "all" && (
                <span className="badge badge-primary flex items-center gap-1 bg-indigo-100 text-indigo-700 border-indigo-200">
                  {currentFilter === "lost" ? "Lost Items" : currentFilter === "found" ? "Found Items" : "Retrieved"}
                  <X size={14} className="cursor-pointer" onClick={() => handleFilterChange("all")} />
                </span>
              )}
              {currentCategory !== "all" && (
                <span className="badge badge-primary flex items-center gap-1 bg-purple-100 text-purple-700 border-purple-200">
                  {categories.find(c => c.id === currentCategory)?.label || currentCategory}
                  <X size={14} className="cursor-pointer" onClick={() => handleCategoryChange("all")} />
                </span>
              )}
              {searchQuery && (
                <span className="badge badge-primary flex items-center gap-1 bg-amber-100 text-amber-700 border-amber-200">
                  Search: "{searchQuery}"
                  <X size={14} className="cursor-pointer" onClick={() => {
                    searchParams.delete("search");
                    setSearchParams(searchParams);
                  }} />
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-red-500 underline ml-2">Clear All</button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-10">
          <div className="flex flex-col gap-6">

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2 items-center border-b border-slate-100 pb-4">
              <span className="text-slate-400 mr-2 flex items-center gap-1 text-sm font-medium uppercase tracking-wider text-xs"><Filter size={14} /> Type</span>
              <FilterButton
                active={currentFilter === "all"}
                onClick={() => handleFilterChange("all")}
                label="All"
              />
              <FilterButton
                active={currentFilter === "lost"}
                onClick={() => handleFilterChange("lost")}
                label="Lost Items"
                activeClass="bg-red-100 text-red-700 border-red-200"
              />
              <FilterButton
                active={currentFilter === "found"}
                onClick={() => handleFilterChange("found")}
                label="Found Items"
                activeClass="bg-emerald-100 text-emerald-700 border-emerald-200"
              />
              <FilterButton
                active={currentFilter === "retrieved"}
                onClick={() => handleFilterChange("retrieved")}
                label="Retrieved History"
                activeClass="bg-indigo-100 text-indigo-700 border-indigo-200"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-slate-400 mr-2 flex items-center gap-1 text-sm font-medium uppercase tracking-wider text-xs"><Package size={14} /> Category</span>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${currentCategory === cat.id
                    ? "bg-slate-800 text-white border-slate-800 shadow-md transform -translate-y-0.5"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="card group hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
                >
                  {/* Image Area */}
                  <div className="h-48 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.item} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="text-slate-300">
                        {item.type === "Lost" ? <Search size={48} strokeWidth={1.5} /> : <Package size={48} strokeWidth={1.5} />}
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'} shadow-sm`}>
                        {item.type}
                      </span>
                    </div>

                    {["Retrieved", "Returned", "Resolved", "Brought Back"].includes(item.status) && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-slate-900/90 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-white/20">
                          Retrieved
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={item.item}>
                        {item.item}
                      </h3>
                    </div>
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">{item.category}</span>
                    )}

                    <div className="flex items-center text-slate-500 text-sm mb-4">
                      <MapPin size={14} className="mr-1.5 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} /> {item.date}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.type === 'Lost' && (
                          <Link
                            to="/report-found"
                            state={{ foundItem: item }}
                            className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
                          >
                            Found This?
                          </Link>
                        )}
                        <Link
                          to={`/item/${item.id}`}
                          className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <HelpCircle size={48} strokeWidth={1} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No items found</h3>
                <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="btn btn-secondary mt-4">Clear Filters</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div >
    </div >
  );
}

const FilterButton = ({ active, onClick, label, activeClass }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${active
      ? (activeClass || "bg-slate-800 text-white border-slate-800 shadow-md transform -translate-y-0.5")
      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
  >
    {label}
  </button>
);

export default ItemsFeed;
