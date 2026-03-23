import React, { createContext, useContext, useState, useEffect } from "react";
import { mockReports } from "../data/mockData";

const ReportContext = createContext();

export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
    // Initialize from localStorage or mock data
    const [reports, setReports] = useState(() => {
        const storedReports = localStorage.getItem("reports");
        return storedReports ? JSON.parse(storedReports) : mockReports;
    });

    const [stats, setStats] = useState({
        totalLost: 0,
        totalFound: 0,
        totalReturned: 0
    });

    // Calculate stats whenever reports change and persist to localStorage
    useEffect(() => {
        localStorage.setItem("reports", JSON.stringify(reports));

        const simpleStats = {
            totalLost: reports.filter(r => r.type === "Lost").length,
            totalFound: reports.filter(r => r.type === "Found").length,
            totalReturned: reports.filter(r => ["Retrieved", "Returned", "Resolved", "Brought Back"].includes(r.status)).length
        };

        setStats(simpleStats);
    }, [reports]);

    const deleteReport = (id) => {
        setReports(prev => prev.filter(report => report.id !== id));
        // Also delete from backend
        fetch(`http://localhost:5000/api/reports/${id}`, {
            method: 'DELETE'
        }).catch(err => console.error('Delete report error:', err));
    };

    const addReport = async (newReport) => {
        // Add to local state first for immediate UI update
        setReports(prev => [newReport, ...prev]);
        console.log('Report added to local state');
    };

    const updateReportStatus = async (id, newStatus) => {
        // Update local state
        setReports(prev => prev.map(report =>
            report.id === id ? { ...report, status: newStatus } : report
        ));

        // Also update backend to trigger notifications
        try {
            await fetch(`http://localhost:5000/api/reports/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            console.log('Status updated on backend, notifications triggered');
        } catch (error) {
            console.error('Error updating status on backend:', error);
        }
    };

    const markAsRetrieved = (id, specificStatus = "Retrieved") => {
        updateReportStatus(id, specificStatus);
    };

    return (
        <ReportContext.Provider value={{ reports, stats, deleteReport, addReport, updateReportStatus, markAsRetrieved }}>
            {children}
        </ReportContext.Provider>
    );
};
