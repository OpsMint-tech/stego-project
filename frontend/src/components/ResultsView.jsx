import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Activity, FileText, Binary } from 'lucide-react';

const ToolCard = ({ title, results, color = "text-neon-blue" }) => {
    if (!results) return null;

    const isSuccess = results.status === "Success" || results.status === "Executed";
    const statusColor = isSuccess ? color : "text-yellow-500";

    const renderContent = () => {
        if (!isSuccess && results.status === "Not Installed") {
            return <p className="text-red-400 text-xs italic">Tool not installed on server.</p>;
        }
        if (!isSuccess && results.error) {
            return <p className="text-red-400 text-xs">{results.error}</p>;
        }

        if (results.output) {
            return (
                <div className={`text-xs font-mono bg-black/40 p-2 rounded max-h-40 overflow-y-auto custom-scrollbar ${color}`}>
                    {results.output.length > 0 ? (
                        results.output.map((line, i) => <div key={i}>{line}</div>)
                    ) : (
                        <p className="text-gray-500 italic">No output produced.</p>
                    )}
                </div>
            );
        }

        if (results.data) {
            return (
                <div className="text-xs font-mono text-gray-400 grid grid-cols-1 gap-1 overflow-y-auto max-h-40 custom-scrollbar">
                    {Object.entries(results.data).map(([key, val]) => (
                        <div key={key} className="border-b border-gray-800/50 pb-1">
                            <span className="text-orange-400">{key}:</span> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </div>
                    ))}
                </div>
            );
        }

        if (results.preview) {
            return (
                <div className="text-xs font-mono text-gray-400">
                    <p className="mb-2">Found {results.count} strings. Preview:</p>
                    <div className="bg-black/40 p-2 rounded max-h-32 overflow-y-auto custom-scrollbar">
                        {results.preview.map((s, i) => (
                            <div key={i} className="truncate">{s}</div>
                        ))}
                    </div>
                </div>
            );
        }

        return <p className="text-gray-500 italic text-xs">Analysis complete. No significant data extracted.</p>;
    };

    return (
        <div className="border border-gray-800 rounded-lg p-4 bg-black/20 hover:border-gray-700 transition-colors">
            <h4 className={`${statusColor} font-mono mb-2 uppercase text-sm font-bold flex justify-between`}>
                {title}
                <span className="text-[10px] opacity-50 px-2 py-0.5 rounded border border-current">{results.status}</span>
            </h4>
            {renderContent()}
        </div>
    );
};

