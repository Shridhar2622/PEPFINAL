import { X, FileText, ExternalLink, Shield } from 'lucide-react';
import { getMediaUrl, isPdf } from '../../utils/media';

const DocumentModel = ({ tech, onClose }) => {
    if (!tech) return null;

    const docs = tech.documents || {};
    const techName = tech.user?.name || 'Technician';

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-4xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Document Verification</h3>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{techName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-all shadow-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Aadhar Card */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={16} className="text-indigo-500" />
                                    Aadhar Card
                                </h4>
                                {docs.aadharCard && (
                                    <a href={getMediaUrl(docs.aadharCard)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors">
                                        Open Full <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                            <div className="aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative">
                                {docs.aadharCard ? (
                                    isPdf(docs.aadharCard) ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                                                <FileText size={48} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Aadhar_PDF</span>
                                            <a
                                                href={getMediaUrl(docs.aadharCard)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 text-[10px] font-black uppercase text-indigo-600 border-b border-indigo-200"
                                            >Click to View</a>
                                        </div>
                                    ) : (
                                        <img src={getMediaUrl(docs.aadharCard)} alt="Aadhar Card" className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105" />
                                    )
                                ) : (
                                    <span className="text-gray-400 font-medium italic">No Aadhar Provided</span>
                                )}
                            </div>
                        </div>

                        {/* PAN Card */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={16} className="text-indigo-500" />
                                    PAN Card
                                </h4>
                                {docs.panCard && (
                                    <a href={getMediaUrl(docs.panCard)} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors">
                                        Open Full <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                            <div className="aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative">
                                {docs.panCard ? (
                                    isPdf(docs.panCard) ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                                                <FileText size={48} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">PAN_PDF</span>
                                            <a
                                                href={getMediaUrl(docs.panCard)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 text-[10px] font-black uppercase text-indigo-600 border-b border-indigo-200"
                                            >Click to View</a>
                                        </div>
                                    ) : (
                                        <img src={getMediaUrl(docs.panCard)} alt="PAN Card" className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105" />
                                    )
                                ) : (
                                    <span className="text-gray-400 font-medium italic">No PAN Provided</span>
                                )}
                            </div>
                        </div>

                        {/* Resume / Background Check */}
                        <div className="md:col-span-2 space-y-3">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} className="text-indigo-500" />
                                Professional Resume / Profile Docs
                            </h4>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{techName}_Resume.{isPdf(docs.resume) ? 'pdf' : 'file'}</p>
                                        <p className="text-xs text-gray-400">{isPdf(docs.resume) ? 'PDF Document' : 'Media File'}</p>
                                    </div>
                                </div>
                                {docs.resume ? (
                                    <a
                                        href={getMediaUrl(docs.resume)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black italic tracking-widest text-xs uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                        View Document
                                    </a>
                                ) : (
                                    <span className="text-red-400 font-bold text-xs uppercase tracking-widest italic">Document Missing</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black italic tracking-widest text-[10px] uppercase hover:bg-gray-50 transition-all"
                    >
                        Close Viewer
                    </button>
                    <div className="flex-1"></div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest self-center italic">Verify carefully before approving platform access</p>
                </div>
            </div>
        </div>
    );
};

export default DocumentModel;
