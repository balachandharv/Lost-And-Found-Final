import React from "react";
import { Link } from "react-router-dom";
import { Accessibility as AccessibilityIcon, Eye, Keyboard, Monitor, Volume2, Type, ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";

function Accessibility() {
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
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <AccessibilityIcon size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Accessibility</h1>
                                <p className="text-slate-500">Our commitment to inclusive design</p>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none mb-8">
                            <p className="text-lg text-slate-600 leading-relaxed">
                                We are committed to making Campus Portal accessible to everyone, including
                                people with disabilities. We strive to meet WCAG 2.1 Level AA standards.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* Keyboard Navigation */}
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <Keyboard size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Keyboard Navigation</h3>
                                </div>
                                <p className="text-slate-600 text-sm">
                                    All interactive elements are accessible via keyboard. Use Tab to navigate,
                                    Enter to activate, and Escape to close modals.
                                </p>
                            </div>

                            {/* Screen Readers */}
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <Volume2 size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Screen Reader Support</h3>
                                </div>
                                <p className="text-slate-600 text-sm">
                                    We use semantic HTML and ARIA labels to ensure compatibility with
                                    screen readers like NVDA, JAWS, and VoiceOver.
                                </p>
                            </div>

                            {/* Visual Design */}
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <Eye size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Color Contrast</h3>
                                </div>
                                <p className="text-slate-600 text-sm">
                                    All text meets WCAG AA contrast ratios. We avoid using color alone
                                    to convey information.
                                </p>
                            </div>

                            {/* Responsive Design */}
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                        <Monitor size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Responsive Design</h3>
                                </div>
                                <p className="text-slate-600 text-sm">
                                    The site works on all screen sizes and supports zoom up to 200%
                                    without loss of functionality.
                                </p>
                            </div>

                            {/* Text Scaling */}
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 md:col-span-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                                        <Type size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Text & Content</h3>
                                </div>
                                <p className="text-slate-600 text-sm">
                                    Text can be resized using browser controls. We use clear, simple language
                                    and provide alt text for all meaningful images.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h3 className="font-bold text-blue-800 mb-2">Need Assistance?</h3>
                            <p className="text-blue-700 text-sm mb-4">
                                If you encounter any accessibility barriers or have suggestions for improvement,
                                please contact us:
                            </p>
                            <a
                                href="mailto:balachandhar021@gmail.com?subject=Accessibility%20Feedback"
                                className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                            >
                                balachandhar021@gmail.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default Accessibility;
