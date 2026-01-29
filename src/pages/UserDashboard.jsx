function UserDashboard() {
  const lostItems = [
    { id: 1, item: "Wallet", location: "Library" },
    { id: 2, item: "ID Card", location: "Canteen" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lost Items List</h2>
      <ul>
        {lostItems.map((item) => (
          <li key={item.id}>
            {item.item} - Found at {item.location}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserDashboard;
