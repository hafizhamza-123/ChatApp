import { useState, useRef, useEffect } from "react";
import { FiX, FiCamera, FiLoader, FiAlertCircle } from "react-icons/fi";
import API from "../api/axios";
import "./ProfileModal.css";

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
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="profile-modal-content">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar preview" className="avatar-preview" />
              ) : (
                <div className="avatar-placeholder">
                  <FiCamera size={40} />
                </div>
              )}
              <button
                type="button"
                className="camera-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiCamera size={16} />
              </button>
            </div>
            <p className="avatar-label">Click camera icon to change avatar</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden-input"
            />
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="profile-form">
            {error && (
              <div className="alert alert-error">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span>{success}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader size={16} className="spinner" />
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
