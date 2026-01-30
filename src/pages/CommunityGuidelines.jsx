import React from "react";
import { Shield, CheckCircle, AlertTriangle, UserCheck } from "lucide-react";
import PageTransition from "../components/PageTransition";

function CommunityGuidelines() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="container-custom max-w-4xl mx-auto">

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <UserCheck size={32} />
                                </div>
                                <h1 className="text-3xl font-bold">Community Guidelines</h1>
                            </div>
                            <p className="text-indigo-100 text-lg max-w-2xl">
                                To keep our campus Lost & Found portal helpful, safe, and trustworthy, we ask all users to follow these simple guidelines.
                            </p>
                        </div>

                        <div className="p-8 space-y-8">

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="text-emerald-500" size={24} /> The Do's
                                </h2>
                                <ul className="space-y-3 pl-8 list-disc text-slate-600">
                                    <li><strong>Be Honest:</strong> Only report items you have genuinely lost or found.</li>
                                    <li><strong>Provide Details:</strong> Clear descriptions and photos significantly increase the chances of successful recovery.</li>
                                    <li><strong>Update Statuses:</strong> If you find your lost item or return a found item, please update the status to "Resolved" or "Retrieved" immediately.</li>
                                    <li><strong>Be Respectful:</strong> Use professional language in descriptions and when communicating with other users.</li>
                                    <li><strong>Hand Over found items:</strong> Always hand over found items to the designated security or reception desks for safekeeping.</li>
                                </ul>
                            </section>

                            <div className="h-px bg-slate-100"></div>

                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={24} /> The Don'ts
                                </h2>
                                <ul className="space-y-3 pl-8 list-disc text-slate-600">
                                    <li><strong>No False Reports:</strong> Prank reporting or spamming the feed is strictly prohibited and will result in account suspension.</li>
                                    <li><strong>No Personal Info:</strong> Avoid sharing sensitive personal information (like passwords or home addresses) in public descriptions.</li>
                                    <li><strong>No Inappropriate Content:</strong> Do not upload offensive images or use profanity.</li>
                                    <li><strong>Do Not Keep Found Items:</strong> Keeping an item you found without reporting it or handing it over is against college policy.</li>
                                </ul>
                            </section>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-8">
                                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Shield size={20} className="text-indigo-600" /> Enforcement
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    The Admin team regularly reviews reports. Violations of these guidelines may result in the removal of your posts or the temporary/permanent suspension of your account access. If you spot a violation, please report it to the admin immediately.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default CommunityGuidelines;
