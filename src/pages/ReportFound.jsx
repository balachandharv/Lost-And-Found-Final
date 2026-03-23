import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import toast from "react-hot-toast";

function ReportFound() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addReport, reports } = useReport();
    const { user } = useAuth();
    const [isOtherItem, setIsOtherItem] = useState(false);

    // Get lost items for the dropdown
    const lostItems = reports.filter(r => r.type === "Lost" && r.status !== "Retrieved" && r.status !== "Returned");

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
    const [selectedFile, setSelectedFile] = useState(null);

    // Pre-fill form if navigated from "Found This?" button
    React.useEffect(() => {
        if (location.state?.foundItem) {
            const { foundItem } = location.state;
            setFormData(prev => ({
                ...prev,
                title: foundItem.item,
                category: foundItem.category || "",
                description: `Found item that matches: ${foundItem.item} (${foundItem.description || ''})`
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "titleSelect") {
            if (value === "other") {
                setIsOtherItem(true);
                setFormData(prev => ({ ...prev, title: "" }));
            } else {
                setIsOtherItem(false);
                setFormData(prev => ({ ...prev, title: value }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check size (5MB = 5 * 1024 * 1024)
        if (file.size > 5 * 1024 * 1024) {
            setFileError("File is too large. Maximum size is 5MB.");
            setPreviewUrl(null);
            setSelectedFile(null);
            return;
        }

        setFileError("");
        const isImg = file.type.startsWith("image/");
        setIsImage(isImg);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Build FormData for file upload
        const submitData = new FormData();
        submitData.append('item', formData.title);
        submitData.append('category', formData.category);
        submitData.append('location', formData.location || 'Unknown');
        submitData.append('type', 'Found');
        submitData.append('reportedBy', user?.name || formData.contact || 'Student');
        submitData.append('reporterEmail', user?.email || '');
        submitData.append('date', formData.date || new Date().toISOString().split('T')[0]);
        submitData.append('description', formData.description || '');
        submitData.append('contact', formData.contact || '');

        if (selectedFile) {
            submitData.append('imageFile', selectedFile);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reports', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: submitData
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Report submitted successfully! It will be listed after Admin approval.", {
                    duration: 4000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                navigate("/items");
            } else {
                toast.error(data.message || "Failed to submit report");
            }
        } catch (err) {
            console.error('Submit error:', err);
            toast.error("Failed to submit. Make sure the server is running.");
        }
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
                            <h1 className="text-2xl font-bold text-emerald-600 mb-2">Report a Found Item</h1>
                            <p className="text-slate-500">
                                Thank you for finding something! Please provide details so the owner can claim it.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label htmlFor="titleSelect" className="block text-sm font-semibold text-slate-700">Item Name (Select from Lost Items or Enter New)</label>
                                <select
                                    id="titleSelect"
                                    name="titleSelect"
                                    value={lostItems.some(item => item.item === formData.title) ? formData.title : (formData.title ? "other" : "")}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full"
                                >
                                    <option value="">-- Did you find one of these lost items? --</option>
                                    {lostItems.map(item => (
                                        <option key={item.id} value={item.item}>
                                            {item.item} (Lost at {item.location})
                                        </option>
                                    ))}
                                    <option value="other">Other / Not Listed Above</option>
                                </select>

                                {isOtherItem && (
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        placeholder="Enter item name manually"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="form-input w-full mt-2"
                                    />
                                )}
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
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="date" className="block text-sm font-semibold text-slate-700">Date Found</label>
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
                                <label htmlFor="location" className="block text-sm font-semibold text-slate-700">Location Found</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    placeholder="e.g. On a table in the cafeteria"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="description" className="block text-sm font-semibold text-slate-700">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Provide details about the item."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full resize-y"
                                ></textarea>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="contact" className="block text-sm font-semibold text-slate-700">Submission Location</label>
                                <input
                                    type="text"
                                    id="contact"
                                    name="contact"
                                    placeholder="Where is the item now? (e.g. College Reception, Security)"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Upload Image/Video (Helpful)</label>

                                <input
                                    type="file"
                                    id="fileUpload"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div
                                    onClick={() => document.getElementById('fileUpload').click()}
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${fileError ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400'
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
                                                <Upload size={24} className="text-emerald-500" />
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
                                    className={`btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 ${fileError ? 'opacity-50 cursor-not-allowed' : ''
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

export default ReportFound;
