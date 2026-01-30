import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import { useReport } from "../context/ReportContext";

function Home() {
  const { reports, stats: reportStats } = useReport();

  const stats = [
    { label: "Items Lost", value: reportStats.totalLost, color: "text-red-600" },
    { label: "Items Found", value: reportStats.totalFound, color: "text-emerald-600" },
    { label: "Resolved", value: reportStats.totalReturned, color: "text-indigo-600" }
  ];

  // Sort by date descending and take top 3
  const recentItems = [...reports]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <>
      <BackgroundBubbles />
      <PageTransition>
        <div className="min-h-[90vh] flex flex-col items-center justify-center pt-2 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Hero Section */}
          <div className="text-center max-w-5xl mb-24 w-full">
            <motion.div
              initial={{ y: -40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
            >
              <h1 className="text-5xl md:text-8xl font-bold mb-6 text-slate-800 tracking-tight leading-none drop-shadow-sm">
                LOST IT? <motion.span
                  animate={{ color: ["#6366f1", "#818cf8", "#6366f1"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-indigo-500"
                >FOUND IT.</motion.span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
              className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-normal"
            >
              The official campus portal to reconnect you with your belongings.
              Fast, secure, and community-driven.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
              <Link to="/report-lost" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 text-lg font-semibold bg-white text-slate-700 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:text-indigo-500 shadow-lg transition-all transform-gpu"
                >
                  Report Lost Item
                </motion.button>
              </Link>
              <Link to="/report-found" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 text-lg font-semibold bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all transform-gpu"
                >
                  I Found Something
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Dashboard / Stats Section */}
          <div className="container px-4 mb-24 w-full">
            <motion.div
              className="bg-white grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-10 hover:bg-slate-50 transition-colors">
                  <div className={`text-6xl font-black mb-3 ${stat.color} tracking-tighter`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Recent Floating Items Section */}
          <div className="w-full max-w-7xl px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">Recent Activity</h2>
                <p className="text-slate-500">Latest items reported around campus</p>
              </div>
              <Link to="/items" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors hidden sm:block">
                View All Items →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100">
                      {item.date}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${item.type === 'Lost'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {item.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.item}</h3>
                  <div className="flex items-center text-slate-500 text-sm mb-6">
                    <span className="mr-2">📍</span> {item.location}
                  </div>

                  <Link to={`/item/${item.id}`} className="inline-flex items-center text-sm font-bold text-slate-900 border-b-2 border-slate-100 pb-1 hover:border-indigo-600 transition-all">
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/items" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                View All Items →
              </Link>
            </div>
          </div>

        </div>
      </PageTransition>
    </>
  );
}

export default Home;
