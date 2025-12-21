import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ResultsView from './components/ResultsView';
import { ScanEye } from 'lucide-react';

function App() {
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    if (!file) {
      setResults(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      // Simulate a bit of delay for effect if response is too fast
      setTimeout(() => {
        setResults(data);
        setIsAnalyzing(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Please ensure backend is running.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex flex-col items-center justify-center mb-12 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <ScanEye className="text-neon-green w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter neon-text">
              DEEPVISION
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm md:text-base tracking-widest uppercase">
            Advanced Steganalysis & Hidden Data Detection
          </p>
        </header>

        <main>
          <ImageUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />

          {error && (
            <div className="max-w-xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-center">
              {error}
            </div>
          )}

          <ResultsView results={results} />
        </main>

        <footer className="mt-20 text-center text-gray-600 text-xs font-mono">
          <p>DEEPVISION SYSTEM v1.0 • SECURE ANALYSIS ENVIRONMENT</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
