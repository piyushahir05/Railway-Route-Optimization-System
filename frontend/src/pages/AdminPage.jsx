import AdminPanel from "../components/AdminPanel"

function AdminPage() {
  return (
    <main className="page">
      <h1 style={{ marginBottom: 12 }}>Network Admin Panel</h1>
      <div className="alert alert-warning" style={{ marginBottom: 16 }}>
        Changes here affect the live routing system immediately.
      </div>
      <AdminPanel />
    </main>
  )
}

export default AdminPage
