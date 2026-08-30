import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/API/APIConfig";
import CreatePost from "./components/CreatePost";
import PostFeed from "./components/PostFeed";
import ImageLightbox from "./components/ImageLightbox";
import { postBackgrounds, type PostBg } from "./postBg";

interface Announcement {
  id: number;
  adminId: string;
  text: string;
  imagePath: string | null; // Keeps structure uniform; multiple files parse cleanly downstream
  createdAt: string;
}

interface DashboardAnnouncementsProps {
  currentAdminId: string;
}

const DashboardAnnouncements = ({ currentAdminId }: DashboardAnnouncementsProps) => {
  const [posts, setPosts] = useState<Announcement[]>([]);
  const [newPostText, setNewPostText] = useState("");
  
  // ─── TRACK ARRAYS FOR MULTIPLE FILES ───
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedBg, setSelectedBg] = useState<PostBg>(postBackgrounds[0]);
  
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const baseAssetUrl = API_BASE_URL.replace(/\/src\/API|\/API|\/api/i, "");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/announcements.php`);
      setPosts(response.data);
    } catch (error) {
      console.error("Failed fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      
      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewsArray]);
      
      // Safety step: reset background styling back to default if image files arrive
      setSelectedBg(postBackgrounds[0]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || submitting) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("adminId", currentAdminId);
      formData.append("text", newPostText);
      formData.append("bgId", selectedBg.id); // Transmit chosen theme indicator key

      // Append multiple images into an array layout structure
      selectedImages.forEach((image) => {
        formData.append("images[]", image);
      });

      await axios.post(`${API_BASE_URL}/admin/announcements.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewPostText("");
      setSelectedImages([]);
      setImagePreviews([]);
      setSelectedBg(postBackgrounds[0]);
      await fetchAnnouncements();
    } catch (error) {
      console.error("Failed creating announcement:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!window.confirm("Are you sure you want to delete this announcement? This will remove the post permanently.")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/announcements.php?id=${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  return (
    <div className="space-y-6">
      <CreatePost
        newPostText={newPostText}
        setNewPostText={setNewPostText}
        imagePreviews={imagePreviews}
        onImagesChange={handleImagesChange}
        onRemoveImage={removeSelectedImage}
        selectedBg={selectedBg}
        setSelectedBg={setSelectedBg}
        onSubmit={handlePublish}
        submitting={submitting}
      />

      <PostFeed
        posts={posts}
        loading={loading}
        currentAdminId={currentAdminId}
        baseAssetUrl={baseAssetUrl}
        onDelete={handleDelete}
        onImageClick={(images, index) => {
          setLightboxImages(images);
          setActiveImageIdx(index);
        }}
      />

      <ImageLightbox 
        images={lightboxImages} 
        activeIndex={activeImageIdx}
        setActiveIndex={setActiveImageIdx} 
        onClose={() => {
          setLightboxImages([]);
          setActiveImageIdx(-1);
        }} />
    </div>
  );
};

export default DashboardAnnouncements;
