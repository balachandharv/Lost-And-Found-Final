import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Server, Key, AlertTriangle, ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";

function Security() {
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
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Security</h1>
                                <p className="text-slate-500">How we protect your data and privacy</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Data Encryption */}
                            <section className="border-b border-slate-100 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-1">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Data Encryption</h2>
                                        <p className="text-slate-600 leading-relaxed">
                                            All data transmitted between your browser and our servers is encrypted using
                                            industry-standard TLS 1.3 encryption. Your passwords are never stored in plain
                                            text - we use bcrypt hashing with a high cost factor to ensure maximum security.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Authentication */}
                            <section className="border-b border-slate-100 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mt-1">
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Secure Authentication</h2>
                                        <p className="text-slate-600 leading-relaxed">
                                            We support multiple authentication methods including OTP-based login and
                                            Google OAuth 2.0. JWT tokens are used for session management with automatic
                                            expiration. Rate limiting protects against brute-force attacks.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Privacy Protection */}
                            <section className="border-b border-slate-100 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
                                        <Eye size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Privacy Protection</h2>
                                        <p className="text-slate-600 leading-relaxed">
                                            Your personal information is only visible to you and authorized administrators.
                                            Contact details on lost/found reports are shown selectively to protect your
                                            privacy while enabling item recovery.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Infrastructure */}
                            <section className="border-b border-slate-100 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mt-1">
                                        <Server size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Secure Infrastructure</h2>
                                        <p className="text-slate-600 leading-relaxed">
                                            Our servers are protected with firewalls, intrusion detection systems, and
                                            regular security audits. We implement CORS policies to prevent unauthorized
                                            cross-origin requests and use Helmet.js for HTTP security headers.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Report Vulnerability */}
                            <section>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg mt-1">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Report a Vulnerability</h2>
                                        <p className="text-slate-600 leading-relaxed mb-4">
                                            If you discover a security vulnerability, please report it responsibly.
                                            Contact our security team directly:
                                        </p>
                                        <a
                                            href="mailto:balachandhar021@gmail.com?subject=Security%20Vulnerability%20Report"
                                            className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:underline"
                                        >
                                            balachandhar021@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="mt-10 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <p className="text-emerald-700 text-sm font-medium text-center">
                                🔒 This portal is maintained by PSR Engineering College IT Department
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Security;
