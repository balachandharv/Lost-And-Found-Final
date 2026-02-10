import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Shield, Github, Linkedin } from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo_icon.png" alt="Logo" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                                CAMPUS
                                <span className="text-indigo-500 text-sm font-semibold ml-1">PORTAL</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The official centralized platform for reporting and recovering lost items across campus. Secure, fast, and community-driven.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <SocialLink icon={<Github size={18} />} href="https://github.com/balachandharv" />
                            <SocialLink icon={<Linkedin size={18} />} href="https://www.linkedin.com/in/balachandhar021" />
                            <SocialLink icon={<Instagram size={18} />} href="https://www.instagram.com/bruty_boy_bc_?igsh=bjJoM3NhaDY4YXgy" />
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
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=PSR+Engineering+College+Sivakasi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:text-white transition-colors hover:underline"
                                >
                                    PSR Engineering College,<br />Sivakasi
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-indigo-500 shrink-0" />
                                <a href="tel:+918428103075" className="text-sm hover:text-white transition-colors cursor-pointer hover:underline">
                                    +91 8428103075
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-indigo-500 shrink-0" />
                                <a
                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=balachandhar021@gmail.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:text-white transition-colors cursor-pointer hover:underline"
                                >
                                    balachandhar021@gmail.com
                                </a>
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
                        <Link to="/security" className="hover:text-slate-300 transition-colors">Security</Link>
                        <Link to="/accessibility" className="hover:text-slate-300 transition-colors">Accessibility</Link>
                        <Link to="/sitemap" className="hover:text-slate-300 transition-colors">Sitemap</Link>
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
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1"
    >
        {icon}
    </a>
);

export default Footer;
