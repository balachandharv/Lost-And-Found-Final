import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

function ReportLost() {
    const navigate = useNavigate();
    const { addReport } = useReport();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        date: "",
        location: "",
        description: "",
        contact: "",
        image: null
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileError, setFileError] = useState("");
    const [isImage, setIsImage] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check size (5MB = 5 * 1024 * 1024)
        if (file.size > 5 * 1024 * 1024) {
            setFileError("File is too large. Maximum size is 5MB.");
            setPreviewUrl(null);
            setFormData(prev => ({ ...prev, image: null }));
            return;
        }

        setFileError("");
        const isImg = file.type.startsWith("image/");
        setIsImage(isImg);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newReport = {
            id: "R" + (Math.floor(Math.random() * 9000) + 1000),
            item: formData.title,
            category: formData.category, // Added category
            image: formData.image,
            location: formData.location || "Unknown",
            type: "Lost",
            reportedBy: user ? user.name : (formData.contact || "Student"),
            reporterEmail: user?.email,
            reporterId: user ? user.id : null,
            date: formData.date || new Date().toISOString().split('T')[0],
            status: "PendingApproval",
            description: formData.description,
            contact: formData.contact
        };

        addReport(newReport);

        alert("Item reported successfully! It will be listed after Admin approval.");
        navigate("/items");
    };

    return (
        <PageTransition>
            <div className="min-h-screen py-12">
                <div className="container-custom max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Back
                    </button>

                    <motion.div
                        className="card p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="mb-8 border-b border-slate-100 pb-6">
                            <h1 className="text-2xl font-bold text-red-600 mb-2">Report a Lost Item</h1>
                            <p className="text-slate-500">
                                Please provide as many details as possible to help us find your item.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label htmlFor="title" className="block text-sm font-semibold text-slate-700">Item Name</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="e.g. Blue Jansport Backpack"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label htmlFor="category" className="block text-sm font-semibold text-slate-700">Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="form-input w-full"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="books">Books/Notes</option>
                                        <option value="keys">Keys/Cards</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="date" className="block text-sm font-semibold text-slate-700">Date Lost</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="form-input w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="location" className="block text-sm font-semibold text-slate-700">Location Lost (if known)</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    placeholder="e.g. Near the main library entrance"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="description" className="block text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Provide distinctive details like color, scratches, stickers, etc."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full resize-y"
                                ></textarea>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="contact" className="block text-sm font-semibold text-slate-700">Contact Email/Phone</label>
                                <input
                                    type="text"
                                    id="contact"
                                    name="contact"
                                    placeholder="How can we reach you?"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Upload Image/Video (Optional)</label>

                                <input
                                    type="file"
                                    id="fileUpload"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div
                                    onClick={() => document.getElementById('fileUpload').click()}
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fileError ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400'
                                        }`}
                                >
                                    {previewUrl ? (
                                        <div className="relative flex justify-center items-center h-48">
                                            {isImage ? (
                                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-lg object-contain shadow-sm" />
                                            ) : (
                                                <video src={previewUrl} controls className="max-w-full max-h-full rounded-lg shadow-sm" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewUrl(null);
                                                    setFormData(prev => ({ ...prev, image: null }));
                                                }}
                                                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                                <Upload size={24} className="text-indigo-500" />
                                            </div>
                                            <p className="font-medium text-slate-700">Click to upload Image or Video</p>
                                            <p className="text-xs text-slate-400 mt-1">Max size: 5MB</p>
                                        </div>
                                    )}
                                </div>
                                {fileError && (
                                    <div className="flex items-center text-red-600 text-sm mt-1">
                                        <AlertCircle size={16} className="mr-1.5" /> {fileError}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!!fileError}
                                    className={`btn btn-primary bg-red-600 hover:bg-red-700 text-white shadow-red-200 ${fileError ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    Submit Report
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
}

export default ReportLost;
