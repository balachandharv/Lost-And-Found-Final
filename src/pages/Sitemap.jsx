import React from "react";
import { Link } from "react-router-dom";
import { Map, Home, Search, FileText, User, Shield, HelpCircle, ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";

function Sitemap() {
    const sections = [
        {
            title: "Main Pages",
            icon: <Home size={20} />,
            color: "indigo",
            links: [
                { name: "Home", path: "/", description: "Landing page" },
                { name: "Browse Items", path: "/items", description: "View all lost & found items" },
                { name: "Report Lost Item", path: "/report-lost", description: "Report something you lost" },
                { name: "Report Found Item", path: "/report-found", description: "Report something you found" }
            ]
        },
        {
            title: "Account",
            icon: <User size={20} />,
            color: "purple",
            links: [
                { name: "Login / Sign Up", path: "/login", description: "Access your account" },
                { name: "My Profile", path: "/profile", description: "View and edit your profile" }
            ]
        },
        {
            title: "Admin",
            icon: <Shield size={20} />,
            color: "amber",
            links: [
                { name: "Admin Dashboard", path: "/admin-dashboard", description: "Admin control panel" },
                { name: "Admin Authority", path: "/admin-authority", description: "Approve pending reports" }
            ]
        },
        {
            title: "Support & Legal",
            icon: <HelpCircle size={20} />,
            color: "emerald",
            links: [
                { name: "Help Center", path: "/help", description: "FAQs and support" },
                { name: "Community Guidelines", path: "/guidelines", description: "Usage rules" },
                { name: "Privacy Policy", path: "/privacy", description: "How we handle your data" },
                { name: "Terms of Service", path: "/terms", description: "Legal terms" },
                { name: "Security", path: "/security", description: "Our security practices" },
                { name: "Accessibility", path: "/accessibility", description: "Accessibility features" }
            ]
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
            purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
            amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
            emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" }
        };
        return colors[color] || colors.indigo;
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="container-custom max-w-4xl">
                    <Link
                        to="/"
                        className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Back to Home
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                                <Map size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Sitemap</h1>
                                <p className="text-slate-500">Quick navigation to all pages</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sections.map((section, index) => {
                                const colors = getColorClasses(section.color);
                                return (
                                    <div key={index} className={`p-6 rounded-xl border ${colors.border} ${colors.bg}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg bg-white ${colors.text}`}>
                                                {section.icon}
                                            </div>
                                            <h2 className="font-bold text-slate-800">{section.title}</h2>
                                        </div>
                                        <ul className="space-y-3">
                                            {section.links.map((link, linkIndex) => (
                                                <li key={linkIndex}>
                                                    <Link
                                                        to={link.path}
                                                        className="group flex items-start gap-2"
                                                    >
                                                        <Search size={14} className="text-slate-400 mt-1 shrink-0" />
                                                        <div>
                                                            <span className="text-slate-700 font-medium group-hover:text-indigo-600 transition-colors">
                                                                {link.name}
                                                            </span>
                                                            <p className="text-xs text-slate-500">{link.description}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-10 text-center text-slate-400 text-sm">
                            <p>Last updated: January 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Sitemap;
