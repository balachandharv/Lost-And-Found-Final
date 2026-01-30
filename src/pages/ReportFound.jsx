import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";

function ReportFound() {
    const navigate = useNavigate();
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

    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileError, setFileError] = useState("");
    const [isImage, setIsImage] = useState(true);

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

        // Save to formData (mock persistence via base64)
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
            image: formData.image, // Add image from state
            location: formData.location || "Unknown",
            type: "Found",
            reportedBy: user?.name || formData.contact || "Student",
            reporterEmail: user?.email, // Store email for permission checks
            date: formData.date || new Date().toISOString().split('T')[0],
            status: "Available" // Found items default to Available/Verified
        };

        addReport(newReport);

        alert("Report submitted successfully! Thank you for your honesty.");
        navigate("/items"); // Navigate back to items feed
    };

    return (
        <div className="container" style={{ padding: "30px 1rem 2rem 1rem", maxWidth: "800px" }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginBottom: "1rem",
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    padding: 0
                }}
            >
                ← Back
            </button>
            <div className="card">
                <h1 style={{ color: "var(--success)" }}>Report a Found Item</h1>
                <p style={{ marginBottom: "2rem" }}>
                    Thank you for finding something! Please provide details so the owner can claim it.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="titleSelect" style={{ fontWeight: 500 }}>Item Name (Select from Lost Items or Enter New)</label>
                        <select
                            id="titleSelect"
                            name="titleSelect"
                            onChange={handleChange}
                            required
                            className="form-input"
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
                                className="form-input mt-2"
                            />
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            <label htmlFor="category" style={{ fontWeight: 500 }}>Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="form-input"
                            >
                                <option value="">Select a category</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing</option>
                                <option value="books">Books/Notes</option>
                                <option value="keys">Keys/Cards</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            <label htmlFor="date" style={{ fontWeight: 500 }}>Date Found</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="location" style={{ fontWeight: 500 }}>Location Found</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="e.g. On a table in the cafeteria"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="description" style={{ fontWeight: 500 }}>Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            placeholder="Provide details about the item."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="form-input"
                        ></textarea>
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="contact" style={{ fontWeight: 500 }}>Submission Location</label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            placeholder="Where is the item now? (e.g. College Reception, Security)"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label style={{ fontWeight: 500 }}>Upload Image/Video (Helpful)</label>

                        <input
                            type="file"
                            id="fileUpload"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />

                        <div
                            onClick={() => document.getElementById('fileUpload').click()}
                            style={{
                                border: `2px dashed ${fileError ? 'var(--danger)' : 'var(--border)'}`,
                                padding: "2rem",
                                textAlign: "center",
                                borderRadius: "var(--radius)",
                                backgroundColor: "#f8fafc",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {previewUrl ? (
                                <div style={{ position: "relative", width: "100%", height: "200px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    {isImage ? (
                                        <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "0.5rem", objectFit: "contain" }} />
                                    ) : (
                                        <video src={previewUrl} controls style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "0.5rem" }} />
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewUrl(null);
                                            setFormData(prev => ({ ...prev, image: null }));
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: "-10px",
                                            right: "-10px",
                                            background: "var(--danger)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "24px",
                                            height: "24px",
                                            cursor: "pointer",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p style={{ margin: 0, fontWeight: 500, color: "var(--primary)" }}>Click to upload Image or Video</p>
                                    <p style={{ fontSize: "0.75rem", margin: "0.5rem 0 0 0", color: "var(--text-muted)" }}>
                                        Max size: 5MB
                                    </p>
                                </>
                            )}
                        </div>
                        {fileError && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{fileError}</p>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                        <button
                            type="submit"
                            disabled={!!fileError}
                            className="ios-btn"
                            style={{
                                minWidth: "150px",
                                opacity: fileError ? 0.5 : 1,
                                backgroundColor: "#22c55e",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                fontWeight: "600",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportFound;
