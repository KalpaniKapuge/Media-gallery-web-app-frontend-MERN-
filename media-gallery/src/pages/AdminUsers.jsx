import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      alert('Load failed');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/user/${user._id}`, {
        name: user.name,
        role: user.role,
        isActive: !user.isActive,
      });
      load();
    } catch (e) {
      alert('Update failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      {users.map((u) => (
        <div key={u._id} className="border p-3 flex justify-between items-center mb-2">
          <div>
            {u.name} - {u.email} - {u.role} -{' '}
            {u.isActive ? (
              <span className="text-green-600">Active</span>
            ) : (
              <span className="text-red-600">Deactivated</span>
            )}
          </div>
          <button
            onClick={() => toggleActive(u)}
            className="px-3 py-1 bg-orange-500 text-white rounded"
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ))}
    </div>
  );
}
