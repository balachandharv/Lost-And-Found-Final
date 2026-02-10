import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Search, PlusCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useReport } from "../context/ReportContext";

function Home() {
  const { reports, stats: reportStats } = useReport();

  const stats = [
    { label: "Items Lost", value: reportStats.totalLost, color: "text-red-600" },
    { label: "Items Found", value: reportStats.totalFound, color: "text-emerald-600" },
    { label: "Resolved Cases", value: reportStats.totalReturned, color: "text-indigo-600" }
  ];

  // Sort by date descending and take top 6
  const recentItems = [...reports]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="container-custom relative z-10 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
                Campus <span className="text-indigo-600">Lost & Found</span> Portal
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                The official centralized platform for reporting and recovering lost items across campus. Secure, fast, and community-driven.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/report-lost" className="btn btn-secondary px-8 py-3 text-base">
                  <Search size={20} /> Report Lost Item
                </Link>
                <Link to="/report-found" className="btn btn-primary px-8 py-3 text-base shadow-indigo-200">
                  <PlusCircle size={20} /> I Found Something
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Subtle Background pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0"
            style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="border-y border-slate-100 bg-slate-50/50">
          <div className="container-custom py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {stats.map((stat, i) => (
                <div key={i} className="text-center px-4">
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <section className="section bg-slate-50">
          <div className="container-custom">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Recent Activity</h2>
                <p className="text-slate-500">Latest items reported around campus</p>
              </div>
              <Link to="/items" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors hidden sm:flex items-center gap-1 group">
                View All Items <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="card p-5 group hover:scale-[1.01] transition-transform duration-200 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                      {item.date}
                    </span>
                    <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'
                      }`}>
                      {item.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors capitalize">
                    {item.item}
                  </h3>

                  <div className="flex items-center text-slate-500 text-sm mb-6 mt-auto">
                    <MapPin size={16} className="mr-1.5 shrink-0" />
                    <span className="truncate capitalize">{item.location}</span>
                  </div>

                  <Link to={`/item/${item.id}`} className="block w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link to="/items" className="btn btn-secondary w-full">
                View All Activity
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}

export default Home;