const ResultsView = ({ results }) => {
    if (!results) return null;

    if (results.error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-8 rounded-xl bg-red-900/10 border border-red-500/50 text-red-200 font-mono">
                <div className="flex items-center gap-4 mb-4">
                    <ShieldAlert size={48} className="text-neon-red" />
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest text-neon-red">System Analysis Error</h2>
                        <p className="text-sm opacity-70 text-gray-400">The forensic analysis pipeline encountered a critical exception.</p>
                    </div>
                </div>
                <div className="bg-black/50 p-4 rounded border border-red-900/50 text-xs overflow-x-auto text-red-400">
                    {results.error}
                </div>
                <p className="mt-4 text-xs text-gray-500 italic">Please verify that all dependencies and system tools are correctly installed on the server.</p>
            </div>
        );
    }

    const { deepvision_score, lsb_analysis, metadata, filename, dimensions, format, mode, tool_reports } = results;
    const score = deepvision_score?.score || 0;
    const isSuspicious = score > 50;

    const scoreColor = isSuspicious ? 'text-neon-red' : 'text-neon-green';
    const borderColor = isSuspicious ? 'border-neon-red' : 'border-neon-green';
    const Icon = isSuspicious ? ShieldAlert : ShieldCheck;

    const formatToolName = (name) => name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20"
        >
            {/* Main Score Card */}
            <div className={`col-span-1 lg:col-span-3 glass-panel rounded-xl p-8 border-l-8 ${borderColor} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icon size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Icon className={scoreColor} size={40} />
                            Deepvision Intelligence Analysis
                        </h2>
                        <div className="text-right">
                            <span className={`text-6xl font-mono font-bold ${scoreColor}`}>
                                {score}%
                            </span>
                            <p className="text-gray-400 text-[10px] font-mono tracking-widest uppercase">Suspicion Score</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-900 h-6 rounded-full overflow-hidden border border-gray-800 p-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={`h-full rounded-full ${isSuspicious ? 'bg-gradient-to-r from-red-600 to-neon-red' : 'bg-gradient-to-r from-green-600 to-neon-green shadow-[0_0_20px_rgba(57,255,20,0.4)]'}`}
                        />
                    </div>
                </div>
            </div>

            {/* Side Column: File Info & LSB */}
            <div className="col-span-1 space-y-6">
                <div className="glass-panel rounded-xl p-6 border border-gray-800/50">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="text-neon-blue" size={20} />
                        File Details
                    </h3>
                    <div className="space-y-3 text-sm font-mono text-gray-300">
                        <div className="flex justify-between border-b border-gray-800/50 pb-2">
                            <span className="text-gray-500">Filename:</span>
                            <span className="text-white text-right truncate pl-4">{filename}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800/50 pb-2">
                            <span className="text-gray-500">Format:</span>
                            <span className="text-white text-right">{format}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800/50 pb-2">
                            <span className="text-gray-500">Dimensions:</span>
                            <span className="text-white text-right">{dimensions?.[0]}x{dimensions?.[1]}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800/50 pb-2">
                            <span className="text-gray-500">Mode:</span>
                            <span className="text-white text-right">{mode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Size:</span>
                            <span className="text-white text-right">{(results.size_bytes / 1024).toFixed(2)} KB</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-xl p-6 border border-gray-800/50">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Binary className="text-purple-500" size={20} />
                        LSB Statistics
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-gray-500 text-xs uppercase mb-2 tracking-tighter">Mathematical Mean</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-mono text-white leading-none">{lsb_analysis?.mean_lsb_value?.toFixed(5)}</span>
                                <span className="text-[10px] text-gray-600 uppercase">Ideal: 0.500</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase mb-2">Security Status</p>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest ${lsb_analysis?.heuristic_suspicion === 'Low' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                {lsb_analysis?.heuristic_suspicion?.toUpperCase() || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Column: Advanced Tools & Findings */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel rounded-xl p-6 border border-gray-800/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="text-neon-blue" size={24} />
                        Forensic Toolkit Output
                    </h3>

                    {!tool_reports ? (
                        <div className="p-12 text-center border border-dashed border-gray-800 rounded-lg">
                            <Activity className="mx-auto text-gray-700 mb-4 animate-pulse" size={48} />
                            <p className="text-gray-500 font-mono text-sm uppercase tracking-tighter">No automated forensic tools reported back.</p>
                        </div>
                    ) : (
                        <>
                            {tool_reports.bit_planes?.status === "Success" && (
                                <div className="mb-8 border-b border-gray-800 pb-8">
                                    <h4 className="text-neon-green font-mono mb-4 text-sm flex items-center gap-2">
                                        <Activity size={16} /> BIT PLANE SLICING (LSB REVEAL)
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {tool_reports.bit_planes.planes.map((plane, i) => (
                                            <div key={i} className="relative group overflow-hidden rounded bg-black">
                                                <img
                                                    src={`http://localhost:8000${plane.path}`}
                                                    alt={plane.name}
                                                    className="w-full h-auto opacity-70 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] p-1.5 font-mono text-gray-400 transform translate-y-full group-hover:translate-y-0 transition-transform">
                                                    {plane.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(tool_reports).map(([toolId, toolResult]) => {
                                    if (toolId === 'bit_planes') return null;
                                    let color = "text-neon-blue";
                                    if (toolResult?.output?.length > 0 && toolId === 'zsteg') color = "text-neon-red";
                                    if (toolId === 'strings') color = "text-gray-300";

                                    return (
                                        <ToolCard
                                            key={toolId}
                                            title={formatToolName(toolId)}
                                            results={toolResult}
                                            color={color}
                                        />
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {results.final_report ? (
                    <div className="glass-panel rounded-xl p-8 border border-neon-blue/30 bg-neon-blue/5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                                    <FileText className="text-neon-blue" size={32} />
                                    Final Intelligence Report
                                </h3>
                                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Aggregate Threat Intelligence</p>
                            </div>
                            <div className="px-6 py-2 bg-black border border-gray-800 rounded-full">
                                <span className={`text-2xl font-bold font-mono ${results.final_report.verdict === 'Safe' ? 'text-neon-green' : 'text-neon-red'}`}>
                                    {results.final_report.verdict?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <p className="text-gray-400 text-xs font-mono uppercase tracking-widest border-l-2 border-neon-blue pl-2">Key Findings</p>
                                <ul className="space-y-3">
                                    {results.final_report.summary.map((reason, i) => (
                                        <motion.li
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={i}
                                            className="flex items-start gap-3 text-sm text-gray-300 font-mono"
                                        >
                                            <span className="text-neon-blue mt-1">▶</span>
                                            {reason}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-4">Risk Distribution</p>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-mono mb-2">
                                            <span className="text-gray-500">THREAT PROBABILITY</span>
                                            <span className="text-white">{results.final_report.suspicion_score}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${results.final_report.suspicion_score > 50 ? 'bg-neon-red' : 'bg-neon-green'}`}
                                                style={{ width: `${results.final_report.suspicion_score}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono italic">
                                        Aggregated risk based on forensic anomalies and AI detection models.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel rounded-xl p-8 border border-gray-800 text-center">
                        <p className="text-gray-500 font-mono text-xs uppercase italic tracking-widest">Aggregate intelligence report could not be generated.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ResultsView;
