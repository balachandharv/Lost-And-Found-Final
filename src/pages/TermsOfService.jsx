import React from "react";
import { FileText, ShieldCheck, Scale, AlertCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";

function TermsOfService() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="container-custom max-w-4xl mx-auto">

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                        <div className="text-center mb-10">
                            <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4">
                                <FileText size={32} className="text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
                            <p className="text-slate-500">Last Updated: January 2026</p>
                        </div>

                        <div className="space-y-8 text-slate-600">
                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using the Campus Lost & Found Portal, you agree to comply with and be bound by these Terms of Service. If you do not agree, strictly do not use this platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">2. User Conduct</h2>
                                <p className="mb-2">You agree to use the platform only for lawful purposes related to lost and found items. Specifically, you agree <strong>NOT</strong> to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Post false, misleading, or fraudulent reports.</li>
                                    <li>Harass, threaten, or abuse other users.</li>
                                    <li>Upload malicious software or content.</li>
                                    <li>Attempt to gain unauthorized access to the system.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">3. Account Responsibility</h2>
                                <p>
                                    You are responsible for maintaining the confidentiality of your login credentials. All activities that occur under your account are your responsibility. Notify the admin immediately of any unauthorized use.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Content Ownership</h2>
                                <p>
                                    By posting content (images, descriptions), you grant the college a non-exclusive license to use, display, and distribute said content for the purpose of operating the service. You retain ownership of your original content.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Disclaimer</h2>
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3 text-amber-800 text-sm">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <p>
                                        The platform is provided "as is". The college administration makes no warranties regarding the recovery of any lost items. We are not liable for any items that are not found or for any disputes between users.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Termination</h2>
                                <p>
                                    We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the institution.
                                </p>
                            </section>
                        </div>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}

export default TermsOfService;
