import { QRCode } from "react-qrcode-logo";
import Barcode from "react-barcode";

const BookLabel = ({ selectedBook }: { selectedBook: any }) => {
  return (
    <div 
      id="book-label-card" 
      className="bg-white border-2 border-gray-200 p-6 rounded-lg flex flex-col items-center gap-4 w-full max-w-sm shadow-sm"
    >
      <div className="text-center">
        <h4 className="font-montserrat font-black text-cvsu-green-base text-lg uppercase leading-tight">
          CvSU CEIT
        </h4>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reading Room Inventory</p>
      </div>

      {/* QR CODE */}
      <div className="p-2 bg-white border border-gray-100 rounded-md">
        <QRCode 
          value={selectedBook.qr_data || `BOOK-${selectedBook.book_id}`} 
          size={500} 
          ecLevel="H"
          style={{ 
              width: '150px',
              height: '150px',
              imageRendering: "pixelated" }}
        />
      </div>

      {/* BARCODE */}
      <div className="w-full flex justify-center scale-90">
        <Barcode 
          value={selectedBook.barcode || selectedBook.book_id} 
          width={1.5}
          height={50}
          fontSize={12}
        />
      </div>

      <div className="text-center border-t border-gray-100 pt-3 w-full">
        <p className="text-xs font-black text-gray-800 uppercase line-clamp-1">{selectedBook.title}</p>
        <p className="text-[10px] font-bold text-cvsu-green-base uppercase">Accession: {selectedBook.book_id}</p>
      </div>
    </div>
  );
};

export default BookLabel;
