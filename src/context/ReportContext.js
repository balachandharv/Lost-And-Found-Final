import React, { createContext, useContext, useState, useEffect } from "react";
import { reportsAPI } from "../services/api";

const ReportContext = createContext();

export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLost: 0,
        totalFound: 0,
        totalReturned: 0
    });

    // Fetch reports from backend on mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const result = await reportsAPI.getAll();
                if (result.success) {
                    setReports(result.reports);
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
                // Fallback to localStorage if backend not available
                const storedReports = localStorage.getItem("reports");
                if (storedReports) {
                    setReports(JSON.parse(storedReports));
                }
            }
            setLoading(false);
        };

        fetchReports();
    }, []);

    // Calculate stats whenever reports change
    useEffect(() => {
        const simpleStats = {
            totalLost: reports.filter(r => r.type === "Lost").length,
            totalFound: reports.filter(r => r.type === "Found").length,
            totalReturned: reports.filter(r => ["Retrieved", "Returned", "Resolved", "Brought Back"].includes(r.status)).length
        };
        setStats(simpleStats);
    }, [reports]);

    const deleteReport = async (id) => {
        try {
            const result = await reportsAPI.delete(id);
            if (result.success) {
                setReports(prev => prev.filter(report => report.id !== id));
            }
            return result;
        } catch (error) {
            console.error("Delete report failed:", error);
            // Fallback: delete locally
            setReports(prev => prev.filter(report => report.id !== id));
            return { success: true };
        }
    };

    const addReport = async (newReport) => {
        try {
            const result = await reportsAPI.create(newReport);
            if (result.success) {
                setReports(prev => [result.report, ...prev]);
                return result;
            }
            return result;
        } catch (error) {
            console.error("Add report failed:", error);
            // Fallback: add locally
            const localReport = { ...newReport, id: `R${Date.now()}` };
            setReports(prev => [localReport, ...prev]);
            return { success: true, report: localReport };
        }
    };

    const updateReportStatus = async (id, newStatus) => {
        try {
            const result = await reportsAPI.updateStatus(id, newStatus);
            if (result.success) {
                setReports(prev => prev.map(report =>
                    report.id === id ? { ...report, status: newStatus } : report
                ));
            }
            return result;
        } catch (error) {
            console.error("Update report status failed:", error);
            // Fallback: update locally
            setReports(prev => prev.map(report =>
                report.id === id ? { ...report, status: newStatus } : report
            ));
            return { success: true };
        }
    };

    const markAsRetrieved = (id, specificStatus = "Retrieved") => {
        return updateReportStatus(id, specificStatus);
    };

    return (
        <ReportContext.Provider value={{ reports, stats, loading, deleteReport, addReport, updateReportStatus, markAsRetrieved }}>
            {children}
        </ReportContext.Provider>
    );
};
