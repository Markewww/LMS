import { useRef } from "react";
import { MegaphoneIcon, ImageIcon, XIcon, SendHorizontalIcon, PaletteIcon } from "lucide-react";
import { postBackgrounds, type PostBg } from "../postBg";

interface CreatePostProps {
  newPostText: string;
  setNewPostText: (text: string) => void;
  imagePreviews: string[]; // Changed from single string to string array
  onImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Plural signature
  onRemoveImage: (index: number) => void; // Removes by index matching array position
  selectedBg: PostBg;
  setSelectedBg: (bg: PostBg) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

const CreatePost = ({
  newPostText,
  setNewPostText,
  imagePreviews,
  onImagesChange,
  onRemoveImage,
  selectedBg,
  setSelectedBg,
  onSubmit,
  submitting,
}: CreatePostProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showBgSelector = imagePreviews.length === 0;

  return (
    <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-cvsu-green-50 text-cvsu-green-base">
          <MegaphoneIcon size={20} />
        </div>
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase text-sm tracking-wider">
          Create Announcement
        </h3>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Dynamic Class applied to Textarea container framework based on selectedBg choice */}
        <div className={`rounded-xl transition-all duration-300 ${selectedBg.className}`}>
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What's happening? Post an update or notification for the dashboard..."
            maxLength={1000}
            rows={selectedBg.id !== "none" ? 4 : 3}
            className={`w-full p-4 rounded-xl text-sm bg-transparent placeholder-gray-400 focus:outline-none transition-all resize-none ${
              selectedBg.id !== "none" ? "placeholder-white/70 text-center font-bold text-lg flex items-center justify-center min-h-32 pt-10" : "text-gray-700"
            }`}
          />
        </div>

        {/* Multiple Image Preview Layout Grid */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONDITIONAL BACKGROUND COLOR SELECTOR LAYOUT */}
        {showBgSelector && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
            <div className="text-gray-400 flex items-center gap-1.5 text-xs font-bold font-montserrat uppercase tracking-wider">
              <PaletteIcon size={14} />
              Themes:
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {postBackgrounds.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSelectedBg(bg)}
                  title={bg.name}
                  className={`w-6 h-6 rounded-full border transition-transform ${bg.className} ${
                    selectedBg.id === bg.id ? "scale-110 ring-2 ring-cvsu-green-base ring-offset-2" : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImagesChange}
            accept="image/*"
            multiple // Enforces multiple file selection
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-gray-500 hover:text-cvsu-green-base text-xs font-bold transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <ImageIcon size={18} />
            Add Photos
          </button>
          
          <button
            type="submit"
            disabled={!newPostText.trim() || submitting}
            className="flex items-center gap-2 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Publish Post"}
            <SendHorizontalIcon size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
