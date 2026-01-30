import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, Search, Package, CheckCircle } from "lucide-react";

function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports, markAsRetrieved } = useReport();
    const { user } = useAuth();
    const [item, setItem] = useState(null);

    useEffect(() => {
        if (reports.length > 0) {
            const found = reports.find(i => i.id === id);
            setItem(found || null);
        }
    }, [id, reports]);

    if (!item) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-slate-500 animate-pulse">Loading details...</div>
        </div>
    );

    const retrievedStatuses = ["Retrieved", "Returned", "Resolved", "Brought Back"];
    const isRetrieved = retrievedStatuses.includes(item.status);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container-custom max-w-5xl">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Browse
                </button>

                <div className="card overflow-hidden grid md:grid-cols-2 gap-0 border border-slate-200">

                    {/* Image Section */}
                    <div className="bg-slate-100 min-h-[400px] flex items-center justify-center relative p-8">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.item || item.title}
                                className="w-full h-full object-contain max-h-[500px]"
                            />
                        ) : (
                            <div className="text-center text-slate-300">
                                <div className="mb-4 flex justify-center">
                                    {item.type === "Lost" ? <Search size={80} strokeWidth={1} /> : <Package size={80} strokeWidth={1} />}
                                </div>
                                <h2 className="text-xl font-medium text-slate-400">No Image Available</h2>
                            </div>
                        )}

                        <div className="absolute top-4 left-4">
                            <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'} text-sm px-3 py-1 shadow-sm`}>
                                {item.type}
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-8 lg:p-10 flex flex-col bg-white">
                        <div className="mb-6">
                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
                                    {item.item || item.title}
                                </h1>
                            </div>

                            {isRetrieved && (
                                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-bold border border-blue-100 mt-2">
                                    <CheckCircle size={16} /> Item {item.status}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 mb-8">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    {item.description || "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <MapPin size={14} /> Location
                                    </h3>
                                    <p className="font-medium text-slate-900">{item.location}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Calendar size={14} /> Date Reported
                                    </h3>
                                    <p className="font-medium text-slate-900">{item.date}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User size={18} /> Contact Information
                                </h3>

                                {item.type === 'Lost' ? (
                                    <>
                                        <p className="text-slate-500 text-sm mb-3">If you found this item, please contact:</p>
                                        <div className="space-y-2">
                                            <p className="font-semibold text-indigo-600 text-lg">{item.reportedBy}</p>

                                            {item.contact && (
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    {item.contact.includes("@") ? <Mail size={16} /> : <Phone size={16} />}
                                                    {item.contact.includes("@") ? (
                                                        <a href={`mailto:${item.contact}`} className="hover:text-indigo-600 hover:underline">{item.contact}</a>
                                                    ) : (
                                                        <a href={`tel:${item.contact}`} className="hover:text-indigo-600 hover:underline">{item.contact}</a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-slate-500 text-sm mb-3">This item is located at:</p>
                                        <p className="font-bold text-emerald-600 text-lg mb-2">
                                            {item.status === 'Available' || item.status === 'Verified' ? item.reportedBy : item.status}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {isRetrieved ? "Item has been successfully returned." : "Please visit with proof of ownership to claim."}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            {isRetrieved ? (
                                <button disabled className="btn w-full bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed">
                                    Case Closed
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    {item.type === 'Lost' && (
                                        <button
                                            onClick={() => navigate("/report-found")}
                                            className="btn btn-primary w-full py-3"
                                        >
                                            I Found This Item!
                                        </button>
                                    )}

                                    {item.type === 'Lost' && (user && (item.reporterEmail === user.email || item.reportedBy === user.name)) && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Found it yourself?")) {
                                                    markAsRetrieved(item.id, "Brought Back");
                                                }
                                            }}
                                            className="btn btn-secondary w-full"
                                        >
                                            I Got It Back
                                        </button>
                                    )}

                                    {(item.type === 'Found' && (user?.role === 'Admin' || (user && item.reporterEmail === user.email))) && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm("Confirm item return?")) markAsRetrieved(item.id);
                                            }}
                                            className="btn btn-primary w-full"
                                        >
                                            Mark as Retrieved
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemDetails;
