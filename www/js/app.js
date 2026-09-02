
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const Recharts = window.Recharts || null;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } = Recharts || {};

// --- 1. Audio System (Softer Tones) ---
window._visorAudioCtx = null;
const initAudioContext = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!window._visorAudioCtx) window._visorAudioCtx = new AudioContext();
    return window._visorAudioCtx;
};

const playWarningSound = async (type = 'warning', repeat = 1) => {
    if (window._visorIsMuted) return;
    try {
        const ctx = initAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') await ctx.resume();

        const playOnce = (timeOffset) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            switch (type) {
                case 'danger':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(600, ctx.currentTime + timeOffset);
                    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + timeOffset + 0.15);
                    gainNode.gain.setValueAtTime(0.4, ctx.currentTime + timeOffset);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.2);
                    oscillator.start(ctx.currentTime + timeOffset);
                    oscillator.stop(ctx.currentTime + timeOffset + 0.2);
                    break;
                case 'pass':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(523, ctx.currentTime + timeOffset);
                    oscillator.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + timeOffset + 0.1);
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.4);
                    oscillator.start(ctx.currentTime + timeOffset);
                    oscillator.stop(ctx.currentTime + timeOffset + 0.4);
                    break;
                default:
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440, ctx.currentTime + timeOffset);
                    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.3);
                    oscillator.start(ctx.currentTime + timeOffset);
                    oscillator.stop(ctx.currentTime + timeOffset + 0.3);
            }
        };
        for (let i = 0; i < repeat; i++) {
            playOnce(i * 0.4);
        }
    } catch (e) { console.warn("Audio warning failed:", e); }
};

// --- AI API System ---
const callAI = async (prompt, systemInstruction = "") => {
    const settingsStr = localStorage.getItem("visor_ai_settings");
    const settings = settingsStr ? JSON.parse(settingsStr) : { provider: 'gemini' };
    const provider = settings.provider || 'gemini';
    const apiKey = window.CryptoUtils.getBuiltinKey(provider);
    if (!apiKey) return "⚠️ 系統錯誤：無法讀取金鑰。";
    
    try {
        if (provider === 'deepseek') {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    "model": "deepseek/deepseek-r1-0528:free",
                    "messages": [{"role": "system", "content": systemInstruction}, {"role": "user", "content": prompt}]
                })
            });
            const data = await response.json();
            return data.choices?.[0]?.message?.content || "無回應";
        } else {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } }) });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "無回應";
        }
    } catch (e) { return `⚠️ API 錯誤: ${e.message}`; }
};

// --- Components ---
const Icon = ({ name, size = 24, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!window.lucide || !containerRef.current) return;
        const iconName = name.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, '').toUpperCase());
        const iconNode = window.lucide.icons[iconName];
        if (!iconNode) return;
        const svgElement = window.lucide.createElement(iconNode);
        svgElement.setAttribute('width', size);
        svgElement.setAttribute('height', size);
        if (className) svgElement.setAttribute('class', className);
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(svgElement);
    }, [name, size, className]);
    return <span ref={containerRef} style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}></span>;
};

