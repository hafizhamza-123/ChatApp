export default function GroupModal({
  showGroupModal,
  groupName,
  setGroupName,
  allUsers,
  selectedUsers,
  setSelectedUsers,
  setShowGroupModal,
  setGroupNameAndUsers,
  createGroup,
}) {
  if (!showGroupModal) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Group</h2>

        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-4 py-2.5 mb-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <div className="max-h-56 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
          {allUsers.map((u) => (
            <label key={u.id} className="flex items-center gap-3 cursor-pointer text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.id)}
                onChange={() => {
                  if (selectedUsers.includes(u.id)) {
                    setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                  } else {
                    setSelectedUsers([...selectedUsers, u.id]);
                  }
                }}
                className="accent-indigo-600"
              />
              <span>{u.username}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={() => {
              setShowGroupModal(false);
              setGroupNameAndUsers();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={createGroup}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm shadow hover:opacity-90 cursor-pointer"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
