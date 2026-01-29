export const mockStats = {
    totalUsers: 1250,
    activeLostReports: 42,
    itemsFound: 89,
    casesSolved: 315,
};

export const mockUsers = [
    { id: "U001", name: "John Doe", email: "john@college.edu", role: "Student", status: "Active" },
    { id: "U002", name: "Jane Smith", email: "jane@college.edu", role: "Student", status: "Active" },
    { id: "U003", name: "Robert Fox", email: "robert@college.edu", role: "Student", status: "Blocked" },
    { id: "U004", name: "Emily Davis", email: "emily@college.edu", role: "Admin", status: "Active" },
    { id: "U005", name: "Michael Brown", email: "michael@college.edu", role: "Student", status: "Active" },
];

export const mockReports = [
    {
        id: "R101",
        item: "MacBook Pro",
        location: "Library 2nd Floor",
        type: "Lost",
        reportedBy: "John Doe",
        date: "2023-10-25",
        status: "Pending"
    },
    {
        id: "R102",
        item: "Blue Water Bottle",
        location: "Cafeteria",
        type: "Found",
        reportedBy: "Admin",
        date: "2023-10-26",
        status: "Available",
        retrievedBy: null
    },
    {
        id: "R103",
        item: "Calculus Textbook",
        location: "Room 304",
        type: "Lost",
        reportedBy: "Jane Smith",
        date: "2023-10-27",
        status: "Resolved"
    },
    {
        id: "R104",
        item: "Car Keys (Honda)",
        location: "Parking Lot A",
        type: "Found",
        reportedBy: "Security",
        date: "2023-10-28",
        status: "Retrieved",
        retrievedBy: "Mike Ross (Owner)"
    },
    {
        id: "R105",
        item: "ID Card",
        location: "Main Gate",
        type: "Found",
        reportedBy: "Emily Davis",
        date: "2023-10-28",
        status: "Verified",
        retrievedBy: null
    },
    {
        id: "R106",
        item: "Wireless Earbuds",
        location: "Gym Locker",
        type: "Lost",
        reportedBy: "Alex Johnson",
        date: "2023-10-29",
        status: "Pending"
    },
];
