import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Shield, ExternalLink } from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shadow-lg group-hover:bg-indigo-500 transition-colors">
                                🔍
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                                CAMPUS
                                <span className="text-indigo-500 text-sm font-semibold ml-1">PORTAL</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The official centralized platform for reporting and recovering lost items across campus. Secure, fast, and community-driven.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <SocialLink icon={<Facebook size={18} />} href="#" />
                            <SocialLink icon={<Twitter size={18} />} href="#" />
                            <SocialLink icon={<Instagram size={18} />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/items" label="Browse Items" />
                            <FooterLink to="/report-lost" label="Report Lost Item" />
                            <FooterLink to="/report-found" label="Report Found Item" />
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Support</h3>
                        <ul className="space-y-3">
                            <FooterLink to="/help" label="Help Center" />
                            <FooterLink to="/guidelines" label="Community Guidelines" />
                            <FooterLink to="/privacy" label="Privacy Policy" />
                            <FooterLink to="/terms" label="Terms of Service" />
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-indigo-500 shrink-0 mt-1" />
                                <span className="text-sm">Student Center Building,<br />Room 101, Main Campus</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-indigo-500 shrink-0" />
                                <span className="text-sm hover:text-white transition-colors cursor-pointer">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-indigo-500 shrink-0" />
                                <span className="text-sm hover:text-white transition-colors cursor-pointer">support@campusfound.edu</span>
                            </li>
                            <li className="flex items-center gap-3 pt-2">
                                <Shield size={20} className="text-emerald-500 shrink-0" />
                                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">Official Campus Portal</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-slate-800 bg-slate-950/50">
                <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2026 Campus Lost & Found. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Security</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Accessibility</span>
                        <span className="hover:text-slate-300 cursor-pointer transition-colors">Sitemap</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Helper Components
const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="text-slate-400 hover:text-indigo-400 hover:translate-x-1 transition-all inline-flex items-center gap-1 text-sm">
            {label}
        </Link>
    </li>
);

const SocialLink = ({ icon, href }) => (
    <a
        href={href}
        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1"
    >
        {icon}
    </a>
);

export default Footer;
