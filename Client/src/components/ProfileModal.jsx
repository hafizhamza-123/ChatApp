import { useState, useRef, useEffect } from "react";
import { FiX, FiCamera, FiLoader, FiAlertCircle } from "react-icons/fi";
import API from "../api/axios";

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });
  
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || ""
      });
      setPreviewUrl(user.avatar || "");
      setAvatar(null);
      setError("");
      setSuccess("");
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username.trim() || !formData.email.trim()) {
      setError("Username and email cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("email", formData.email);

      if (avatar) {
        form.append("avatar", avatar);
      }

      const response = await API.put("/users/profile", form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        if (onProfileUpdate) {
          onProfileUpdate(response.data.data);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-112.5 overflow-y-auto custom-scrollbar rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl border-b border-[#f0f0f0] bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] px-6 py-6 text-white max-[480px]:px-4 max-[480px]:py-4">
          <h2 className="m-0 text-[20px] font-semibold">Edit Profile</h2>
          <button
            className="flex cursor-pointer items-center justify-center rounded-md bg-white/20 p-2 text-white transition hover:bg-white/30"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 max-[480px]:p-4">
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-30 w-30 rounded-full border-4 border-[#f0f0f0] object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                />
              ) : (
                <div className="flex h-30 w-30 items-center justify-center rounded-full bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  <FiCamera size={40} />
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-white shadow-[0_2px_8px_rgba(102,126,234,0.4)] transition hover:scale-110 hover:shadow-[0_4px_12px_rgba(102,126,234,0.6)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiCamera size={16} />
              </button>
            </div>
            <p className="m-0 text-center text-[13px] text-[#666]">Click camera icon to change avatar</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#fcc] bg-[#fee] px-3.5 py-3 text-[13px] text-[#c33]">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-[#cfc] bg-[#efe] px-3.5 py-3 text-[13px] text-[#3c3]">
                <span>{success}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#222]">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
                className="rounded-lg border border-[#ddd] bg-[#fafafa] px-3.5 py-3 text-sm transition focus:border-[#667eea] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#667eea]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#222]">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={loading}
                className="rounded-lg border border-[#ddd] bg-[#fafafa] px-3.5 py-3 text-sm transition focus:border-[#667eea] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#667eea]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#ddd] bg-[#f0f0f0] px-5 py-3 text-xs font-semibold uppercase tracking-[0.5px] text-[#333] transition hover:border-[#ccc] hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-60 min-[481px]:text-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.5px] text-white shadow-[0_4px_12px_rgba(102,126,234,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.6)] disabled:cursor-not-allowed disabled:opacity-60 min-[481px]:text-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
