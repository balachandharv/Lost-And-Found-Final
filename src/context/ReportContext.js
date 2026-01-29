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
    };

    const addReport = (newReport) => {
        setReports(prev => [newReport, ...prev]);
    };

    const updateReportStatus = (id, newStatus) => {
        setReports(prev => prev.map(report =>
            report.id === id ? { ...report, status: newStatus } : report
        ));
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