const EdgeLightingOverlay = ({ direction }) => {
    if (!direction) return null;
    const labels = { front: "前方碰撞預警", rear: "後方追撞預警", left: "左側盲點警示", right: "右側盲點警示" };
    return (
        <div className={`absolute inset-0 pointer-events-none z-[100] transition-all duration-200 edge-light-${direction}`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <div className="bg-black/60 backdrop-blur-md border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                    <Icon name="alert-circle" size={24} /><span className="font-bold tracking-widest">{labels[direction]}</span>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---
const App = () => {
    const [isBooting, setIsBooting] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [systemStatus, setSystemStatus] = useState({ pi5: false, piZero: false, cpu: 0, mem: 0, temp: 0 });
    const [simulatedSpeed, setSimulatedSpeed] = useState(0);
    const [tiltAngle, setTiltAngle] = useState(0);
    const [activeTab, setActiveTab] = useState('login');
    const [edgeWarning, setEdgeWarning] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [pi5Logs, setPi5Logs] = useState([{type:'system', msg:'APP 已啟動，等待 Pi5 連線...', ts: new Date().toLocaleTimeString('zh-TW',{hour12:false})}]);
    const socketRef = useRef(null);
    const logEndRef = useRef(null);
    const isSimulatingRef = useRef(false);

    // WebSocket Connection Logic
    useEffect(() => {
        let host = "192.168.4.1"; // 預設 Pi 5 AP IP
        if (window.location.hostname && !['localhost', '127.0.0.1', ''].includes(window.location.hostname)) {
            host = window.location.hostname;
        }
        
        const socketUrl = `ws://${host}:8765`;
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            setSystemStatus(prev => ({ ...prev, pi5: true }));
            setPi5Logs(prev => [...prev.slice(-99), {type:'system', msg:'✅ WebSocket 已連線至 Pi5', ts: new Date().toLocaleTimeString('zh-TW',{hour12:false})}]);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.system) {
                    setSystemStatus({
                        pi5: true,
                        piZero: data.system.hud_status === 'online',
                        cpu: data.system.cpu,
                        mem: data.system.mem,
                        temp: data.system.temp || 0
                    });
                }
                setSimulatedSpeed(Math.round(data.speed || 0));
                setTiltAngle(Math.round(data.tilt || 0));
                if (data.warning && data.warning.level === 'danger') {
                    setEdgeWarning(data.warning.direction);
                    setTimeout(() => setEdgeWarning(null), 1500);
                    playWarningSound('danger', 2);
                } else if (data.warning && data.warning.level === 'warning') {
                    setEdgeWarning(data.warning.direction);
                    setTimeout(() => setEdgeWarning(null), 800);
                    playWarningSound('warning');
                }
                // Pi5 Log 接收
                if (data.pi5_log && data.pi5_log.length > 0) {
                    const ts = new Date().toLocaleTimeString('zh-TW',{hour12:false});
                    const newEntries = data.pi5_log.map(l => ({...l, ts}));
                    setPi5Logs(prev => [...prev.slice(-99), ...newEntries]);
                }
            } catch (e) { console.error("Parse error", e); }
        };

        socket.onclose = () => {
            setIsConnected(false);
            setSystemStatus(prev => ({ ...prev, pi5: false, piZero: false }));
            setPi5Logs(prev => [...prev.slice(-99), {type:'danger', msg:'❌ 與 Pi5 的連線已中斷', ts: new Date().toLocaleTimeString('zh-TW',{hour12:false})}]);
        };

        return () => socket.close();
    }, []);

    // Boot Sequence
    useEffect(() => {
        setTimeout(() => setIsBooting(false), 3000);
    }, []);

    if (isBooting) return null; // 啟動畫面由 HTML 控制，React 準備好後隱藏

    return (
        <div className="flex flex-col h-full">
            {/* 頂部狀態列 */}
            <div className="bg-slate-950 px-6 pt-5 pb-2 flex justify-between items-center z-20 shrink-0">
                <div className="flex items-center gap-2"><Icon name="shield-check" size={18} className="text-cyan-400" /><h1 className="text-lg font-black text-white tracking-widest italic font-mono">V.I.S.O.R.</h1></div>
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-800">
                        <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.pi5 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`text-[9px] font-bold ${systemStatus.pi5 ? 'text-slate-300' : 'text-red-400'}`}>CORE</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-800">
                        <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.piZero ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`text-[9px] font-bold ${systemStatus.piZero ? 'text-slate-300' : 'text-red-400'}`}>HUD</span>
                    </div>
                </div>
            </div>

            <EdgeLightingOverlay direction={edgeWarning} />

            <div className="flex-1 overflow-y-auto p-5 pb-32">
                {activeTab === 'login' ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <button onClick={() => setActiveTab('home')} className="bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold">進入系統</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 儀表板 */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center">
                            <div className="text-slate-400 text-sm">CURRENT SPEED</div>
                            <div className="text-8xl font-black font-mono text-cyan-400 leading-none my-2">{simulatedSpeed}</div>
                            <div className="text-slate-500 font-bold tracking-widest">KM/H</div>
                            
                            <div className="w-full mt-6 space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono"><span>TILT: {tiltAngle}°</span><span>TEMP: {systemStatus.temp}°C</span></div>
                                <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 transition-all" style={{width: `${Math.abs(tiltAngle)*2}%`, marginLeft: tiltAngle < 0 ? 'auto' : '50%', marginRight: tiltAngle > 0 ? 'auto' : '50%'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 系統負載 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div className="text-slate-500 text-[10px] mb-1">CPU LOAD</div>
                                <div className="text-xl font-mono text-white">{systemStatus.cpu}%</div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div className="text-slate-500 text-[10px] mb-1">MEMORY</div>
                                <div className="text-xl font-mono text-white">{systemStatus.mem}%</div>
                            </div>
                        </div>

                        {/* Pi5 即時日誌 */}
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Icon name="terminal" size={14} className="text-cyan-400" />
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider">Pi5 SYSTEM LOG</span>
                                </div>
                                <button onClick={() => setPi5Logs([])} className="text-[9px] text-slate-600 hover:text-slate-400 font-mono">CLEAR</button>
                            </div>
                            <div className="h-48 overflow-y-auto p-3 font-mono text-[10px] space-y-0.5 scroll-smooth" ref={el => { if(el) el.scrollTop = el.scrollHeight; }}>
                                {pi5Logs.length === 0 ? (
                                    <div className="text-slate-600 text-center py-4">等待日誌...</div>
                                ) : pi5Logs.map((log, i) => (
                                    <div key={i} className="flex gap-2 leading-relaxed">
                                        <span className="text-slate-600 shrink-0">{log.ts}</span>
                                        <span className={`shrink-0 ${
                                            log.type === 'danger' ? 'text-red-400' :
                                            log.type === 'warning' ? 'text-yellow-400' :
                                            log.type === 'ai' ? 'text-cyan-400' :
                                            'text-green-400'
                                        }`}>[{log.type === 'ai' ? 'AI' : log.type === 'danger' ? '!!!' : log.type === 'warning' ? 'WRN' : 'SYS'}]</span>
                                        <span className="text-slate-300">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 導覽列 */}
            {activeTab !== 'login' && (
                <div className="fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/5 p-4 flex justify-around">
                    <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-cyan-400' : 'text-slate-500'}><Icon name="shield" /></button>
                    <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'text-cyan-400' : 'text-slate-500'}><Icon name="activity" /></button>
                    <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-500'}><Icon name="settings" /></button>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
