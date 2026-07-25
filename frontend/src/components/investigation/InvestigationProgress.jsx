import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, Circle, Terminal, Activity, Crosshair } from 'lucide-react';

export default function InvestigationProgress({ steps, target, isBackendComplete, onRevealReport }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);
  const logContainerRef = useRef(null);
  const [autoScrollLogs, setAutoScrollLogs] = useState(true);

  const isSimulationComplete = currentStepIndex >= steps.length;

  useEffect(() => {
    // Scroll to this component when it mounts
    setTimeout(() => {
        const container = document.getElementById('investigation-progress-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
  }, []);

  useEffect(() => {
    let timer;
    if (isSimulationComplete) {
      if (isBackendComplete) {
        // Both simulation and backend are complete. Trigger reveal.
        timer = setTimeout(() => {
          onRevealReport();
        }, 800); // slight delay before revealing
      }
    } else {
      // Dynamic delay (simulate varying processing times 300ms - 800ms)
      const delay = Math.floor(Math.random() * 500) + 300;

      timer = setTimeout(() => {
        // Add log
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        setLogs(prev => [...prev, { time: timeString, message: steps[currentStepIndex] }]);
        
        setCurrentStepIndex(prev => prev + 1);
      }, delay);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStepIndex, isSimulationComplete, isBackendComplete, steps, onRevealReport]);

  const handleLogScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setAutoScrollLogs(isBottom);
    }
  };

  useEffect(() => {
    // Scroll logs to bottom precisely within the container, preventing window scroll
    if (autoScrollLogs && logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs, autoScrollLogs]);

  const progressPercentage = Math.min(100, Math.round((currentStepIndex / steps.length) * 100));
  
  // Background Particles
  const particles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="position-relative overflow-hidden p-4 tl-card"
      style={{ minHeight: '600px', zIndex: 1 }}
    >
        {/* Animated Cyber Background */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: -1, background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="position-absolute rounded-circle"
                    style={{ 
                        width: 4, height: 4, 
                        background: 'var(--tl-primary)',
                        left: `${p.x}%`, top: `${p.y}%`,
                        boxShadow: '0 0 10px var(--tl-primary-light)'
                    }}
                    animate={{ 
                        y: [0, -100, 0],
                        opacity: [0.1, 0.5, 0.1] 
                    }}
                    transition={{ 
                        duration: p.duration, 
                        repeat: Infinity, 
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}
            <div className="position-absolute w-100 h-100" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23334155\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }}></div>
        </div>

        <div id="investigation-progress-container">
            <style>{`
                .tl-hide-scrollbar::-webkit-scrollbar { display: none; }
                .tl-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="row h-100 g-4">
                
                {/* Left Column: Status Header & Analysis Card */}
                <div className="col-12 col-lg-6 d-flex flex-column gap-4">
                    
                    {/* Status Header */}
                    <div className="p-4 rounded border" style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', letterSpacing: '1px' }}>Target</div>
                                <div style={{ color: 'var(--tl-primary-light)', fontWeight: 500, fontFamily: 'var(--tl-font-mono)', wordBreak: 'break-all' }}>{target || 'Processing...'}</div>
                            </div>
                            <div className="text-end">
                                <div style={{ fontSize: '0.75rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</div>
                                <div style={{ color: isSimulationComplete ? 'var(--tl-success)' : 'var(--tl-text-primary)' }}>
                                    {isSimulationComplete ? (isBackendComplete ? 'Complete' : 'Finalizing...') : 'Analyzing'}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-4">
                            {/* Progress Ring */}
                            <div style={{ position: 'relative', width: 80, height: 80 }}>
                                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
                                    <motion.circle 
                                        cx="50" cy="50" r="45" fill="none" stroke="var(--tl-primary)" strokeWidth="6" 
                                        strokeDasharray="283" strokeDashoffset={283 - (progressPercentage * 2.83)}
                                        strokeLinecap="round"
                                        transition={{ duration: 0.5 }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--tl-text-primary)' }}>{progressPercentage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.8125rem' }}>
                                    <span style={{ color: 'var(--tl-text-muted)' }}>Overall Progress</span>
                                    <span style={{ color: 'var(--tl-text-primary)' }}>{currentStepIndex} / {steps.length} Steps</span>
                                </div>
                                <div className="progress" style={{ height: 6, background: 'rgba(255,255,255,0.05)' }}>
                                    <motion.div 
                                        className="progress-bar" 
                                        style={{ background: 'var(--tl-primary)' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Analysis Card */}
                    <div className="flex-grow-1 p-4 rounded border d-flex flex-column justify-content-center align-items-center text-center" style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStepIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-100"
                            >
                                <div className="mb-3">
                                    {isSimulationComplete ? (
                                        <CheckCircle size={48} color="var(--tl-success)" className="mx-auto" />
                                    ) : (
                                        <Activity size={48} color="var(--tl-primary-light)" className="mx-auto" />
                                    )}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--tl-text-faint)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>
                                    {isSimulationComplete ? 'Investigation Complete' : 'Currently Running'}
                                </div>
                                <h5 style={{ color: 'var(--tl-text-primary)', margin: 0 }}>
                                    {isSimulationComplete ? 'Generating Final Report...' : steps[currentStepIndex]}
                                </h5>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>

                {/* Right Column: Logs */}
                <div className="col-12 col-lg-6 d-flex flex-column gap-4">
                    
                    {/* Live Log Panel */}
                    <div className="p-3 rounded border position-relative flex-grow-1 tl-hide-scrollbar" style={{ background: '#020617', borderColor: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', minHeight: '350px' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <Terminal size={14} color="var(--tl-text-muted)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--tl-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Investigation Log</span>
                        </div>
                        <div 
                        className="flex-grow-1 tl-hide-scrollbar" 
                        style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}
                        ref={logContainerRef}
                        onScroll={handleLogScroll}
                        >
                            <AnimatePresence initial={false}>
                                {logs.map((log, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="mb-1 d-flex gap-3"
                                    >
                                        <span style={{ color: 'var(--tl-text-faint)' }}>[{log.time}]</span>
                                        <span style={{ color: 'var(--tl-primary-light)' }}>{log.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {!autoScrollLogs && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="position-absolute"
                                style={{ bottom: '1rem', right: '1.5rem', zIndex: 10 }}
                            >
                                <button
                                    className="btn btn-sm d-flex align-items-center gap-2"
                                    style={{ background: 'var(--tl-primary)', color: 'white', border: 'none', fontSize: '0.75rem', borderRadius: '1rem', padding: '4px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                    onClick={() => setAutoScrollLogs(true)}
                                >
                                    Jump to Latest
                                </button>
                            </motion.div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    </motion.div>
  );
}
