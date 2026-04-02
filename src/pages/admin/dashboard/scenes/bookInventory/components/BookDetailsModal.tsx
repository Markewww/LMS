import { useEffect } from "react";
import { motion } from "framer-motion";
import { XIcon, DownloadIcon, PrinterIcon, SaveIcon } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useForm } from "react-hook-form";
import axios from "axios";

// Components
import BookLabel from "./BookLabel"; // We will create this next
import FormField from "./formField"; // Reuse or create a book-specific formField

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

type Props = {
  selectedBook: any;
  setSelectedBook: (value: any) => void;
  onUpdate: () => void;
};

const BookDetailsModal = ({ selectedBook, setSelectedBook, onUpdate }: Props) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm({ 
    defaultValues: selectedBook
  });

  useEffect(() => {
    if (selectedBook) {
      reset({
        ...selectedBook,
        // Ensure values match your DB columns
        authors: selectedBook.author || selectedBook.authors, 
      });
    }
  }, [selectedBook, reset]);

  if (!selectedBook) return null;

  const handleDownloadLabel = async () => {
    const element = document.getElementById("book-label-card");
    if (!element) return;

    try {
      const dataURL = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `LABEL-${selectedBook.book_id}.png`;
      link.click();
    } catch (error) {
      console.error("Label generation failed:", error);
      alert("Failed to generate label image.");
    }
  };

  const onSaveChanges = async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/update_book.php`, {
        ...data,
        uuid: selectedBook.book_id // Ensure the ID is passed correctly
      });
      if (response.data.success) {
        alert("Book record updated successfully!");
        onUpdate();
        setSelectedBook(null);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to server.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-dm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:h-auto"
      >
        <div className="bg-cvsu-green-base p-4 flex justify-between items-center text-white print:hidden">
          <h3 className="font-montserrat font-bold uppercase tracking-widest text-sm">Resource Details & Labels</h3>
          <button onClick={() => setSelectedBook(null)} className="hover:rotate-90 transition-transform">
            <XIcon size={24}/>
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 print:p-0 overflow-y-auto max-h-[85vh]">
          {/* VISUAL LABEL SECTION (QR & Barcode) */}
          <div className="print-section flex justify-center">
            <BookLabel selectedBook={selectedBook} />
          </div>

          {/* EDITABLE FORM SECTION */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 print:hidden">
            <div className="flex items-center gap-2 mb-4">
              <SaveIcon className="text-cvsu-green-base" size={20} />
              <h4 className="font-bold text-cvsu-green-dark uppercase text-xs">Edit Book Information</h4>
            </div>
            <FormField 
              register={register} 
              handleSubmit={handleSubmit} 
              onSaveChanges={onSaveChanges}
              isEdit={true} 
              setValue={setValue}
              watch={watch}
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-wrap justify-center gap-4 print:hidden">
            <button onClick={() => window.print()} className="ceit-button py-2 flex items-center gap-2">
              <PrinterIcon size={18} /> PRINT LABEL
            </button>
            <button onClick={handleDownloadLabel} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 transition-all">
              <DownloadIcon size={18} /> DOWNLOAD LABEL
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookDetailsModal;
