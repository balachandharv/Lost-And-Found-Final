import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import BackgroundBubbles from "../components/BackgroundBubbles";
import { useReport } from "../context/ReportContext";

function Home() {
  const { reports, stats: reportStats } = useReport();

  const stats = [
    { label: "Items Lost", value: reportStats.totalLost, color: "text-red-500" },
    { label: "Items Found", value: reportStats.totalFound, color: "text-green-500" },
    { label: "Returned", value: reportStats.totalReturned, color: "text-blue-600" }
  ];

  // Sort by date descending and take top 3
  const recentItems = [...reports]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <>
      <BackgroundBubbles />
      <PageTransition>
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">

          {/* Hero Section */}
          <div className="text-center max-w-4xl mb-16 w-full">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-500 pb-2"
            >
              College Lost & Found
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              The smartest way to recover your lost belongings within the campus.
              Report items instantly and help our community stay connected.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto px-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/report-lost" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-3d w-full sm:w-auto px-8 py-4 text-xl font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40"
                >
                  I Lost Something 😞
                </motion.button>
              </Link>
              <Link to="/report-found" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-3d w-full sm:w-auto px-8 py-4 text-xl font-bold bg-green-500 text-white rounded-full shadow-lg shadow-green-500/40"
                >
                  I Found Something 😃
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Dashboard / Stats Section */}
          <div className="container px-4 mb-20 w-full">
            <motion.div
              className="glass grid grid-cols-1 md:grid-cols-3 gap-8 p-10 rounded-3xl shadow-2xl shadow-blue-900/10"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-4">
                  <div className={`text-5xl md:text-6xl font-extrabold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Recent Floating Items Section */}
          <div className="w-full max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold text-slate-700 mb-10">Recently Reported</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className={`card cursor-pointer border-t-4 ${item.type === 'Lost' ? 'border-red-500' : 'border-green-500'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-slate-500 font-medium">📍 {item.location}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${item.type === 'Lost'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-green-50 text-green-600'
                      }`}>
                      {item.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.item}</h3>
                  <Link to={`/item/${item.id}`} className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 group">
                    View Details
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </PageTransition>
    </>
  );
}

export default Home;
