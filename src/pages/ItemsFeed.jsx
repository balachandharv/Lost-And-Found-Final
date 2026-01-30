import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";

function ItemsFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reports, deleteReport, markAsRetrieved } = useReport();
  const { user } = useAuth(); // To check for Admin role

  const currentFilter = searchParams.get("filter") || "all";
  const searchQuery = searchParams.get("search") || "";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleFilterChange = (newFilter) => {
    if (newFilter === "all") {
      searchParams.delete("filter");
    } else {
      searchParams.set("filter", newFilter);
    }
    setSearchParams(searchParams);
  };

  // Filter items
  // Filter items with memoization for performance
  const filteredItems = React.useMemo(() => {
    const seenIds = new Set();
    const retrievedStatuses = ["Retrieved", "Returned", "Resolved", "Brought Back"];

    return reports.filter(item => {
      // 1. Check Search
      const matchesSearch = (item.item && item.item.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Check Approval
      const isApproved = item.status !== "PendingApproval";

      // 3. Check Filter Logic
      let matchesFilter = false;

      if (currentFilter === "retrieved") {
        // Show items marked as Retrieved, Returned, or Resolved
        matchesFilter = retrievedStatuses.includes(item.status);
      } else {
        // For All, Lost, Found -> Exclude active retrieval statuses
        if (retrievedStatuses.includes(item.status)) {
          matchesFilter = false;
        } else if (currentFilter === "all") {
          matchesFilter = true;
        } else {
          matchesFilter = item.type.toLowerCase() === currentFilter.toLowerCase();
        }
      }

      // 4. Check Deduplication
      if (matchesFilter && matchesSearch && isApproved) {
        if (seenIds.has(item.id)) {
          return false;
        }
        seenIds.add(item.id);
        return true;
      }

      return false;
    });
  }, [reports, searchQuery, currentFilter]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Lost & Found Items</h1>
          <p className="text-slate-500">
            {searchQuery ? `Search results for "${searchQuery}"` : "Browse reported items or filter by category."}
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/report-lost">
            <button className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">
              Report Lost Item
            </button>
          </Link>
          <Link to="/report-found">
            <button className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all">
              Report Found Item
            </button>
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 p-2 bg-white rounded-xl shadow-sm w-fit mx-auto md:mx-0 border border-slate-100">
        <FilterButton
          active={currentFilter === "all"}
          onClick={() => handleFilterChange("all")}
          label="All Active"
        />
        <FilterButton
          active={currentFilter === "lost"}
          onClick={() => handleFilterChange("lost")}
          label="Lost Items"
          activeColor="bg-red-50 text-red-600"
        />
        <FilterButton
          active={currentFilter === "found"}
          onClick={() => handleFilterChange("found")}
          label="Found Items"
          activeColor="bg-green-50 text-green-600"
        />
        <FilterButton
          active={currentFilter === "retrieved"}
          onClick={() => handleFilterChange("retrieved")}
          label="Retrieved"
          activeColor="bg-blue-50 text-blue-600"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full"
              >
                <div className="h-48 bg-slate-50 flex items-center justify-center text-5xl text-slate-300 relative group overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.item} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <span>{item.type === "Lost" ? "🔍" : "📦"}</span>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.type === 'Lost' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-green-100 text-green-600 border border-green-200'
                    }`}>
                    {item.type}
                  </div>
                  {["Retrieved", "Returned", "Resolved", "Brought Back"].includes(item.status) && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg transform -rotate-12 border-2 border-white">
                        RETRIEVED
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1" title={item.item}>{item.item}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span>📍 {item.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 mt-auto">
                    <span>📅 {item.date}</span>
                    <span>•</span>
                    <span className="font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {["Retrieved", "Returned", "Resolved", "Brought Back"].includes(item.status) ? "Retrieved" : item.status}
                    </span>
                  </div>

                  <div className="space-y-3 mt-auto">
                    <Link to={`/item/${item.id}`} className="block">
                      <button className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors">
                        View Details
                      </button>
                    </Link>

                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this report?")) {
                            deleteReport(item.id);
                          }
                        }}
                        className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Delete Report
                      </button>
                    )}

                    {/* Retrieval Button Logic */}
                    {!["Retrieved", "Returned", "Resolved", "Brought Back"].includes(item.status) ? (
                      <>
                        {item.type === 'Lost' && (
                          <button
                            onClick={() => navigate("/report-found")}
                            className="w-full py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 shadow-sm transition-colors"
                          >
                            I Found This!
                          </button>
                        )}

                        {/* Only Show Retrieved Button for Found items to Admin or Reporter */}
                        {item.type === 'Found' && (user?.role === 'Admin' || (user && item.reporterEmail === user.email)) && (
                          <button
                            onClick={() => {
                              if (window.confirm("Confirm that this item has been returned to its owner?")) {
                                markAsRetrieved(item.id);
                              }
                            }}
                            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition-colors"
                          >
                            Mark as Retrieved
                          </button>
                        )}

                        {item.type === 'Lost' && (user && item.reporterEmail === user.email) && (
                          <button
                            onClick={() => {
                              if (window.confirm("Found it yourself?")) {
                                markAsRetrieved(item.id, "Brought Back");
                              }
                            }}
                            className="w-full py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 shadow-sm transition-colors mt-2"
                          >
                            I Got It Back
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-lg font-medium transition-colors bg-blue-50 text-blue-600 border border-blue-100 cursor-not-allowed"
                      >
                        Item Returned
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center text-slate-400"
            >
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No items found</h3>
              <p>Try adjusting your search or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const FilterButton = ({ active, onClick, label, activeColor }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${active
      ? (activeColor || "bg-slate-900 text-white shadow-md")
      : "text-slate-500 hover:bg-slate-50"
      }`}
  >
    {label}
  </button>
);

export default ItemsFeed;
