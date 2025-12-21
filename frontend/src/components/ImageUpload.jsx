import React, { useCallback, useState } from 'react';
import { Upload, FileImage, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const ImageUpload = ({ onUpload, isAnalyzing }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        onUpload(file);
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setPreview(null);
        onUpload(null);
    };

    return (
        <div className="w-full max-w-xl mx-auto mb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                    "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                    dragActive ? "border-neon-green bg-neon-green/10" : "border-gray-700 hover:border-gray-500 bg-gray-900/50",
                    preview ? "border-none p-0" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={isAnalyzing}
                />

                {preview ? (
                    <div className="relative w-full h-64 bg-black flex items-center justify-center">
                        <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                        <button
                            onClick={clearFile}
                            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                                <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-neon-green font-mono animate-pulse">ANALYZING...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center text-neon-green">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Upload Image</h3>
                        <p className="text-gray-400 mb-4">Drag & drop or click to browse</p>
                        <p className="text-xs text-gray-500 font-mono">SUPPORTS: JPG, PNG, BMP, WEBP</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ImageUpload;
