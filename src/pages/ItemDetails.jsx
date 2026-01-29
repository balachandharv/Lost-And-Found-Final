import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";

function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { reports, markAsRetrieved } = useReport();
    const { user } = useAuth();
    const [item, setItem] = useState(null);

    useEffect(() => {
        if (reports.length > 0) {
            const found = reports.find(i => i.id === id);
            setItem(found || null);
        }
    }, [id, reports]);

    if (!item) return <div className="container" style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>;

    const retrievedStatuses = ["Retrieved", "Returned", "Resolved", "Brought Back"];
    const isRetrieved = retrievedStatuses.includes(item.status);

    return (
        <div className="container" style={{ padding: "80px 1rem 2rem 1rem", minHeight: "100vh" }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginBottom: "1rem",
                    color: "var(--primary)",
                    background: "none",
                    border: "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600
                }}
            >
                ← Back
            </button>

            <div className="card" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: "500px" }}>

                {/* Image Section */}
                <div style={{ backgroundColor: "#f8fafc", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.item || item.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block"
                            }}
                        />
                    ) : (
                        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{item.type === "Lost" ? "🔍" : "📦"}</div>
                            <h2 style={{ color: "#334155", fontSize: "2rem" }}>{item.item || item.title}</h2>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div style={{ padding: "3rem", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        <h1 style={{ marginBottom: 0, fontSize: "2rem", lineHeight: 1.2 }}>{item.item || item.title}</h1>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                            <span className={`badge ${item.type === 'Lost' ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
                                {item.type}
                            </span>
                            {isRetrieved && (
                                <span style={{
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "9999px",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    border: "1px solid #bfdbfe"
                                }}>
                                    {item.status}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: "2rem" }}>

                        <div>
                            <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "0.75rem", fontWeight: 700 }}>Description</h3>
                            <p style={{ color: "#334155", fontSize: "1.05rem", lineHeight: 1.6 }}>{item.description || "No description provided."}</p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "0.5rem", fontWeight: 700 }}>Location</h3>
                                <p style={{ margin: 0, fontWeight: 500, fontSize: "1.05rem" }}>{item.location}</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "0.5rem", fontWeight: 700 }}>Date</h3>
                                <p style={{ margin: 0, fontWeight: 500, fontSize: "1.05rem" }}>{item.date}</p>
                            </div>
                        </div>

                        <div style={{ padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
                            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontWeight: 700, color: "#1e293b" }}>Contact Information</h3>
                            {item.type === 'Lost' ? (
                                <>
                                    <p style={{ margin: 0, color: "#64748b" }}>If you found this item, please contact:</p>
                                    <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--primary)", margin: "0.5rem 0" }}>{item.reportedBy}</p>
                                    {item.contact && (item.contact.includes("@") || item.contact.match(/^[0-9]+$/)) ? (
                                        <a href={item.contact.includes("@") ? `mailto:${item.contact}` : `tel:${item.contact}`} style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 500 }}>
                                            {item.contact}
                                        </a>
                                    ) : <p>{item.contact}</p>}
                                </>
                            ) : (
                                <>
                                    <p style={{ margin: 0, color: "#64748b" }}>This item is currently located at:</p>
                                    <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--success)", margin: "0.5rem 0" }}>{item.status === 'Available' || item.status === 'Verified' ? (item.reportedBy) : item.status}</p>
                                    <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}>
                                        {isRetrieved ? "Item has been successfully returned to owner." : "Please visit the location with proof of ownership to claim."}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
                        {isRetrieved ? (
                            <button
                                disabled
                                style={{
                                    width: "100%",
                                    backgroundColor: "#dbeafe",
                                    color: "#1e40af",
                                    padding: "1rem",
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    borderRadius: "0.5rem",
                                    border: "1px solid #93c5fd",
                                    cursor: "not-allowed"
                                }}
                            >
                                {item.status === "Brought Back" ? "Item Brought Back" : "Item Retrieved"}
                            </button>
                        ) : (
                            <>
                                {item.type === 'Lost' && (
                                    <button
                                        onClick={() => navigate("/report-found")}
                                        style={{ width: "100%", backgroundColor: "var(--success)", padding: "1rem", fontSize: "1rem", borderRadius: "0.5rem", fontWeight: "bold" }}
                                    >
                                        I Found This!
                                    </button>
                                )}
                                {item.type === 'Lost' && (user && (item.reporterEmail === user.email || item.reportedBy === user.name)) && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Found it yourself?")) {
                                                markAsRetrieved(item.id, "Brought Back");
                                            }
                                        }}
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#334155",
                                            color: "white",
                                            padding: "1rem",
                                            fontSize: "1rem",
                                            borderRadius: "0.5rem",
                                            fontWeight: "bold",
                                            marginTop: "1rem"
                                        }}
                                    >
                                        I Got It Back
                                    </button>
                                )}
                                {/* Allow marking as retrieved from details if authorized */}
                                {(item.type === 'Found' && (user?.role === 'Admin' || (user && item.reporterEmail === user.email))) && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Confirm item return?")) markAsRetrieved(item.id);
                                        }}
                                        style={{
                                            width: "100%",
                                            backgroundColor: "var(--primary)",
                                            padding: "1rem",
                                            fontSize: "1rem",
                                            borderRadius: "0.5rem",
                                            fontWeight: "bold",
                                            marginTop: item.type === 'Lost' ? '1rem' : 0
                                        }}
                                    >
                                        Mark as Retrieved
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemDetails;
