import React from "react";
import { Lock, Eye, Database, FileText } from "lucide-react";
import PageTransition from "../components/PageTransition";

function PrivacyPolicy() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="container-custom max-w-4xl mx-auto">

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4">
                                <Lock size={32} className="text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                            <p className="text-slate-500">Last Updated: January 2026</p>
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-600">
                            <p className="lead text-lg text-slate-700 mb-6">
                                Your privacy is important to us. This policy explains how the Campus Lost & Found Portal collects, uses, and protects your information.
                            </p>

                            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 flex items-center gap-2">
                                <Database size={20} /> Information We Collect
                            </h3>
                            <ul className="list-disc pl-5 space-y-2 mb-6">
                                <li><strong>Account Information:</strong> Name, Email ID (College ID), and Profile Picture.</li>
                                <li><strong>Report Details:</strong> Descriptions, locations, dates, and images of lost/found items.</li>
                                <li><strong>Usage Data:</strong> Logs of your interactions with the site for security and improvement purposes.</li>
                            </ul>

                            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 flex items-center gap-2">
                                <Eye size={20} /> How We Use Your Information
                            </h3>
                            <ul className="list-disc pl-5 space-y-2 mb-6">
                                <li>To facilitate the return of lost items to their owners.</li>
                                <li>To verify the identity of users within the college network.</li>
                                <li>To communicate with you regarding your reports or account status.</li>
                                <li>To maintain the security and integrity of the platform.</li>
                            </ul>

                            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4 flex items-center gap-2">
                                <Lock size={20} /> Data Security
                            </h3>
                            <p className="mb-6">
                                We implement trusted security measures to protect your personal information. Access to the platform is restricted to verified college email IDs only. We do not sell or share your data with third-party advertisers.
                            </p>

                            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h3>
                            <p>
                                If you have questions about this Privacy Policy, please contact the administration at <a href="mailto:privacy@psr.edu.in" className="text-indigo-600 underline">privacy@psr.edu.in</a>.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}

export default PrivacyPolicy;
