import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";

function ReportLost() {
    const navigate = useNavigate();
    const { addReport } = useReport();
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

        // Save to formData (in real app, this would be the file object, here we use the blob URL for demo persistence within session)
        // Note: Blob URLs expire on reload, but for a session demo effectively mocks "uploading".
        // To persist across reload in mock, we'd need base64. Let's try base64 for better persistence.
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const { user } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();

        const newReport = {
            id: "R" + (Math.floor(Math.random() * 9000) + 1000),
            item: formData.title,
            image: formData.image, // Add image from state
            location: formData.location || "Unknown",
            type: "Lost",
            reportedBy: user ? user.name : (formData.contact || "Student"), // Use authenticated name if available
            reporterEmail: user?.email, // Store email for permission checks
            reporterId: user ? user.id : null,
            date: formData.date || new Date().toISOString().split('T')[0],
            status: "PendingApproval", // Requires Admin Approval
            description: formData.description,
            contact: formData.contact
        };

        addReport(newReport);

        alert("Item reported successfully! It will be listed after Admin approval.");
        navigate("/items"); // Redirect to items feed or dashboard
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
                <h1 style={{ color: "var(--danger)" }}>Report a Lost Item</h1>
                <p style={{ marginBottom: "2rem" }}>
                    Please provide as many details as possible to help us find your item.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
                    {/* ... other fields ... */}
                    {/* Simplified for the tool, I must include all fields or just the part I am replacing, but this is a large form. I will target the end of the form specifically or rewrite the whole form if needed. Better to target the specific upload section and `handleSubmit` changes? */}
                    {/* Actually, I need to update state and handlers too. I will do a larger replace to be safe. */}

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="title" style={{ fontWeight: 500 }}>Item Name</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Blue Jansport Backpack"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
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
                                <option value="accessories">Accessories</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            <label htmlFor="date" style={{ fontWeight: 500 }}>Date Lost</label>
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
                        <label htmlFor="location" style={{ fontWeight: 500 }}>Location Lost (if known)</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="e.g. Near the main library entrance"
                            value={formData.location}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="description" style={{ fontWeight: 500 }}>Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            placeholder="Provide distinctive details like color, scratches, stickers, etc."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="form-input"
                        ></textarea>
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label htmlFor="contact" style={{ fontWeight: 500 }}>Contact Email/Phone</label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            placeholder="How can we reach you?"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div style={{ display: "grid", gap: "0.5rem" }}>
                        <label style={{ fontWeight: 500 }}>Upload Image/Video (Optional)</label>

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
                            className="btn-danger ios-btn"
                            style={{
                                minWidth: "150px",
                                opacity: fileError ? 0.5 : 1,
                                backgroundColor: "#ef4444",
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

export default ReportLost;
