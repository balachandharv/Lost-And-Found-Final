import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, MessageCircle, Mail } from "lucide-react";
import PageTransition from "../components/PageTransition";

function HelpCenter() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "How do I report a lost item?",
            answer: "Navigate to the 'Report Lost' page from the home screen or menu. Fill in the details including item name, category, date lost, and location. Uploading a photo helps others identify your item faster. Once submitted, your report will be reviewed by an admin."
        },
        {
            question: "I found an item, what should I do?",
            answer: "Thank you for being honest! Go to the 'Report Found' page. If the item matches a 'Lost' report, you can select it directly. Otherwise, enter the details and submit. Please hand over the item to the College Security or Reception desk mentioned in your report."
        },
        {
            question: "How do I know if my lost item has been found?",
            answer: "You can check the status of your report in your 'Profile' section. Additionally, if someone reports a found item that matches yours, you may receive a notification. Checking the 'Browse Items' feed regularly is also recommended."
        },
        {
            question: "Can I edit or delete my report?",
            answer: "Yes, you can manage your reports from your Profile page. You can mark items as 'Retrieved' or delete reports if they were made in mistake. However, usually, we recommend marking them as resolved rather than deleting them for record-keeping."
        },
        {
            question: "Is there a reward for finding items?",
            answer: "The college does not officially offer rewards. The platform relies on the community spirit and honesty of students and staff. However, the owner of a lost item is free to offer a personal token of appreciation if they wish."
        }
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="container-custom max-w-4xl mx-auto">

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">How can we help you?</h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Search for answers or browse frequently asked questions below.</p>

                        <div className="mt-8 relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search help articles..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div className="card p-6 text-center hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Community Support</h3>
                            <p className="text-sm text-slate-500 mb-4">Connect with other students for quick tips.</p>
                            <Link to="/guidelines" className="text-indigo-600 text-sm font-medium hover:underline">Read Guidelines</Link>
                        </div>

                        <div className="card p-6 text-center hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Contact Admin</h3>
                            <p className="text-sm text-slate-500 mb-4">Direct assistance for account issues.</p>
                            <a href="mailto:support@psr.edu.in" className="text-indigo-600 text-sm font-medium hover:underline">Email Us</a>
                        </div>

                        <div className="card p-6 text-center hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Feedback</h3>
                            <p className="text-sm text-slate-500 mb-4">Help us improve the platform.</p>
                            <button className="text-indigo-600 text-sm font-medium hover:underline">Send Feedback</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-slate-100 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="font-semibold text-slate-800">{faq.question}</span>
                                        {openIndex === index ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                    </button>
                                    {openIndex === index && (
                                        <div className="p-4 bg-white text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}

export default HelpCenter;
