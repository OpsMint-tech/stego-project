import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Activity, FileText, Binary } from 'lucide-react';

const ResultsView = ({ results }) => {
    if (!results) return null;

    const { deepvision_score, lsb_analysis, metadata, filename, dimensions, format, mode } = results;
    const score = deepvision_score.score;
    const isSuspicious = score > 50;

    const scoreColor = isSuspicious ? 'text-neon-red' : 'text-neon-green';
    const borderColor = isSuspicious ? 'border-neon-red' : 'border-neon-green';
    const Icon = isSuspicious ? ShieldAlert : ShieldCheck;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
        >
            {/* Main Score Card */}
            <div className={`col-span-1 md:col-span-2 glass-panel rounded-xl p-6 border-l-4 ${borderColor}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Icon className={scoreColor} size={32} />
                        Deepvision Analysis
                    </h2>
                    <span className={`text-4xl font-mono font-bold ${scoreColor}`}>
                        {score}%
                    </span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${isSuspicious ? 'bg-neon-red' : 'bg-neon-green'}`}
                    />
                </div>
                <p className="text-gray-400 text-sm font-mono text-right">SUSPICION PROBABILITY</p>
            </div>

            {/* File Info */}
            <div className="glass-panel rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="text-neon-blue" size={20} />
                    File Details
                </h3>
                <div className="space-y-2 text-sm font-mono text-gray-300">
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span>Filename:</span>
                        <span className="text-white">{filename}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span>Format:</span>
                        <span className="text-white">{format}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span>Dimensions:</span>
                        <span className="text-white">{dimensions[0]}x{dimensions[1]}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Mode:</span>
                        <span className="text-white">{mode}</span>
                    </div>
                </div>
            </div>

            {/* LSB Analysis */}
            <div className="glass-panel rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Binary className="text-purple-500" size={20} />
                    LSB Statistics
                </h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Mean LSB Value</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-mono text-white">{lsb_analysis.mean_lsb_value?.toFixed(4)}</span>
                            <span className="text-xs text-gray-500 mb-1">(Expected ~0.5)</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Heuristic Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${lsb_analysis.heuristic_suspicion === 'Low' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {lsb_analysis.heuristic_suspicion.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            <div className="col-span-1 md:col-span-2 glass-panel rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="text-orange-500" size={20} />
                    Metadata Extracted
                </h3>
                {Object.keys(metadata).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-400 max-h-40 overflow-y-auto custom-scrollbar">
                        {Object.entries(metadata).map(([key, value]) => (
                            <div key={key} className="break-all border-b border-gray-800 pb-1">
                                <span className="text-orange-400">{key}:</span> {value}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No metadata found.</p>
                )}
            </div>

            {/* Advanced Tool Reports */}
            {results.tool_reports && (
                <div className="col-span-1 md:col-span-2 glass-panel rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="text-blue-500" size={20} />
                        Advanced Tool Reports
                    </h3>
                    <div className="space-y-4">
                        {/* Zsteg Report */}
                        <div className="border border-gray-800 rounded-lg p-4 bg-black/20">
                            <h4 className="text-neon-red font-mono mb-2">ZSTEG ANALYSIS (PNG/BMP)</h4>
                            {results.tool_reports.zsteg.status === "Success" ? (
                                <div className="text-xs font-mono text-gray-400 bg-black p-2 rounded max-h-32 overflow-y-auto custom-scrollbar">
                                    {results.tool_reports.zsteg.output.length > 0 ? (
                                        results.tool_reports.zsteg.output.map((line, i) => (
                                            <div key={i} className="text-neon-red">{line}</div>
                                        ))
                                    ) : (
                                        <p>No hidden data detected by Zsteg.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-red-400 text-xs">{results.tool_reports.zsteg.error}</p>
                            )}
                        </div>

                        {/* Bit Planes Visual Analysis */}
                        {results.tool_reports.bit_planes.status === "Success" && (
                            <div className="border border-gray-800 rounded-lg p-4 bg-black/20">
                                <h4 className="text-neon-green font-mono mb-2">BIT PLANE SLICING (VISUAL)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {results.tool_reports.bit_planes.planes.map((plane, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={plane.path}
                                                alt={plane.name}
                                                className="w-full h-auto rounded border border-gray-800 group-hover:border-neon-green transition-colors"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate">
                                                {plane.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Strings Report */}
                        <div className="border border-gray-800 rounded-lg p-4 bg-black/20">
                            <h4 className="text-neon-blue font-mono mb-2">STRINGS ANALYSIS</h4>
                            {results.tool_reports.strings.status === "Success" ? (
                                <div className="text-xs font-mono text-gray-400">
                                    <p className="mb-2">Found {results.tool_reports.strings.count} strings. Preview:</p>
                                    <div className="bg-black p-2 rounded max-h-32 overflow-y-auto custom-scrollbar">
                                        {results.tool_reports.strings.preview.map((s, i) => (
                                            <div key={i} className="truncate">{s}</div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-red-400 text-xs">{results.tool_reports.strings.error || "Not Available"}</p>
                            )}
                        </div>

                        {/* Binwalk Report */}
                        <div className="border border-gray-800 rounded-lg p-4 bg-black/20">
                            <h4 className="text-neon-blue font-mono mb-2">BINWALK SCAN</h4>
                            {results.tool_reports.binwalk.status === "Success" ? (
                                <div className="text-xs font-mono text-gray-400 bg-black p-2 rounded max-h-32 overflow-y-auto custom-scrollbar">
                                    {results.tool_reports.binwalk.output.length > 0 ? (
                                        results.tool_reports.binwalk.output.map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))
                                    ) : (
                                        <p>No embedded files detected.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-red-400 text-xs">{results.tool_reports.binwalk.error || "Not Available (System tool missing)"}</p>
                            )}
                        </div>

                        {/* Exif Report */}
                        <div className="border border-gray-800 rounded-lg p-4 bg-black/20">
                            <h4 className="text-neon-blue font-mono mb-2">DETAILED EXIF</h4>
                            {results.tool_reports.exif.status === "Success" ? (
                                <div className="text-xs font-mono text-gray-400 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(results.tool_reports.exif.data).map(([ifd, tags]) => (
                                        <div key={ifd}>
                                            <p className="text-orange-400 font-bold">{ifd}</p>
                                            {Object.entries(tags).map(([tag, val]) => (
                                                <div key={tag} className="pl-2 truncate">
                                                    <span className="text-gray-500">{tag}:</span> {String(val)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-red-400 text-xs">{results.tool_reports.exif.error}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Final Report Summary */}
            {results.final_report && (
                <div className="col-span-1 md:col-span-2 glass-panel rounded-xl p-6 border-t-4 border-neon-blue">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-neon-blue" size={32} />
                        FINAL INTELLIGENCE REPORT
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm uppercase mb-1">FINAL VERDICT</p>
                            <p className={`text-3xl font-bold ${results.final_report.verdict === 'Safe' ? 'text-neon-green' : 'text-neon-red'
                                }`}>
                                {results.final_report.verdict.toUpperCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase mb-1">AGGREGATED SUSPICION SCORE</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-800 h-4 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${results.final_report.suspicion_score > 50 ? 'bg-neon-red' : 'bg-neon-green'}`}
                                        style={{ width: `${results.final_report.suspicion_score}%` }}
                                    />
                                </div>
                                <span className="text-xl font-mono text-white">{results.final_report.suspicion_score}/100</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-gray-400 text-sm uppercase mb-2">KEY FINDINGS</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 font-mono text-sm">
                            {results.final_report.summary.map((reason, i) => (
                                <li key={i}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ResultsView;
