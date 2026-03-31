import { X, FileText, Users, ShieldCheck, UserCheck, ExternalLink, Tag } from "lucide-react";

const ResearchDetailsModal = ({ research, onClose, onApprove, onReject }: any) => {
  if (!research) return null;

  const authors = JSON.parse(research.authors || "[]");
  const keywords = JSON.parse(research.keywords || "[]");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-cvsu-green-base text-white font-dm">
          <h2 className="font-montserrat font-black uppercase tracking-tight flex items-center gap-2">
            <FileText size={20} /> Research Review
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X /></button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 font-dm">
          {/* Title & Status */}
          <div>
            <span className="text-[10px] font-black text-cvsu-green-base bg-cvsu-bg px-2 py-1 rounded uppercase mb-2 inline-block">
              {research.type}
            </span>
            <h3 className="text-xl font-bold text-gray-900 leading-tight font-montserrat">{research.title}</h3>
          </div>

          {/* Abstract & Keywords */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Abstract</p>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{research.abstract}"</p>
            </div>
            
            {/* Displaying Keywords to solve 'unused' warning */}
            {keywords.length > 0 && (
                <div className="pt-3 border-t border-gray-200/50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Tag size={10} /> Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((word: string, i: number) => (
                            <span key={i} className="text-[10px] font-bold text-cvsu-green-base bg-cvsu-bg border border-cvsu-green-base/10 px-2 py-0.5 rounded">
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
            {/* Authors */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Users size={14} /> Authors
              </p>
              <div className="flex flex-wrap gap-2">
                {authors.map((a: any, i: number) => (
                  <span key={i} className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {a.first_name} {a.last_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Panel */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-sm">
                  <UserCheck size={16} className="text-amber-500" />
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">Adviser:</span>
                  <span className="font-bold text-gray-800">{research.adviser}</span>
               </div>
               <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck size={16} className="text-purple-500" />
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">Critic:</span>
                  <span className="font-bold text-gray-800">{research.technical_critic}</span>
               </div>
            </div>
          </div>

          {/* PDF Link */}
          <a 
            href={`http://localhost/LMS/src/${research.file_path}`} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-cvsu-bg border border-cvsu-green-base/20 rounded-xl text-cvsu-green-base font-black uppercase text-xs hover:bg-cvsu-green-50 transition-all shadow-sm"
          >
            <ExternalLink size={16} /> Open Full PDF Document
          </a>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-xs font-bold text-gray-500 uppercase hover:text-gray-700">Close</button>
          {research.status === 'pending' && (
            <>
              <button 
                onClick={() => onReject(research.uuid)}
                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-colors border border-red-100"
              >
                Reject
              </button>
              <button 
                onClick={() => onApprove(research.uuid)}
                className="flex-1 bg-cvsu-green-base text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-cvsu-green-base/20 hover:bg-cvsu-green-dark transition-all active:scale-95"
              >
                Approve Submission
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchDetailsModal;
