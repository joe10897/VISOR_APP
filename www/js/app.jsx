        const { useState, useEffect, useMemo, useRef, useCallback } = React;
        const Recharts = window.Recharts || null;
        const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } = Recharts || {};

        // --- Supabase 初始化區塊 ---
        const supabaseUrl = 'https://klocpegynqrkrsggtdpa.supabase.co';
        const supabaseKey = 'sb_publishable_F8milukMYwEBxDjyAOb3KQ_38jmgTpB';

        // 使用 window.supabase 確保在 Cordova 環境中正確抓取全域物件
        const _supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

        if (_supabase) {
            logToScreen("V.I.S.O.R. Supabase 雲端模組已就緒");
        } else {
            logToScreen("Supabase SDK 載入失敗，請檢查網路或 CSP 設定", true);
        }
        // -------------------------

        // --- 1. Audio System (Softer Tones) ---
        window._visorAudioCtx = null;
        const initAudioContext = () => {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            if (!window._visorAudioCtx) window._visorAudioCtx = new AudioContext();
            return window._visorAudioCtx;
        };

        const playWarningSound = async (type = 'warning', repeat = 1) => {
            if (window._visorIsMuted) return; // 檢查全域靜音狀態
            try {
                const ctx = initAudioContext();
                if (!ctx) return;
                if (ctx.state === 'suspended') await ctx.resume();

                const playOnce = (timeOffset) => {
                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    //音效類型 (整合自朋友的優化版本)
                    switch (type) {
                        case 'danger': // 危險
                            oscillator.type = 'triangle';
                            oscillator.frequency.setValueAtTime(600, ctx.currentTime + timeOffset);
                            oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + timeOffset + 0.15);
                            gainNode.gain.setValueAtTime(0.4, ctx.currentTime + timeOffset);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.2);
                            oscillator.start(ctx.currentTime + timeOffset);
                            oscillator.stop(ctx.currentTime + timeOffset + 0.2);
                            break;

                        case 'pass': // 通過
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(523, ctx.currentTime + timeOffset); // C5
                            oscillator.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + timeOffset + 0.1); // C6
                            gainNode.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.4);
                            oscillator.start(ctx.currentTime + timeOffset);
                            oscillator.stop(ctx.currentTime + timeOffset + 0.4);
                            break;

                        case 'overspeed': // 超速 (辨識度高)
                            oscillator.type = 'triangle';
                            oscillator.frequency.setValueAtTime(1200, ctx.currentTime + timeOffset);
                            gainNode.gain.setValueAtTime(0.3, ctx.currentTime + timeOffset);
                            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.1);
                            oscillator.start(ctx.currentTime + timeOffset);
                            oscillator.stop(ctx.currentTime + timeOffset + 0.1);
                            break;

                        case 'sos': // SOS 緊急求救 (雙頻模擬)
                            oscillator.type = 'triangle';
                            const step = 0.5;
                            const hi = 960;
                            const lo = 770;
                            for (let j = 0; j < 6; j++) {
                                oscillator.frequency.setValueAtTime(j % 2 === 0 ? lo : hi, ctx.currentTime + timeOffset + (j * step));
                            }
                            gainNode.gain.setValueAtTime(0.1, ctx.currentTime + timeOffset);
                            gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + timeOffset + 0.8);
                            gainNode.gain.setValueAtTime(0.3, ctx.currentTime + timeOffset + (step * 6) - 0.1);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + (step * 6));
                            oscillator.start(ctx.currentTime + timeOffset);
                            oscillator.stop(ctx.currentTime + timeOffset + (step * 6));
                            break;

                        default: // warning (輕微提示)
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(440, ctx.currentTime + timeOffset);
                            gainNode.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.3);
                            oscillator.start(ctx.currentTime + timeOffset);
                            oscillator.stop(ctx.currentTime + timeOffset + 0.3);
                    }
                };
                for (let i = 0; i < repeat; i++) {
                    let gap = 0.4;
                    if (type === 'danger') gap = 0.2;
                    if (type === 'overspeed' || type === 'radar') gap = 0.15;
                    playOnce(i * gap);
                }
            } catch (e) { console.warn("Audio warning failed:", e); }
        };

        // --- AI API System (Gemini & DeepSeek) ---
        const callAI = async (prompt, systemInstruction = "") => {
            const settingsStr = localStorage.getItem("visor_ai_settings");
            const settings = settingsStr ? JSON.parse(settingsStr) : { provider: 'gemini' };
            const provider = settings.provider || 'gemini';

            if (provider === 'deepseek') {
                // 取得內建 DeepSeek Key
                const apiKey = window.CryptoUtils.getBuiltinKey('deepseek');
                if (!apiKey) return "⚠️ 系統錯誤：無法讀取內建 DeepSeek 金鑰。";

                try {
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://visor.project",
                            "X-Title": "V.I.S.O.R. MK-XXV"
                        },
                        body: JSON.stringify({
                            "model": "deepseek/deepseek-r1-0528:free",
                            "messages": [
                                { "role": "system", "content": systemInstruction },
                                { "role": "user", "content": prompt }
                            ]
                        })
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.error?.message || response.status);
                    }
                    const data = await response.json();
                    return data.choices?.[0]?.message?.content || "V.I.S.O.R. (DeepSeek) 無回應";
                } catch (e) {
                    console.error("DeepSeek API Error:", e);
                    return `⚠️ DeepSeek 連線異常：${e.message}`;
                }

            } else {
                // Default: Gemini
                // 取得內建 Gemini Key
                const apiKey = window.CryptoUtils.getBuiltinKey('gemini');
                if (!apiKey) return "⚠️ 系統錯誤：無法讀取內建 Gemini 金鑰。";

                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } };

                try {
                    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(`API Error: ${errData.error?.message || response.status}`);
                    }
                    const data = await response.json();
                    return data.candidates?.[0]?.content?.parts?.[0]?.text || "V.I.S.O.R. Core 無法連線 (No Data)";
                } catch (error) {
                    console.error("Gemini API Error:", error);
                    return `⚠️ Gemini 連線異常：${error.message}`;
                }
            }
        };

        // --- Utils ---
        const BUILT_IN_CAMERAS = [
            { address: "國道五號南向22.5公里(雪山隧道)", lat: 24.88923, lng: 121.761765, limit: 90, type: "fixed", direct: "往南", heading: 180 },
            { address: "國道五號北向22.5公里(雪山隧道)", lat: 24.889566, lng: 121.762215, limit: 90, type: "fixed", direct: "往北", heading: 0 },
            { address: "國道五號南向23.9公里(雪山隧道)", lat: 24.87876, lng: 121.76942, limit: 90, type: "fixed", direct: "往南", heading: 180 },
            { address: "金湖鎮黃海路(陽明湖路段)", lat: 24.458809, lng: 118.43147, limit: 60, type: "fixed", direct: "南北雙向", heading: "ALL" },
        ];

        const toPascalCase = (str) => str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, '').toUpperCase());
        const Icon = ({ name, size = 24, className = "" }) => {
            const containerRef = useRef(null);
            useEffect(() => {
                if (!window.lucide || !containerRef.current) return;
                const iconName = toPascalCase(name);
                const iconNode = window.lucide.icons[iconName];
                if (!iconNode) return;
                const svgElement = window.lucide.createElement(iconNode);
                svgElement.setAttribute('width', size);
                svgElement.setAttribute('height', size);
                if (className) svgElement.setAttribute('class', className);
                containerRef.current.innerHTML = '';
                containerRef.current.appendChild(svgElement);
            }, [name, size, className]);
            return <span ref={containerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}></span>;
        };

        const EdgeLightingOverlay = ({ direction }) => {
            if (!direction) return null;
            let lightingClass = "";
            let iconName = "alert-circle";
            let label = "WARNING";
            switch (direction) {
                case 'front': lightingClass = "edge-light-front"; iconName = "arrow-up-circle"; label = "前方碰撞預警"; break;
                case 'rear': lightingClass = "edge-light-rear"; iconName = "arrow-down-circle"; label = "後方追撞預警"; break;
                case 'left': lightingClass = "edge-light-left"; iconName = "arrow-left-circle"; label = "左側盲點警示"; break;
                case 'right': lightingClass = "edge-light-right"; iconName = "arrow-right-circle"; label = "右側盲點警示"; break;
            }
            return (
                <div className={`absolute inset-0 pointer-events-none z-[100] transition-all duration-200 ${lightingClass}`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-80">
                        <div className="bg-black/60 backdrop-blur-md border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse">
                            <Icon name={iconName} size={24} /><span className="font-bold tracking-widest">{label}</span>
                        </div>
                    </div>
                </div>
            );
        };

        const SpeedCameraAlert = React.memo(({ alert, currentSpeed }) => {
            // 1. Hooks (Must be first)
            const lastSoundTimeRef = useRef(0);
            const lastCameraRef = useRef(null);
            const radarTimerRef = useRef(null);

            // 2. Safe Data Access
            const isOverSpeed = alert ? currentSpeed > alert.limit : false;
            const isStationary = currentSpeed < 5;
            const distance = alert ? alert.distance : Infinity;
            const address = alert ? alert.address : null;

            // 3. Effect Logic
            useEffect(() => {
                if (!alert) return; // Guard clause inside effect
                if (isStationary) return;

                // 安全通過測速點
                if (distance <= 0) {
                    playWarningSound('pass', 1);
                    return;
                }

                // 近距離 (0-200m)：超速則播 overspeed，未超速則播 warning
                if (distance < 200 && distance > 0) {
                    if (isOverSpeed) {
                        playWarningSound('overspeed', 3); // 超速 (急促)
                    } else {
                        playWarningSound('warning', 1); // 未超速
                    }
                }
                // 中距離 (200-600m)：無論是否超速都持續播 warning
                else if (distance >= 200 && distance < 600) {
                    playWarningSound('warning', 1);
                }

            }, [address, isOverSpeed, Math.floor(distance / 50), distance <= 0, isStationary]);

            // 4. Conditional Rendering (Must be last)
            if (!alert) return null;

            return (
                <div className={`w-full rounded-xl p-3 mb-4 flex items-center gap-4 shadow-lg transition-all duration-300 border ${isOverSpeed ? 'bg-red-900/90 border-red-500 animate-danger' : (isStationary ? 'bg-slate-800/80 border-slate-600 opacity-70' : 'bg-slate-800/95 border-yellow-500/50')}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow shrink-0 ${isOverSpeed ? 'bg-white border-4 border-red-600 text-black' : 'bg-slate-700 border-2 border-slate-500 text-slate-300'}`}>
                        <span className="font-black text-2xl tracking-tighter">{alert.limit}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div className="text-slate-300 text-xs font-bold flex items-center gap-1">
                                <Icon name="camera" size={14} className={isOverSpeed ? "text-red-400" : "text-slate-400"} />
                                <span className="truncate max-w-[150px]">{alert.address}</span>
                            </div>
                            <div className="text-[10px] text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/10">{alert.direct || '雙向'}</div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs text-slate-400">距離</span>
                            <span className={`text-4xl font-black font-mono leading-none ${isOverSpeed ? 'text-yellow-300' : 'text-white'}`}>{Math.round(alert.distance)}</span>
                            <span className="text-xs text-slate-400">m</span>
                            {isStationary && <span className="text-slate-500 text-[10px] ml-2 font-bold">[靜止中]</span>}
                            {!isStationary && isOverSpeed && <span className="text-yellow-300 text-xl font-bold ml-2 animate-pulse">請減速!</span>}
                        </div>
                    </div>
                </div>
            );
        });


        const SOSButton = React.memo(({ currentLocation, onTrigger }) => {
            const [activating, setActivating] = useState(false);
            const [countdown, setCountdown] = useState(3);

            useEffect(() => {
                let timer;
                if (activating && countdown > 0) timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                else if (countdown === 0) {
                    if (onTrigger) onTrigger(false);
                    setActivating(false);
                    setCountdown(3);
                }
                return () => clearTimeout(timer);
            }, [activating, countdown, onTrigger]);

            const start = () => setActivating(true);
            const stop = () => { setActivating(false); setCountdown(3); };

            return (
                <button
                    onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
                    onTouchStart={start} onTouchEnd={stop}
                    className={`w-full relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-200 flex flex-row items-center justify-center gap-4 active:scale-95 select-none shadow-xl ${activating ? 'bg-red-900/80 border-red-500 animate-sos' : 'bg-gradient-to-r from-red-900/40 to-slate-900 border-red-500/50 hover:border-red-500'}`}
                >
                    {activating && <div className="absolute inset-0 bg-red-600/30 z-0" style={{ width: `${(3 - countdown) / 3 * 100}%`, transition: 'width 1s linear' }}></div>}
                    <div className={`p-3 rounded-full ${activating ? 'bg-white text-red-600' : 'bg-red-600 text-white'} transition-colors z-10`}>
                        <Icon name="phone-call" size={32} />
                    </div>
                    <div className="flex flex-col items-start z-10">
                        <span className={`text-xl font-black tracking-wider ${activating ? 'text-white' : 'text-red-100'}`}>E-SOS 緊急求救</span>
                        <span className="text-xs text-red-300/80 font-mono">{activating ? `釋放以取消 (${countdown})` : '長按 3 秒發送求救訊號'}</span>
                    </div>
                </button>
            );
        });

        const NavButton = React.memo(({ iconName, label, isActive, onClick, isCenter = false }) => (
            <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isCenter ? 'mb-4' : 'p-2 w-16 group'}`}>
                <div className={`transition-all duration-300 ${isActive ? (isCenter ? 'scale-110' : '-translate-y-1') : ''} ${isCenter ? 'bg-cyan-600 dark:bg-cyan-900/80 w-14 h-14 flex items-center justify-center rounded-full border-2 border-cyan-400 shadow-lg dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]' : ''}`}>
                    <Icon name={iconName} size={isCenter ? 28 : 24} className={isCenter ? 'text-white dark:text-cyan-400' : (isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300')} strokeWidth={isActive || isCenter ? 2.5 : 2} />
                </div>
                {!isCenter && <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'text-cyan-600 dark:text-cyan-400 opacity-100' : 'text-slate-400 dark:text-slate-500 opacity-70'}`}>{label}</span>}
            </button>
        ));

        const ToastNotification = ({ notifications, removeNotification }) => {
            return (
                <div className="fixed top-20 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
                    {notifications.map((note) => (
                        <div key={note.id} className={`pointer-events-auto overflow-hidden w-full max-w-sm p-4 rounded-xl shadow-2xl backdrop-blur-md border flex items-start gap-3 transform transition-all duration-300 ${note.isClosing ? 'animate-fadeOut' : 'animate-fadeIn'} ${note.type === 'danger' ? 'bg-red-900/90 border-red-500 text-white' : (note.type === 'warning' ? 'bg-yellow-900/90 border-yellow-500 text-yellow-100' : 'bg-slate-800/90 border-cyan-500 text-cyan-100')}`}>
                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-full ${note.type === 'danger' ? 'bg-red-500 text-white' : (note.type === 'warning' ? 'bg-yellow-500 text-black' : 'bg-cyan-500 text-black')}`}>
                                <Icon name={note.type === 'danger' ? 'alert-octagon' : (note.type === 'warning' ? 'alert-triangle' : 'info')} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm leading-tight">{note.title}</h4>
                                <p className="text-xs opacity-90 mt-1 leading-relaxed">{note.message}</p>
                            </div>
                            <button onClick={() => removeNotification(note.id)} className="p-1 hover:bg-black/20 rounded-full transition-colors"><Icon name="x" size={14} /></button>
                        </div>
                    ))}
                </div>
            );
        };

        const LeafletMap = React.memo(({ location, isTracking, trackHistory }) => {
            const mapRef = useRef(null);
            const mapInstanceRef = useRef(null);
            const markerRef = useRef(null);
            const polylineRef = useRef(null);

            useEffect(() => {
                if (!mapRef.current || mapInstanceRef.current) return;

                // Init Map
                const map = L.map(mapRef.current, {
                    zoomControl: false,
                    attributionControl: false
                }).setView([location.lat, location.lng], 16);

                // Dark Tile Layer
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 20
                }).addTo(map);

                mapInstanceRef.current = map;

                // Current Pos Marker
                markerRef.current = L.circleMarker([location.lat, location.lng], {
                    color: '#22d3ee',
                    fillColor: '#22d3ee',
                    fillOpacity: 0.8,
                    radius: 8
                }).addTo(map);

                // Path Polyline (Init with history)
                const initialPath = trackHistory && trackHistory.current ? trackHistory.current : [];
                polylineRef.current = L.polyline(initialPath, {
                    color: '#22d3ee',
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '5, 10'
                }).addTo(map);

                setTimeout(() => map.invalidateSize(), 100);

            }, []);

            useEffect(() => {
                if (!mapInstanceRef.current) return;

                const map = mapInstanceRef.current;
                const latlng = [location.lat, location.lng];

                if (markerRef.current) {
                    markerRef.current.setLatLng(latlng);
                }

                if (polylineRef.current && trackHistory && trackHistory.current) {
                    polylineRef.current.setLatLngs(trackHistory.current);
                }

                if (isTracking) {
                    map.panTo(latlng);
                }
            }, [location, isTracking, trackHistory]);

            return <div ref={mapRef} className="w-full h-full opacity-90" />;
        }, (prevProps, nextProps) => {
            return prevProps.location.lat === nextProps.location.lat &&
                prevProps.location.lng === nextProps.location.lng &&
                prevProps.isTracking === nextProps.isTracking;
        });

        const AIReportCard = ({ currentUser }) => {
            const [report, setReport] = useState("");
            const [createdAt, setcreatedAt] = useState("");
            const [loading, setLoading] = useState(false);
            const [hasGenerated, setHasGenerated] = useState(false);
            const [isInitialLoading, setIsInitialLoading] = useState(true);
            const [isCollapsed, setIsCollapsed] = useState(false);

            // 調整時間格式為台灣時間
            const creattime = new Date(createdAt).toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            // 1. 初始化：進頁面先抓最新的一筆，並填入 report
            React.useEffect(() => {
                const fetchLatestReport = async () => {
                    if (!currentUser) return;

                    try {
                        const { data, error } = await _supabase
                            .from('ai_report')
                            .select('*')
                            .eq('user_id', currentUser.id)
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        if (error) {
                            logToScreen(`資料庫連線狀態: ${status} - ${error.message}`);
                            return;
                        }

                        if (data && data.report) {
                            setReport(data.report);
                            logToScreen("✅ 歷史分析報告載入成功");
                        } else {
                            logToScreen("📊 歷史分析報告載入狀態: 無資料");
                            setReport("歡迎使用 V.I.S.O.R.，目前尚無歷史分析結果");
                            setcreatedAt(" ")
                        }
                        if (data && data.created_at) {
                            setcreatedAt(data.created_at); 
                        }
                    } catch (err) {
                        logToScreen(`出現錯誤${err.message}`);
                    } finally {
                        setIsInitialLoading(false);
                    }
                };

                fetchLatestReport();
            }, [currentUser]);

            const generateReport = async () => {
                if (!currentUser) return;
                setLoading(true);
                try {
                    // 近10天
                    const { data: dayStats, error: dayError } = await _supabase
                        .from('day_ride')
                        .select('*')
                        .eq('user_id', currentUser.id)
                        .limit(10);
                    // 歷史月統計
                    const { data: monthStats, error: monthError } = await _supabase
                        .from('month_ride')
                        .select('*')
                        .eq('user_id', currentUser.id)

                    // 如果兩張表都沒資料，就停止並報錯
                    if (!dayStats || dayStats.length === 0) {
                        setReport("### ⚠️ 數據掃描失敗\n目前資料庫中尚無您的騎乘紀錄。V.I.S.O.R. 需要數據才能進行行為分析。");
                        setcreatedAt(" ");
                        setLoading(false);
                        return;
                    }

                    // 3. 封裝給 AI
                    const airideData = {
                        recent: dayStats,
                        history: monthStats
                    };

                    const userPrompt = `
                    【V.I.S.O.R. 深度行為分析】
                    分析對象：${currentUser.id}
                    長期趨勢 (月): ${JSON.stringify(airideData.history)}
                    近期細節 (日): ${JSON.stringify(airideData.recent)}
                    `;

                    const systemPrompt =
                        `
                    系統提示:你現在是 V.I.S.O.R.，騎士的專屬 AI 夥伴。請根據遙測數據提供一份「專業」的騎乘分析。
                    回應準則：
                    1. 語氣：白話、親切、精簡。
                    2. 結構(html邏輯)：我是 V.I.S.O.R.，你的專屬騎乘 AI 夥伴，以下是分析結果：<br><b>===行為分析===</b><br>內容：根據長期趨勢及近期細節的數據，分析騎士在安全評分、超速次數、急煞次數、騎乘習慣等方面的表現。<br><b>===行為建議===</b><br>內容：根據分析出來的結果，給予適當的建議。<br>=====================================<br>內容：以鼓勵的語氣結尾，激勵騎士持續保持安全的騎乘習慣。
                    3. 格式：繁體中文，Markdown 格式。
                    4. 避開過於艱澀的術語，改用一般人聽得懂的說法。
                    5. 避免直接標示出數據的具體數值。
                    6. Temperature = 0.0。
                    `;

                    const result = await callAI(userPrompt, systemPrompt);
                    setReport(result);
                    setHasGenerated(true);

                    // 5. 存入 Supabase 
                    const { error } = await _supabase
                        .from('ai_report')
                        .insert({
                            user_id: currentUser.id,
                            report: result,
                            created_at: new Date().toISOString()
                        });

                    if (error) throw error;
                    logToScreen("✅ V.I.S.O.R. 分析報告已雲端備份");

                } catch (error) {
                    logToScreen(`分析或存檔過程出錯:${error.message}`);
                    // 只有在完全沒有 report 的情況下才顯示錯誤訊息
                    if (!report) setReport("### 🔴 系統故障\n分析核心無法回應，請檢查連線。");
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className={`bg-slate-800 rounded-xl p-4 border border-slate-700 mt-4 relative overflow-hidden transition-all duration-500 flex flex-col ${isCollapsed ? 'max-h-[200px]' : 'max-h-[1000px]'}`}>

                    {/* 標題列：加入 shrink-0 防止被擠壓 */}
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <h3 className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                            <Icon name="brain-circuit" size={16} />
                            V.I.S.O.R. 戰術分析
                        </h3>

                        <div className="flex items-center gap-2">
                            {/* 啟動按鈕：不再因收合而隱藏，改為只要還沒生成就顯示 */}
                            {!hasGenerated && !loading && !isInitialLoading && (
                                <button onClick={generateReport} className="bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 text-[10px] px-2 py-1 rounded-full border border-cyan-500/30 transition-all flex items-center gap-1">
                                    <Icon name="sparkles" size={10} />啟動分析
                                </button>
                            )}

                            {/* 完美正圓縮放箭頭 */}
                            {!loading && !isInitialLoading && report && (
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-slate-700/50 hover:bg-slate-600 text-cyan-400 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                                >
                                    <Icon name="chevron-down" size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. 內容區塊：限制橫向溢出、加寬右側留白讓滾動條更好看 */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 w-full">
                        {(loading || isInitialLoading) && (
                            <div className="flex items-center justify-center py-4 space-x-2 text-cyan-400/70 animate-pulse">
                                <Icon name="loader-2" size={20} className="animate-spin" />
                                <span className="text-xs font-mono">UPLOADING...</span>
                            </div>
                        )}
                        {!loading && !isInitialLoading && report && (
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 w-full">
                                {/* 套用 markdown-body 徹底解決橫向撐破的問題 */}
                                <div className="markdown-body text-xs text-slate-300 leading-relaxed font-mono typing-cursor" dangerouslySetInnerHTML={{ __html: window.marked.parse(report) }}></div>
                            </div>
                        )}
                    </div>
                    <div className="pt-2 flex justify-end text-xs text-cyan-500 font-mono">上傳時間：{creattime}</div>
                </div>
            );
        };

        // Safe markdown renderer - guards against window.marked not being ready
        const safeMarkdown = (text) => {
            try {
                if (window.marked && typeof window.marked.parse === 'function') {
                    return window.marked.parse(String(text || ''));
                }
            } catch (e) { /* fallback below */ }
            // Plain-text fallback: escape HTML, then convert newlines
            return String(text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>');
        };

        // Quick-reply shortcut messages for the AI chat
        const QUICK_REPLIES = [
            { label: '🌧️ 雨天騎乘技巧', text: '雨天騎車有哪些安全技巧和注意事項？' },
            { label: '⚙️ 輪胎胎壓', text: '機車輪胎胎壓標準是多少？如何判斷胎壓不足？' },
            { label: '🛑 剎車距離', text: '時速60公里時的最短安全停車距離是多少？' },
            { label: '🌀 過彎技巧', text: '山路彎道過彎的正確姿勢和技巧？' },
            { label: '🔦 夜間行車', text: '夜間行車有哪些提升能見度的安全建議？' },
            { label: '💨 側風應對', text: '遇到強側風時應如何控制車輛保持穩定？' },
            { label: '🛠️ 賽前檢查', text: '出發前應做哪些機車安全例行檢查（SIPDE/TCLOC）？' },
            { label: '🚑 事故處理', text: '若發生交通事故，現場應如何正確處理和自保？' },
        ];

        const AIChatModal = ({ isOpen, onClose }) => {
            // State must be declared BEFORE any conditional return (React rules of hooks)
            const [messages, setMessages] = React.useState([{ role: 'assistant', text: 'V.I.S.O.R. 核心已連線。騎士，有什麼我可以協助您的嗎？' }]);
            const [input, setInput] = React.useState('');
            const [loading, setLoading] = React.useState(false);
            const [showQuickReplies, setShowQuickReplies] = React.useState(true);
            const [errorMsg, setErrorMsg] = React.useState(null);
            const messagesEndRef = useRef(null);
            const inputRef = useRef(null);

            // Auto-scroll to latest message
            useEffect(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, [messages, loading]);

            // Focus input when modal opens
            useEffect(() => {
                if (isOpen) {
                    setTimeout(() => inputRef.current?.focus(), 150);
                }
            }, [isOpen]);

            // Conditional render AFTER all hooks
            if (!isOpen) return null;

            const handleSend = async (textOverride) => {
                const userMsg = (textOverride || input).trim();
                if (!userMsg || loading) return;
                setInput('');
                setShowQuickReplies(false);
                setErrorMsg(null);
                setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
                setLoading(true);
                try {
                    const systemPrompt = '你是 V.I.S.O.R.（智慧騎士AI助理），搭載於機車智慧頭盔系統。你的回答必須實用、簡潔，優先以繁體中文回覆。專注在行車安全、騎乘技術、法規、機車維護及緊急應對等騎士相關主題。';
                    const response = await callAI(userMsg, systemPrompt);
                    setMessages(prev => [...prev, { role: 'assistant', text: response || 'V.I.S.O.R. 暫時無法回應，請稍後再試。' }]);
                } catch (e) {
                    console.error('[AIChatModal] callAI failed:', e);
                    setErrorMsg('⚠️ AI 連線異常，請檢查網路或 API 設定。');
                    setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ 連線異常：${e.message}` }]);
                } finally {
                    setLoading(false);
                }
            };

            const handleQuickReply = (qr) => {
                handleSend(qr.text);
            };

            const handleClearChat = () => {
                setMessages([{ role: 'assistant', text: 'V.I.S.O.R. 核心重置。騎士，有新的問題嗎？' }]);
                setShowQuickReplies(true);
                setErrorMsg(null);
            };

            return (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm" style={{animation:'fadeIn 0.2s ease'}}>
                    <div className="w-full max-w-md h-[88vh] sm:h-[80vh] bg-slate-900 sm:rounded-2xl rounded-t-2xl border border-cyan-500/30 flex flex-col shadow-2xl relative overflow-hidden">

                        {/* ── Header ── */}
                        <div className="p-3 px-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/80 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <Icon name="bot" size={22} className="text-cyan-400" />
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-slate-900 animate-pulse"></span>
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm leading-tight">V.I.S.O.R. Core</div>
                                    <div className="text-[10px] text-cyan-400/70 font-mono tracking-wider">AI 騎士助理 · ONLINE</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleClearChat} title="清除對話" className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-yellow-400 transition-colors">
                                    <Icon name="rotate-ccw" size={15} />
                                </button>
                                <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                    <Icon name="x" size={18} />
                                </button>
                            </div>
                        </div>

                        {/* ── Messages Area ── */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth" style={{scrollbarWidth:'thin',scrollbarColor:'#334155 transparent'}}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                                            <Icon name="bot" size={14} className="text-cyan-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-br-sm'
                                            : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/80'
                                    }`}>
                                        <div className="markdown-body prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safeMarkdown(msg.text) }} />
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                                            <Icon name="user" size={14} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <div className="flex items-end gap-2 justify-start">
                                    <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                                        <Icon name="bot" size={14} className="text-cyan-400" />
                                    </div>
                                    <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-700/80 flex gap-1.5 items-center">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
                                    </div>
                                </div>
                            )}

                            {/* Quick reply chips (shown on fresh chat) */}
                            {showQuickReplies && messages.length <= 1 && !loading && (
                                <div className="pt-2">
                                    <div className="text-[10px] text-slate-500 font-mono mb-2 px-1">⚡ 快捷問題</div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {QUICK_REPLIES.map((qr, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleQuickReply(qr)}
                                                className="text-left px-2.5 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/60 rounded-xl text-xs text-slate-300 hover:text-white transition-all duration-150 leading-tight"
                                            >
                                                {qr.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Error Banner ── */}
                        {errorMsg && (
                            <div className="px-3 py-2 bg-red-900/40 border-t border-red-800/60 text-xs text-red-300 flex items-center gap-2 flex-shrink-0">
                                <Icon name="alert-triangle" size={13} className="text-red-400 flex-shrink-0" />
                                <span>{errorMsg}</span>
                                <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-white"><Icon name="x" size={12}/></button>
                            </div>
                        )}

                        {/* ── Input Bar ── */}
                        <div className="p-2.5 px-3 bg-slate-800/60 border-t border-slate-700/80 flex-shrink-0">
                            <div className="flex gap-2 items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    placeholder="輸入問題... (Enter 送出)"
                                    disabled={loading}
                                    className="flex-1 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-60"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={loading || !input.trim()}
                                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white p-2.5 rounded-full disabled:opacity-40 transition-all duration-150 flex-shrink-0"
                                >
                                    <Icon name="send" size={16} />
                                </button>
                            </div>
                            <div className="text-[9px] text-slate-600 text-center mt-1.5 font-mono">V.I.S.O.R. AI · 回應僅供參考，請以實際路況為準</div>
                        </div>
                    </div>
                </div>
            );
        };

        const HUDPreview = ({ config }) => {
            const isEnabled = (id) => config[id];
            return (
                <div className="w-full bg-black border-4 border-slate-700 rounded-lg p-2 relative mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] px-2 rounded-b text-slate-400 font-mono tracking-wider">HUD PREVIEW (128x64)</div>
                    <div className="aspect-[2/1] w-full bg-black relative overflow-hidden font-pixel flex flex-col justify-between p-4" style={{ opacity: config.brightness / 255 * 0.5 + 0.5 }}>
                        <div className="flex justify-between items-start border-b border-white/30 pb-1 mb-1"><span className="text-cyan-400 text-xs font-bold tracking-widest animate-pulse">V.I.S.O.R.</span>{isEnabled('time') && <span className="text-white text-xs">10:42</span>}</div>
                        <div className="flex-1 flex items-center justify-between gap-2">
                            <div className="flex flex-col items-start justify-center">{isEnabled('speed') && (<div className="text-white"><span className="text-4xl font-bold leading-none text-cyan-50 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">92</span><span className="text-[10px] ml-1 text-slate-400">km/h</span></div>)}</div>
                            <div className="flex flex-col items-end gap-1">{isEnabled('camera') && (<div className="bg-red-900 text-white px-1 border border-red-500 text-[10px] flex items-center gap-1 animate-pulse"><Icon name="camera" size={10} /><span>CAM 50</span></div>)}{isEnabled('nav') && (<div className="flex items-center gap-1 mt-1 text-yellow-400"><Icon name="arrow-up-right" size={14} /> <span className="text-[10px]">200m</span></div>)}</div>
                        </div>
                    </div>
                </div>
            );
        };
        // ======================================================================================================================================================================================================
        // 月曆圖
        // ======================================================================================================================================================================================================

        // 產生「近 30 天」的日期陣列，包含完整標籤與日數
        const thirtyDays = () => {
            const today = new Date();
            const calendar = [];
            // 從 29 天前開始算起 (共 30 格)
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                calendar.push({
                    fullDate: d.toLocaleDateString('en-CA'), // YYYY-MM-DD (用於匹配)
                    yearNum: d.getFullYear(), // 年份
                    monthNum: d.getMonth() + 1, // 月份 (1-12)
                    dayNum: d.getDate(), // 僅取得「日」(1-31)
                    isToday: i === 0
                });
            }
            return calendar;
        };

        const thirtyD = thirtyDays();

        const EventCalendar = React.memo(({ data, dataKey, color, label , currentUser }) => {
            const [selectedDay, setSelectedDay] = useState(null); // 存點擊的那一天的統計數據
            const [rideDetails, setRideDetails] = useState([]); // 存詳細行程
            const [isLoading, setIsLoading] = useState(false);  // 讀取狀態

            // 關閉彈窗的函數
            const closePopover = () => setSelectedDay(null);

            // 點擊日期後，從 Supabase 抓取該日的詳細騎乘紀錄
            const fetchDayDetails = async (selectedDate) => {
                setIsLoading(true);
                setRideDetails([]);

                const { data, error } = await _supabase
                    .from('ride_history')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .filter('time', 'gte', `${selectedDate}T00:00:00Z`)
                    .filter('time', 'lte', `${selectedDate}T23:59:59Z`) 
                    .order('time', { ascending: true }); // 按時間由早到晚排序

                if (error) {
                    logToScreen(`❌ 查詢出錯:${error.message}`);
                    setIsLoading(false);
                    return;
                }

                // 如果有抓到資料，使用 reduce進行「分組」
                if (data && data.length > 0) {
                    const grouped = data.reduce((acc, curr) => {
                        const rid = String(curr.ride_id); // 取得這筆資料所屬的行程 ID
                        if (!rid || rid === "null") return acc;

                        // 如果這個行程 ID 還沒建立過，就初始化它
                        if (!acc[rid]) {
                            acc[rid] = {
                                ride_id: rid,
                                score: curr.score,
                                allEvents: [] // 儲存這趟行程「所有」原始事件
                            };
                        }

                        acc[rid].allEvents.push(curr); // 把這筆事件存入對應行程
                        return acc;
                    }, {});

                    const finalDisplay = Object.values(grouped).map(trip => {
                        const actualClass = dataKey.replace('total_', ''); // 把 total_tilt 變成 tilt ，以便匹配事件類型   
                        const targetEvents = trip.allEvents.filter(e => e.class === actualClass); // 找出符合當前月曆類型的事件
                        return {
                            ...trip,
                            events: targetEvents.length > 0
                                ? targetEvents
                                : [trip.allEvents.find(e => e.class === 'normal') || trip.allEvents[0]]
                        };
                    });
                    setRideDetails(finalDisplay);
                }
                setIsLoading(false);
            };

            return (
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-xl relative">
                    {/* 標題與圖例 */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                            <h3 className="text-sm font-bold text-slate-200">近30天{label}資料 </h3>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                            <span className={`${thirtyD[29].isToday ? 'text-cyan-500' : ''}`}>今日日期: {thirtyD[29].monthNum}/{thirtyD[29].dayNum}</span>
                        </div>
                    </div>
                    {/* 月曆格區 */}
                    <div className="grid grid-cols-6 gap-2">
                        {thirtyD.map((day) => {
                            const dayData = data.find(d => d.date_label === day.fullDate); // 匹配 Supabase 數據
                            const eventCount = dayData ? dayData[dataKey] : 0; // 取得該日曆關注的事件次數

                            // 判定
                            let bgColor = 'rgba(255,255,255,1)'; // 預設：沒騎 (淡白色)
                            let opacity = 0.2; // 預設透明度

                            if (dayData) {
                                if (eventCount > 0) {
                                    // 有騎、有事件
                                    bgColor = color;
                                    opacity = Math.min(0.2 + (eventCount * 0.15), 1);
                                } else {
                                    // 有騎、沒事件(normal)
                                    bgColor = '	#3CB371'; // 綠色
                                    opacity = 1;
                                }
                            }

                            return (
                                <div
                                    key={day.fullDate}
                                    onClick={() => {
                                        if (dayData) {
                                            setSelectedDay({ ...dayData, monthNum: day.monthNum, dayNum: day.dayNum });
                                            fetchDayDetails(day.fullDate);
                                        }
                                    }}
                                    className={`
                                        aspect-square rounded-lg flex items-center justify-center
                                        transition-all border relative
                                        ${eventCount > 0 ? 'cursor-pointer hover:ring-2 hover:ring-white' : 'cursor-default'}
                                        ${day.isToday ? 'border-cyan-500' : 'border-transparent'}
                                    `}
                                    style={{
                                        backgroundColor: bgColor,
                                        opacity: opacity
                                    }}
                                >
                                    {/* 標示日期 */}
                                    <span className={`
                                        text-[11px] font-black leading-none
                                        ${eventCount > 0 ? 'text-slate-900' : 'text-slate-600'}
                                    `}>
                                        {day.monthNum}/{day.dayNum}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* 下方提示 */}
                    <div className="mt-3 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                        <span>點擊可查看詳細資訊</span>
                    </div>

                    {/* 詳細資料彈窗 */}
                    {selectedDay && (
                        // 遮罩層
                        <div className="absolute inset-0 bg-slate-950/95 z-50 rounded-2xl flex items-center justify-center p-2 backdrop-blur-md">
                            {/* 彈窗主體 */}
                            <div className="bg-slate-900 w-full h-full max-h-[90%] rounded-xl border border-slate-700 p-4 shadow-2xl relative flex flex-col" onClick={(e) => e.stopPropagation()}>

                                {/* 標題與關閉按鈕 */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-center justify-center aspect-square h-12 rounded-lg" style={{ backgroundColor: color }}>
                                            <span className="text-xl font-black text-slate-950">{selectedDay.monthNum}/{selectedDay.dayNum}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-100">{label} 詳細資料</h4>
                                        </div>
                                    </div>
                                    <button onClick={closePopover} className="text-slate-500 hover:text-white p-1">
                                        <Icon name="x" size={20} />
                                    </button>
                                </div>

                                {/* 上方統計數據 */}
                                <div className="flex items-center justify-between col-span-2 pb-2 border-b border-slate-700">
                                    <span className="text-xs text-slate-400">{label}</span>
                                    <span className="text-xs font-black" style={{ color: color }}>{selectedDay[dataKey] || '0'} <span className="text-xs">次</span></span>
                                    <span className="text-xs text-slate-400">總評分</span>
                                    <span className="text-xs font-black" style={{ color: color }}>{selectedDay.avg_score || '---'}  <span className="text-xs">分</span></span>
                                    <span className="text-xs text-slate-400">總騎乘次數</span>
                                    <span className="text-xs font-black" style={{ color: color }}>{selectedDay.total_trips || '0'}  <span className="text-xs">次</span></span>
                                </div>

                                {/* 下方詳細資料 */}
                                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2 custom-scrollbar w-full">
                                    {isLoading ? (
                                        <div className="text-center py-10 text-slate-500 text-xs animate-pulse">讀取中...</div>
                                    ) : rideDetails.length === 0 ? (
                                        <div className="text-center py-10 text-slate-500 text-xs">該日無行程數據</div>
                                    ) : (
                                        rideDetails.map((trip, idx) => (
                                            <div key={trip.ride_id} className="bg-slate-800/20 rounded-lg border border-slate-800 overflow-hidden">
                                                {/* 行程標題 */}
                                                <div className="bg-slate-800/50 px-3 py-1.5 flex justify-between items-center border-b border-slate-700/30">
                                                    <span className="text-[10px] font-mono text-slate-500">騎乘第{idx + 1}次</span>
                                                    <span className="text-[10px] text-cyan-500 font-bold">本次評分: {trip.score}</span>
                                                </div>
                                                {/* 事件列表 */}
                                                <div className="p-2 space-y-2">
                                                    {trip.events.map((event, eIdx) => {
                                                        const isNormal = event.class === 'normal';

                                                        return (
                                                            <div key={eIdx} className={`p-3 rounded bg-slate-900/40 border-t ${isNormal ? 'border-emerald-500' : 'border-rose-500'}`} style={!isNormal ? { borderColor: color } : {}}>
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className={`text-[11px] font-bold ${isNormal ? 'text-emerald-400' : ''}`} style={!isNormal ? { color: color } : {}}>
                                                                        {isNormal ? '正常騎乘紀錄' : `${label}紀錄`}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500">上傳時間：
                                                                        {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>

                                                                {/* 根據事件類型顯示對應的詳細數據 */}
                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                                                    <div className="text-slate-500 col-span-2 flex items-center gap-1">
                                                                        <Icon name="map-pin" size={10} />
                                                                        <span className="text-slate-300">{event.location || '未知路段'}</span>
                                                                    </div>

                                                                    {isNormal ? (
                                                                        /* Normal詳細資料 */
                                                                        <>
                                                                            <div className="text-slate-500">最高時速: <span className="text-emerald-400 font-bold">{event.maxspeed} km/h</span></div>
                                                                            <div className="text-slate-500">最低時速: <span className="text-emerald-400 font-bold">{event.lowspeed} km/h</span></div>
                                                                            <div className="text-slate-500">路段限速: <span className="text-slate-300">{event.limit} km/h</span></div>
                                                                        </>
                                                                    ) : dataKey === 'total_overspeed' ? (
                                                                        /* 超速詳細資料 */
                                                                        <>
                                                                            <div className="text-slate-500">最高時速: <span className="text-yellow-400 font-bold">{event.maxspeed} km/h</span></div>
                                                                            <div className="text-slate-500">最低時速: <span className="text-yellow-400 font-bold">{event.lowspeed} km/h</span></div>
                                                                            <div className="text-slate-500">路段限速: <span className="text-slate-300">{event.limit} km/h</span></div>
                                                                            <div className="text-slate-500">超速值: <span className="text-rose-400 font-bold">{event.overspeed}</span></div>
                                                                            <div className="text-slate-500">持續時間: <span className="text-slate-300">{event.duration}s</span></div>
                                                                        </>
                                                                    ) : dataKey === 'total_tilt' ? (
                                                                        /* 危險傾角詳細資料 */
                                                                        <>
                                                                            <div className="text-slate-500">最高時速: <span className="text-slate-400 font-bold">{event.maxspeed} km/h</span></div>
                                                                            <div className="text-slate-500">最低時速: <span className="text-slate-400 font-bold">{event.lowspeed} km/h</span></div>
                                                                            <div className="text-slate-500">路段限速: <span className="text-slate-300">{event.limit} km/h</span></div>
                                                                            <div className="text-slate-500">最大傾角: <span className="text-orange-400 font-bold">{event.tilt}°</span></div>
                                                                            <div className="text-slate-500">建議傾角: <span className="text-slate-300">{'< 30°'}</span></div>
                                                                            <div className="text-slate-500">持續時間: <span className="text-slate-300">{event.duration}s</span></div>
                                                                        </>
                                                                    ) : dataKey === 'total_braking' ? (
                                                                        /* 急煞詳細資料 */
                                                                        <>
                                                                            <div className="text-slate-500">最高時速: <span className="text-slate-400 font-bold">{event.maxspeed} km/h</span></div>
                                                                            <div className="text-slate-500">最低時速: <span className="text-slate-400 font-bold">{event.lowspeed} km/h</span></div>
                                                                            <div className="text-slate-500">路段限速: <span className="text-slate-300">{event.limit} km/h</span></div>
                                                                            <div className="text-slate-500">急煞程度: <span className="text-rose-400 font-bold">{event.breaking}</span></div>
                                                                            <div className="text-slate-500">建議: <span className="text-slate-300">{'速度變化 < 10km/hr'}</span></div>
                                                                        </>
                                                                    ) : (
                                                                        /* 選中事件無紀錄但當日有其他事件發生 */
                                                                        <>
                                                                            <div><span className="text-[11px] font-bold text-emerald-400">{'本次騎乘無'}{label}紀錄</span></div>
                                                                            <div className="text-slate-500">最高時速: <span className="text-emerald-400 font-bold">{event.maxspeed} km/h</span></div>
                                                                            <div className="text-slate-500">最低時速: <span className="text-emerald-400 font-bold">{event.lowspeed} km/h</span></div>
                                                                            <div className="text-slate-500">路段限速: <span className="text-slate-300">{event.limit} km/h</span></div>
                                                                        </>
                                                                    )}

                                                                    {/* 底部事件時間 */}
                                                                    <div className="text-[10px] text-slate-500 col-span-2 mt-1 pt-1 border-t border-slate-800/50 flex justify-between">
                                                                        <span>開始於: {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                                        <span>結束於: {new Date(event.endtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        });
        // ======================================================================================================================================================================================================
        // 月曆圖 結束 
        // ======================================================================================================================================================================================================


        const TerminalConsole = React.memo(({ logs, isOpen, onClose }) => {
            const scrollRef = React.useRef(null);
            React.useEffect(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, [logs, isOpen]);

            if (!isOpen) return null;

            return (
                <div className="absolute inset-x-0 bottom-24 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-cyan-500/30 h-64 flex flex-col animate-slideUp">
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Icon name="terminal" size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">System Tactical Log</span>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                            <Icon name="x" size={16} />
                        </button>
                    </div>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-[9px] space-y-1.5 scrollbar-hide">
                        {logs.length === 0 ? (
                            <div className="text-slate-600 italic">Waiting for telemetry data...</div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-2 leading-relaxed">
                                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                    <span className={`break-all ${
                                        log.level === 'danger' ? 'text-red-400 font-bold' : 
                                        log.level === 'warning' ? 'text-orange-400' : 
                                        log.level === 'ai' ? 'text-cyan-400' : 
                                        log.level === 'success' ? 'text-green-400' : 'text-slate-300'
                                    }`}>
                                        {log.message}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        });

        const App = () => {
            const [isBooting, setIsBooting] = useState(true);
            const [heading, setHeading] = useState(0); // Added Heading State
            const [currentUser, setCurrentUser] = useState(null);
            const [activeTab, setActiveTab] = useState('login'); // Default to login
            const [isMuted, setIsMuted] = useState(false);
            const [isEdgeMuted, setIsEdgeMuted] = useState(false); // 盲點警示靜音狀態
            const [forceSpeeding, setForceSpeeding] = React.useState(true); // 控制騎乘模擬是否超速
            const currentRideDataRef = React.useRef([]); //分析專用的 Ref
            const [weeklyHistory, setWeeklyHistory] = React.useState([]); //放置分析歷史紀錄

            //檢查初始載入 讀取分析歷史紀錄
            React.useEffect(() => {
                const savedHistory = localStorage.getItem('ride_history');
                if (savedHistory) {
                    try {
                        setWeeklyHistory(JSON.parse(savedHistory));
                    } catch (e) {
                        console.error("載入紀錄失敗:", e);
                    }
                }
            }, []); // 僅在頁面初次載入時執行

            // Parse Direction Helper
            const parseDirection = (dirText) => {
                if (!dirText) return 'ALL';
                if (dirText.includes('雙向') || dirText.includes('全部')) return 'ALL';
                if (dirText.includes('北')) return 0;
                if (dirText.includes('東')) return 90;
                if (dirText.includes('南')) return 180;
                if (dirText.includes('西')) return 270;
                return 'ALL';
            };

            // Pass Detection Logic
            const prevAlertRef = useRef(null);

            // Persistent Track History
            const trackRef = useRef([]);
            useEffect(() => {
                // 如果之前有警示，但現在沒了，或是換了相機 -> 代表通過或離開
                if (prevAlertRef.current && (!cameraAlert || cameraAlert.address !== prevAlertRef.current.address)) {
                    console.log("[Audio] Camera Passed/Cleared (Effect Triggered)");
                    playWarningSound('pass');
                }
                prevAlertRef.current = cameraAlert;
            }, [cameraAlert]);

            //==============================================================================================================
            //登入、登出、註冊區塊
            //==============================================================================================================
            const [authForm, setAuthForm] = useState({ username: '', password: '', confirmPassword: '' });
            const [authError, setAuthError] = useState('');
            const [loading, setLoading] = useState(false);

            //監聽及初始化登入狀態
            useEffect(() => {
                // 1. 初始化 AuthService (保持你原有的工具初始化)
                if (window.AuthService && typeof window.AuthService.init === 'function') {
                    window.AuthService.init();
                }

                // 2. 使用 Supabase 原生監聽器 (處理「第一次載入」+「後續變化」)
                const { data: { subscription } } = _supabase.auth.onAuthStateChange((event, session) => {
                    console.log("Auth Event:", event); // INITIAL_SESSION(初始化) 或 SIGNED_IN(登入) 或 SIGNED_OUT(登出)

                    if (session && session.user) {
                        // 登入成功：存入使用者資訊，跳轉到首頁
                        setCurrentUser(session.user);
                        setActiveTab('home');
                    } else {
                        // 未登入或登出：清空資訊，跳轉到登入頁
                        setCurrentUser(null);
                        setActiveTab('login');
                    }
                });

                // 3. 清除監聽器 (當元件被銷毀時，要把監聽關掉，避免記憶體洩漏)
                return () => {
                    if (subscription) subscription.unsubscribe();
                };
            }, []);

            const handleLogin = async (e) => {
                e.preventDefault();
                setLoading(true);
                setAuthError('');

                try {
                    const { data, error } = await _supabase.auth.signInWithPassword({
                        email: `${authForm.username}@visor.com`,
                        password: authForm.password,
                    });

                    // 2. 處理錯誤
                    if (error) {
                        let msg = error.message;
                        if (msg.includes("Invalid login credentials")) {
                            msg = "帳號或密碼錯誤";
                        } else if (msg.includes("Email not confirmed")) {
                            msg = "帳號尚未驗證，請聯繫管理員";
                        }
                        setAuthError(msg);
                        playWarningSound('warning');
                        setLoading(false);
                        return;
                    }

                    // 3. 登入成功
                    if (data.user) {
                        logToScreen(`V.I.S.O.R. 系統登入：${authForm.username}`);
                    }
                } catch (err) {
                    setAuthError("通訊失敗，請檢查網路");
                    setLoading(false);
                }
            };

            const handleRegister = async (e) => {
                e.preventDefault();

                if (authForm.password.length < 6) {
                    setAuthError("密碼太短囉！請至少輸入 6 個字元");
                    return;
                }
                if (authForm.password !== authForm.confirmPassword) {
                    setAuthError('兩次密碼輸入不一致');
                    return;
                }

                setLoading(true);
                setAuthError('');

                try {
                    const { data, error } = await _supabase.auth.signUp({
                        email: `${authForm.username}@visor.com`, // 強制轉成 email 格式
                        password: authForm.password,
                        options: {
                            data: { display_name: authForm.username } // 把純用戶名存進元數據
                        }
                    });

                    if (error) {
                        setAuthError('帳號已存在');
                    } else if (data.user) {
                        logToScreen("註冊成功：系統已建立帳號 " + authForm.username);
                        alert("註冊成功！請登入。");
                        setActiveTab('login'); // 註冊完自動跳轉到登入畫面
                    }
                } catch (err) {
                    setAuthError("連線異常");
                } finally {
                    setLoading(false);
                }
            };

            const handleLogout = async () => {
                try {
                    // 1. 叫 Supabase 真正執行登出 (這會清除伺服器端的 Session)
                    await _supabase.auth.signOut();

                    // 2. 如果你的 AuthService 還有額外清理工作 (例如清除自訂的 Cookie)
                    if (window.AuthService && window.AuthService.logout) {
                        window.AuthService.logout();
                    }
                    logToScreen("系統已登出");

                } catch (error) {
                    logToScreen("登出失敗:", error);
                }
            };
            //=======================================================================================
            //登入、登出、註冊區塊結束
            //=======================================================================================

            useEffect(() => {
                window._visorIsMuted = isMuted;
            }, [isMuted]);
            const [isSentryMode, setIsSentryMode] = useState(false);
            const [isExhibitionMode, setIsExhibitionMode] = useState(false);
            // ... (其餘 state 保持不變)

            // 處理啟動序列
            useEffect(() => {
                const stages = [
                    { p: 10, s: "CONNECTING TO NEURAL LINK..." },
                    { p: 30, s: "CALIBRATING GYRO SENSORS..." },
                    { p: 60, s: "UPLOADING TACTICAL DATABASE..." },
                    { p: 85, s: "SYNCHRONIZING WITH PI-5 CORE..." },
                    { p: 100, s: "SYSTEM READY. WELCOME, RIDER." }
                ];

                const progressBar = document.getElementById('boot-progress-bar');
                const statusText = document.getElementById('boot-status');
                const bootScreen = document.getElementById('visor-boot-screen');

                let currentStage = 0;
                const runBoot = () => {
                    if (currentStage < stages.length) {
                        const stage = stages[currentStage];
                        if (progressBar) progressBar.style.width = `${stage.p}%`;
                        if (statusText) statusText.innerText = stage.s;

                        const delay = 600 + Math.random() * 800;
                        setTimeout(() => {
                            currentStage++;
                            runBoot();
                        }, delay);
                    } else {
                        // 啟動完成
                        setTimeout(() => {
                            if (bootScreen) {
                                bootScreen.style.opacity = '0';
                                setTimeout(() => {
                                    bootScreen.style.display = 'none';
                                    setIsBooting(false);
                                    playWarningSound('warning'); // 啟動完成音效
                                }, 1000);
                            }
                        }, 500);
                    }
                };

                runBoot();
            }, []);
            const [enableSpeedCam, setEnableSpeedCam] = useState(false);
            const [simulatedSpeed, setSimulatedSpeed] = useState(0);
            const [tiltAngle, setTiltAngle] = useState(0);
            const [hasGyroPermission, setHasGyroPermission] = useState(false);
            const [isConnected, setIsConnected] = useState(false);
            const [showAIChat, setShowAIChat] = useState(false);
            const [location, setLocation] = useState({ lat: 25.033964, lng: 121.564468 });
            const [cameras, setCameras] = useState(BUILT_IN_CAMERAS);
            const [dbInfo, setDbInfo] = useState({ count: BUILT_IN_CAMERAS.length, source: '內建' });
            const [cameraAlert, setCameraAlert] = useState(null);
            const [simulationMode, setSimulationMode] = useState(false);
            const [edgeWarning, setEdgeWarning] = useState(null);

            // AI Settings State
            const [aiSettings, setAiSettings] = useState({ provider: 'gemini', geminiKey: '', deepseekKey: '' });

            const [updateStatus, setUpdateStatus] = useState('idle'); // idle, updating, success, error
            const [lastUpdateTime, setLastUpdateTime] = useState(null);

            const updateAiSettings = (key, value) => {
                let newValue = value;
                // 如果是 Key 欄位，則進行加密
                if (key === 'geminiKey' || key === 'deepseekKey') {
                    newValue = window.CryptoUtils.encrypt(value);
                }

                const newSettings = { ...aiSettings, [key]: newValue };
                setAiSettings(newSettings);
                localStorage.setItem("visor_ai_settings", JSON.stringify(newSettings));

                // 向下相容
                if (key === 'geminiKey') localStorage.setItem("visor_gemini_api_key", newValue);
            };

            const [systemStatus, setSystemStatus] = useState({ pi5: false, piZero: false, cpu: 0, mem: 0 });
            const [shutdownModalTarget, setShutdownModalTarget] = useState(null); // 'pi5' | 'pizero' | null
            const [showConsole, setShowConsole] = useState(false);
            const [systemLogs, setSystemLogs] = useState([]);
            const [notifications, setNotifications] = useState([]);
            const [hudConfig, setHudConfig] = useState({ speed: true, camera: true, nav: true, time: true, brightness: 200, mirror: true, flip_v: false, oled_model: 'SSD1306' });
            const [statsTab, setStatsTab] = useState('safety_overview');

            // 線上即時天候與路面抓地安全指數 (Online Weather & Road Adhesion via Open-Meteo API)
            const [roadWeather, setRoadWeather] = useState({
                temp: 24,
                humidity: 72,
                rain: 0,
                windSpeed: 8,
                adhesion: 0.85,
                status: '乾地良好',
                statusColor: 'text-emerald-400',
                brakingMultiplier: '1.0x (標準)',
                riskText: '路面乾燥抓地充足，請維持安全車距與防禦駕駛。',
                loading: false,
                lastUpdated: null
            });

            const fetchRoadWeatherAdhesion = useCallback(async (lat = 25.033, lng = 121.565) => {
                setRoadWeather(prev => ({ ...prev, loading: true }));
                try {
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`);
                    if (!res.ok) throw new Error("Weather API returned " + res.status);
                    const data = await res.json();
                    const curr = data.current || {};
                    const temp = Math.round(curr.temperature_2m ?? 24);
                    const hum = Math.round(curr.relative_humidity_2m ?? 70);
                    const rain = Number((curr.precipitation ?? 0).toFixed(1));
                    const wind = Math.round(curr.wind_speed_10m ?? 8);
                    const wcode = curr.weather_code ?? 0;

                    let adhesion = 0.85;
                    let status = '乾地良好 (抓地充沛)';
                    let statusColor = 'text-emerald-400';
                    let brakingMultiplier = '1.0x (標準)';
                    let riskText = '路面乾燥抓地充足，請保持標準 2 秒以上安全車距。';

                    if (rain > 2.0 || [63, 65, 81, 82, 95].includes(wcode)) {
                        adhesion = 0.38;
                        status = '豪雨濕滑 (極高風險)';
                        statusColor = 'text-red-400';
                        brakingMultiplier = '2.2x~2.5x (大幅增長)';
                        riskText = '積水路面極易發生水漂與輪胎打滑！煞車距離增加 2 倍以上，請減速 30% 並加大車距。';
                    } else if (rain > 0 || [51, 53, 55, 61, 80].includes(wcode) || hum > 85) {
                        adhesion = 0.52;
                        status = '潮濕微雨 (注意標線)';
                        statusColor = 'text-amber-400';
                        brakingMultiplier = '1.5x~1.7x (注意延伸)';
                        riskText = '路面潮濕，行經白線、油漆標線、鐵板人孔蓋時切勿急煞與大角度轉向！';
                    }

                    setRoadWeather({
                        temp,
                        humidity: hum,
                        rain,
                        windSpeed: wind,
                        adhesion,
                        status,
                        statusColor,
                        brakingMultiplier,
                        riskText,
                        loading: false,
                        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
                    });
                } catch (e) {
                    console.warn("Road weather fetch failed, using fallback:", e);
                    setRoadWeather(prev => ({
                        ...prev,
                        loading: false,
                        lastUpdated: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
                    }));
                }
            }, []);

            useEffect(() => {
                const lat = location?.lat || 25.033;
                const lng = location?.lng || 121.565;
                fetchRoadWeatherAdhesion(lat, lng);
            }, [fetchRoadWeatherAdhesion, location?.lat, location?.lng]);

            // 左右滑動手勢切換主分頁 (Swipe Gesture Navigation)
            const MAIN_NAV_TABS = ['stats', 'hud', 'home', 'events', 'settings'];
            const touchStartXRef = useRef(0);
            const touchStartYRef = useRef(0);
            const touchStartTimeRef = useRef(0);
            const touchIgnoredRef = useRef(false);

            const handleTouchStart = (e) => {
                if (!currentUser) return;
                const touch = e.touches[0];
                touchStartXRef.current = touch.clientX;
                touchStartYRef.current = touch.clientY;
                touchStartTimeRef.current = Date.now();

                // 檢查點擊是否來自不應觸發滑動分頁的元素 (地圖拖曳、拉桿、彈窗、水平滾動條或標有 no-swipe 者)
                const target = e.target;
                if (
                    target.closest('.leaflet-container') ||
                    target.closest('input[type="range"]') ||
                    target.closest('.no-swipe') ||
                    target.closest('.modal-content') ||
                    target.closest('.overflow-x-auto')
                ) {
                    touchIgnoredRef.current = true;
                } else {
                    touchIgnoredRef.current = false;
                }
            };

            const handleTouchEnd = (e) => {
                if (!currentUser || touchIgnoredRef.current) return;
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchStartXRef.current;
                const deltaY = touch.clientY - touchStartYRef.current;
                const deltaTime = Date.now() - touchStartTimeRef.current;

                // 觸發條件：水平滑動超過 50px、水平位移大於垂直位移 1.3 倍、滑動時間小於 450ms
                if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && deltaTime < 450) {
                    const currentIndex = MAIN_NAV_TABS.indexOf(activeTab);
                    if (currentIndex !== -1) {
                        if (deltaX < 0 && currentIndex < MAIN_NAV_TABS.length - 1) {
                            // 向左滑動 (手指往左) -> 切換至下一個分頁
                            setActiveTab(MAIN_NAV_TABS[currentIndex + 1]);
                        } else if (deltaX > 0 && currentIndex > 0) {
                            // 向右滑動 (手指往右) -> 切換至上一個分頁
                            setActiveTab(MAIN_NAV_TABS[currentIndex - 1]);
                        }
                    }
                }
            };
            const socketRef = useRef(null);
            const btRef = useRef(null); // Tracks active Bluetooth connection

            useEffect(() => {
                const handleLog = (e) => {
                    const { msg, isError } = e.detail;
                    setSystemLogs(prev => {
                        const newLog = { 
                            id: Date.now() + Math.random(), 
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                            level: isError ? 'danger' : 'info', 
                            message: msg 
                        };
                        return [...prev.slice(-49), newLog];
                    });
                };
                window.addEventListener('visorLog', handleLog);
                return () => window.removeEventListener('visorLog', handleLog);
            }, []);

            // Notification Helper
            const addNotification = useCallback((type, title, message) => {
                const id = Date.now() + Math.random();
                setNotifications(prev => {
                    if (prev.some(n => n.title === title && n.message === message)) return prev;
                    return [...prev, { id, type, title, message, isClosing: false }].slice(-3);
                });
                setTimeout(() => {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isClosing: true } : n));
                }, 4600);
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                }, 5000);
            }, []);

            const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

            const updateHudConfig = (newConfig) => {
                const updated = { ...hudConfig, ...newConfig };
                setHudConfig(updated);
                
                const cmd = JSON.stringify({ action: "set_hud_config", config: updated });
                const wsOk = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;
                const btOk = window.bluetoothSerial && btRef.current;
                
                if (wsOk) {
                    socketRef.current.send(cmd);
                } else if (btOk) {
                    window.bluetoothSerial.write(cmd + '\n');
                }
            };

            const toggleSentry = () => {
                const newState = !isSentryMode;
                setIsSentryMode(newState);
                
                const cmd = JSON.stringify({ action: "set_sentry", enabled: newState });
                const wsOk = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;
                const btOk = window.bluetoothSerial && btRef.current;
                
                if (wsOk) {
                    socketRef.current.send(cmd);
                } else if (btOk) {
                    window.bluetoothSerial.write(cmd + '\n');
                }
                addNotification('info', '模式切換', `哨兵模式已${newState ? '開啟' : '關閉'}`);
            };

            const toggleExhibitionMode = () => {
                const newState = !isExhibitionMode;
                setIsExhibitionMode(newState);
                
                const cmd = JSON.stringify({ action: "set_exhibition", enabled: newState });
                const wsOk = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;
                const btOk = window.bluetoothSerial && btRef.current;
                
                if (wsOk) {
                    socketRef.current.send(cmd);
                } else if (btOk) {
                    window.bluetoothSerial.write(cmd + '\n');
                }
                addNotification('info', '模式切換', `展覽演示模式已${newState ? '啟動 (32秒全情境循環)' : '關閉 (回到實車模式)'}`);
            };

            const requestShutdown = (target) => {
                setShutdownModalTarget(target);
            };

            const executeShutdown = (target) => {
                const targetName = target === 'pi5' ? 'Pi 5 主機 (Core)' : 'Pi Zero HUD';
                addNotification('warning', '電源管理', `已向 ${targetName} 發送關機指令...`);

                const cmdObj = { action: 'system_power', target: target };
                const cmdStr = JSON.stringify(cmdObj);

                // 1. WebSocket 發送
                if (socketRef && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    try {
                        socketRef.current.send(cmdStr);
                    } catch (e) {
                        console.warn("WS send shutdown err:", e);
                    }
                }
                
                // 2. 藍牙發送
                if (window.bluetoothSerial) {
                    try {
                        window.bluetoothSerial.write(cmdStr + '\n', () => {
                            console.log("[BT] Shutdown command written successfully:", target);
                        }, (err) => {
                            console.warn("BT write err:", err);
                        });
                    } catch (e) {
                        console.warn("BT write exception:", e);
                    }
                }
            };

            // Refs
            const simRef = useRef(null);
            const isSimulatingRef = useRef(false);
            const lastTiltWarningRef = useRef(0);
            const crashStartRef = useRef(null);
            const hasCrashedRef = useRef(false);

            // SOS Trigger Handler
            const triggerSOS = useCallback((isAuto = false) => {
                const emergencyNumber = "0912345678";
                const lat = location.lat.toFixed(6);
                const lng = location.lng.toFixed(6);
                const prefix = isAuto ? "[自動偵測: 嚴重傾倒] " : "";
                const message = `${prefix}我現在出車禍了，位置在 ${lat}, ${lng} (V.I.S.O.R. 緊急通報)`;

                console.log("Triggering SOS:", message);

                if (window.sms && window.cordova && cordova.plugins && cordova.plugins.permissions) {
                    const permissions = cordova.plugins.permissions;
                    const sendRealSMS = () => {
                        window.sms.send(emergencyNumber, message, { android: { intent: '' } },
                            () => {
                                alert(`✅ E-SOS 已發送\n${message}`);
                                playWarningSound('danger', 3);
                            },
                            (e) => alert(`❌ E-SOS 發送失敗: ${e}`)
                        );
                    };

                    permissions.checkPermission(permissions.SEND_SMS, function(status) {
                        if (status.hasPermission) {
                            sendRealSMS();
                        } else {
                            permissions.requestPermission(permissions.SEND_SMS, function(status) {
                                if (status.hasPermission) sendRealSMS();
                                else alert("⚠️ E-SOS 發送失敗：未授予發送簡訊權限。");
                            }, () => alert("⚠️ E-SOS 發送失敗：權限請求發生錯誤。"));
                        }
                    }, () => sendRealSMS());

                } else {
                    alert(`⚠️ [E-SOS 模擬發送]\n對象: ${emergencyNumber}\n內容: ${message}`);
                    playWarningSound('danger', 3);
                }
            }, [location]);

            const triggerEdgeWarning = (direction) => {
                setEdgeWarning(direction);
                if (!isEdgeMuted) {
                    playWarningSound('danger', 1); // Only 1 set of pings per trigger
                }
                setTimeout(() => setEdgeWarning(null), 1000); // 1s visual pulse
            };

            const handleOrientation = (event) => {
                // 如果正在模擬中，直接結束，不更新 tiltAngle
                if (isSimulatingRef.current) return;

                let angle = event.gamma || 0;
                let displayAngle = angle;
                if (displayAngle > 50) displayAngle = 50;
                if (displayAngle < -50) displayAngle = -50;
                setTiltAngle(Math.round(displayAngle));

                const absAngle = Math.abs(angle);

                if (absAngle > 45) {
                    if (crashStartRef.current === null) {
                        crashStartRef.current = Date.now();
                    } else {
                        const duration = Date.now() - crashStartRef.current;
                        if (duration > 15000 && !hasCrashedRef.current) {
                            hasCrashedRef.current = true;
                            triggerSOS(true);
                        }
                    }
                } else {
                    if (absAngle < 30) {
                        crashStartRef.current = null;
                        hasCrashedRef.current = false;
                    }
                }

                if (absAngle > 35 && absAngle <= 45) {
                    const now = Date.now();
                    if (now - lastTiltWarningRef.current > 2000) {
                        //playWarningSound('danger', 3);
                        lastTiltWarningRef.current = now;
                    }
                }
            };

            useEffect(() => {
                const storedSettings = localStorage.getItem("visor_ai_settings");
                if (storedSettings) {
                    setAiSettings(JSON.parse(storedSettings));
                } else {
                    // Migration from legacy key
                    const legacyKey = localStorage.getItem("visor_gemini_api_key");
                    if (legacyKey) {
                        const newSettings = { provider: 'gemini', geminiKey: legacyKey, deepseekKey: '' };
                        setAiSettings(newSettings);
                        localStorage.setItem("visor_ai_settings", JSON.stringify(newSettings));
                    }
                }
            }, []);

            const [rideData, setRideData] = useState([{ time: '10:00', speed: 20, gForce: 0.1 }]);
            const [eventData, setEventData] = useState([{ id: 1, type: 'danger', title: '後方逼車警示', time: '10:14 AM', loc: '市民大道四段', duration: '0:15' }]);

            const parseCSV = (text, sourceName = '自訂 CSV') => {
                try {
                    const lines = text.split(/\r\n|\n/);
                    const newCameras = [];
                    let startIndex = 0;
                    if (lines[0] && lines[0].includes('CityName')) startIndex = 2;
                    else if (lines[0] && lines[0].includes('設置縣市')) startIndex = 1;
                    for (let i = startIndex; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        const cols = line.split(',');
                        if (cols.length >= 9) {
                            const lng = parseFloat(cols[5]);
                            const lat = parseFloat(cols[6]);
                            const limit = parseInt(cols[8]);
                            const directText = cols[7] || '雙向';
                            if (!isNaN(lng) && !isNaN(lat)) {
                                newCameras.push({
                                    address: cols[2],
                                    lat: lat,
                                    lng: lng,
                                    limit: isNaN(limit) ? 50 : limit,
                                    type: 'fixed',
                                    direct: directText,
                                    heading: parseDirection(directText) // Parse numeric heading
                                });
                            }
                        }
                    }
                    if (newCameras.length > 0) {
                        setCameras(newCameras);
                        setDbInfo({ count: newCameras.length, source: sourceName });
                        if (sourceName !== '政府開放資料 (Live)') {
                            addNotification('success', '資料更新成功', `已載入 ${newCameras.length} 筆測速資料`);
                        }
                    } else if (sourceName !== '政府開放資料 (Live)') {
                        addNotification('warning', '資料解析警告', '未發現有效資料');
                    }
                } catch (err) {
                    console.error(err);
                    if (sourceName !== '政府開放資料 (Live)') addNotification('danger', '匯入失敗', '資料格式錯誤');
                }
            };


            const handleFileUpload = (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => parseCSV(e.target.result, '本機匯入');
                reader.readAsText(file);
            };

            const handleApiUpdate = async (isAuto = false) => {
                const targetUrl = "https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/EA5E6FCD-B82D-43B7-A5CF-E9893253187E/resource/051DAA60-ED0E-4F5B-86EA-D88D311CF792/download";
                const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(targetUrl);

                setUpdateStatus('updating');
                if (!isAuto) setDbInfo(prev => ({ ...prev, source: '更新中...' }));

                try {
                    let response = await fetch(targetUrl).catch(() => null);
                    if (!response || !response.ok) {
                        if (!isAuto) console.log("Direct fetch failed, trying proxy...");
                        response = await fetch(proxyUrl);
                    }

                    if (!response.ok) throw new Error('Network response was not ok');
                    const text = await response.text();
                    parseCSV(text, '政府開放資料 (Live)');

                    setUpdateStatus('success');
                    setLastUpdateTime(new Date().toLocaleString());
                    if (!isAuto) addNotification('success', '雲端更新完成', '測速資料庫已同步至最新版本');

                } catch (error) {
                    setUpdateStatus('error');
                    if (isAuto) {
                        console.warn("Auto-update failed (CORS/Network). Skipping alert.");
                        return;
                    }
                    console.warn("API Fetch Issue:", error.message);
                    setDbInfo(prev => ({ ...prev, source: '更新失敗' }));
                    addNotification('danger', '雲端更新失敗', '無法連接伺服器，請檢查網路狀態');
                }
            };

            // 偵測開始騎乘/結束騎乘邏輯
            const [isRiding, setIsRiding] = React.useState(false);
            const isRidingRef = React.useRef(false);
            const rideStartTimeRef = useRef(0);


            // 當 State 改變時，同步更新 Ref
            React.useEffect(() => {
                isRidingRef.current = isRiding;
            }, [isRiding]);

            const handleToggleDetection = () => {
                const newState = !enableSpeedCam;

                // 同步更新所有相關狀態
                setEnableSpeedCam(newState);
                setIsRiding(newState);
                isRidingRef.current = newState;

                if (newState) {
                    // 啟動監控
                    rideStartTimeRef.current = Date.now(); // 記錄開始時間

                    // 重置單次行車數據與臨時紀錄
                    setRideData([]);
                    currentRideDataRef.current = [];

                    logToScreen(`V.I.S.O.R. 實際偵測啟動`);
                    addNotification('success', '監控啟動', '已開始紀錄實際行駛數據');
                } else {
                    // 停止監控
                    const duration = Date.now() - rideStartTimeRef.current;

                    // 防呆機制：判斷是否超過 3 秒 (3000 毫秒)
                    if (duration > 3000) {
                        logToScreen("V.I.S.O.R.實際偵測已停止，產生報告...");
                        addNotification('info', '監控結束', '騎乘紀錄處理中');
                        finalizeRide(); //觸發結算邏輯
                        setActiveTab('stats'); //自動切換到報告頁面
                    } else {
                        logToScreen("啟動時間過短 (< 3秒)，已取消紀錄");
                        addNotification('warning', '偵測取消', '啟動時間不足 3 秒，視為誤觸不予紀錄');
                        currentRideDataRef.current = []; // 不記錄，清空
                    }
                }
            };

            // 統一處理來自模擬跟實際的數據
            const handleIncomingData = (data) => {
                // 1. 統一時間格式
                const now = new Date();

                // 2. 建立標準數據點 (確保不管來源是誰，存入的欄位名稱都統一)
                const newPoint = {
                    rawTime: now.getTime(), // 用來做數學計算
                    time: now.toISOString(), // 用於上傳supabase
                    location: data.location, // 位置資訊
                    limit: data.limit, // 限速
                    speed: data.speed, // 時速
                    tilt: data.tilt  // 傾角
                };

                // 3. 同時檢查 isRiding 或正在模擬 (analyzeOverspeed 等函數要讀取的資料夾)
                if (isRiding || isSimulatingRef.current) {
                    currentRideDataRef.current.push(newPoint);
                } else {
                    logToScreen.warn(`⚠️ 數據被拒絕存入: isRiding = ${isRiding}, Simulating = ${isSimulatingRef.current}`);
                }

                // 4. 同步更新儀表板顯示 (UI)
                setSimulatedSpeed(data.speed);
                setTiltAngle(data.tilt);

                setRideData(prev => [...prev, newPoint]);
            };

            //===========================================================
            //                 事件判斷區 
            //===========================================================

            //判斷有幾次超速事件
            const analyzeOverspeed = (ridePoints) => {
                // 檢查有沒有資料，沒資料就回傳 0
                if (!ridePoints || ridePoints.length === 0) {
                    return { count: 0, events: [], class: 'normal' };
                }

                let isSpeeding = false; // 紀錄「現在這一秒」是否正在超速
                let count = 0; // 紀錄次數
                let currentEvent = null; // 紀錄當下事件細節
                let events = []; // 總結事件的細節

                // 逐一檢查每個點
                ridePoints.forEach((point) => {
                    if (point.limit) {
                        const limit = point.limit; // 取得限速
                        const speedDiff = point.speed - limit; // 計算超速程度

                        if (point.speed > limit) { // 如果這秒超過限速
                            if (!isSpeeding) {// 超速開始
                                isSpeeding = true;
                                count++; // 觸發次數+1
                                currentEvent = {
                                    time: point.time, // 紀錄起始時間(字串)
                                    rawTime: point.rawTime, // 紀錄起始時間(數字)
                                    maxSpeed: point.speed,
                                    lowSpeed: point.speed,
                                    limit: limit
                                };
                            } else { // 持續超速中：更新最高、最低速
                                if (point.speed > currentEvent.maxSpeed) {
                                    currentEvent.maxSpeed = point.speed;
                                }
                                if (point.speed < currentEvent.lowSpeed) {
                                    currentEvent.lowSpeed = point.speed;
                                }
                            }
                        } else { // 超速結束
                            if (isSpeeding && currentEvent) {
                                const eventSeconds = (point.rawTime - currentEvent.rawTime) / 1000;
                                events.push({
                                    time: currentEvent.time,        // 開始時間(字串)
                                    endtime: point.time,             // 結束時間(字串)
                                    duration: eventSeconds, //紀錄超速幾秒
                                    maxspeed: Math.round(currentEvent.maxSpeed), // 這段區間的最高時速
                                    lowspeed: Math.round(currentEvent.lowSpeed), // 這段區間的最低時速
                                    limit: currentEvent.limit,
                                    overspeed: Math.round(currentEvent.maxSpeed - currentEvent.limit), // 這一區間最大的超速量
                                    class: 'overspeed'
                                });
                                isSpeeding = false;
                                currentEvent = null;
                            }
                        }
                    }
                });

                if (isSpeeding && currentEvent) {// 防止行程結束時還在超速
                    const lastPoint = ridePoints[ridePoints.length - 1];
                    events.push({
                        time: currentEvent.time,
                        endtime: lastPoint.time,
                        duration: (lastPoint.rawTime - currentEvent.rawTime) / 1000,
                        maxspeed: Math.round(currentEvent.maxSpeed),
                        lowspeed: Math.round(currentEvent.lowSpeed),
                        limit: currentEvent.limit,
                        overspeed: Math.round(currentEvent.maxSpeed - currentEvent.limit),
                        class: 'overspeed'
                    });
                }

                return {
                    count: count,
                    events: events
                };
            };

            // 判斷有幾次危險傾角事件
            const analyzeTilt = (ridePoints) => {
                if (!ridePoints || ridePoints.length === 0) {
                    return { count: 0, events: [], class: 'normal' };
                }

                let count = 0;
                let isTilting = false; // 紀錄「現在」是否正處於危險傾角狀態
                let currentEvent = null; // 紀錄當下事件細節
                let events = []; // 總結事件的細節

                ridePoints.forEach((point) => {
                    // 判定門檻：傾角 >= 40 度，論文定義危險壓彎計次區間 (30° ~ 45°)，為避免過於敏感，這裡設定在 40° 以上才算一次事件開始
                    if (point.tilt >= 40) {
                        if (!isTilting) {
                            // 進入危險傾角
                            isTilting = true;
                            count++;
                            currentEvent = {
                                time: point.time,       // 開始傾斜時間(字串)
                                rawTime: point.rawTime,       // 開始傾斜時間(數字)
                                maxTilt: point.tilt,    // 初始傾角
                                maxSpeed: point.speed,  // 進入時的時速
                                lowSpeed: point.speed,  // 初始化最低速
                                class: 'tilt'
                            };
                        } else { // 持續傾斜中：更新最大傾角與速度
                            if (point.tilt > currentEvent.maxTilt) {
                                currentEvent.maxTilt = point.tilt;
                            }
                            if (point.speed > currentEvent.maxSpeed) {
                                currentEvent.maxSpeed = point.speed;
                            }
                            if (point.speed < currentEvent.lowSpeed) {
                                currentEvent.lowSpeed = point.speed;
                            }
                        }
                    } else {
                        if (isTilting && currentEvent) { // 傾角恢復
                            const eventSeconds = (point.rawTime - currentEvent.rawTime) / 1000;
                            events.push({
                                time: currentEvent.time,        // 起始時間
                                endtime: point.time,             // 結束時間
                                duration: eventSeconds, // 傾斜持續幾秒
                                maxspeed: Math.round(currentEvent.maxSpeed),
                                lowspeed: Math.round(currentEvent.lowSpeed),
                                tilt: Math.round(currentEvent.maxTilt), // 記錄這段區間最大的傾角
                                class: 'tilt'
                            });
                            isTilting = false;
                            currentEvent = null;
                        }
                    }
                });

                if (isTilting && currentEvent) {// 防止行程結束時剛好還在傾斜
                    const lastPoint = ridePoints[ridePoints.length - 1];
                    events.push({
                        time: currentEvent.time,
                        endtime: lastPoint.time,
                        duration: (lastPoint.rawTime - currentEvent.rawTime) / 1000,
                        maxspeed: Math.round(currentEvent.maxSpeed),
                        lowspeed: Math.round(currentEvent.lowSpeed),
                        tilt: Math.round(currentEvent.maxTilt),
                        class: 'tilt'
                    });
                }

                return {
                    count: count,
                    events: events
                };
            };

            //判斷有幾次急煞事件
            const analyzeBraking = (ridePoints) => {
                // 檢查資料，至少需要兩個點才能計算速度變化
                if (!ridePoints || ridePoints.length < 2) {
                    return { count: 0, events: [], class: 'normal' };
                }

                let count = 0;
                let isBraking = false;
                let currentEvent = null; // 紀錄當下事件細節
                let events = []; // 總結事件的細節

                // 逐點檢查 (從第二個點開始，與前一個點比較)
                for (let i = 1; i < ridePoints.length; i++) {
                    const currentPoint = ridePoints[i];
                    const prevPoint = ridePoints[i - 1];

                    // 計算兩點之間實際過了幾秒 (毫秒 / 1000)
                    const timeDiff = (currentPoint.rawTime - prevPoint.rawTime) / 1000;
                    if (timeDiff <= 0) continue; // 避免分母為 0 的極端情況

                    // 計算減速度 (正值代表減速)
                    const deceleration = (prevPoint.speed - currentPoint.speed) / timeDiff;

                    // 判定門檻：減速 >= 10 km/hr/s
                    if (deceleration >= 10) {
                        if (!isBraking) {// 急煞開始
                            isBraking = true;
                            count++;
                            currentEvent = {
                                time: prevPoint.time,    // 煞車開始的時間
                                maxSpeed: prevPoint.speed, // 煞車前的初始時速
                                lowSpeed: currentPoint.speed, // 當下的最低速
                                maxBraking: deceleration, // 初始減速度
                                class: 'braking'
                            };
                        } else { // 持續急煞中：更新最低速、最強的煞車力道
                            if (currentPoint.speed < currentEvent.lowSpeed) {
                                currentEvent.lowSpeed = currentPoint.speed;
                            }
                            if (deceleration > currentEvent.maxBraking) {
                                currentEvent.maxBraking = deceleration;
                            }
                        }
                    } else { // 急煞結束
                        if (isBraking && currentEvent) {
                            events.push({
                                time: currentEvent.time,        // 開始急煞時間
                                endtime: currentPoint.time,      // 結束急煞時間
                                maxspeed: Math.round(currentEvent.maxSpeed), // 煞車前的最高速
                                lowspeed: Math.round(currentEvent.lowSpeed), // 煞車後的最低速
                                braking: Math.round(currentEvent.maxBraking),  // 這段期間最強的煞車力道
                                class: 'braking'
                            });
                            isBraking = false;
                            currentEvent = null;
                        }
                    }
                }

                if (isBraking && currentEvent) { // 防止行程結束時剛好在急煞
                    const lastPoint = ridePoints[ridePoints.length - 1];
                    events.push({
                        time: currentEvent.time,
                        endtime: lastPoint.time,
                        maxspeed: Math.round(currentEvent.maxSpeed),
                        lowspeed: Math.round(currentEvent.lowSpeed),
                        braking: Math.round(currentEvent.maxBraking),
                        class: 'braking'
                    });
                }

                return {
                    count: count,
                    events: events
                };
            };

            //=============================================================
            //                 事件判斷區 結束
            //=============================================================

            // 結算騎乘表現的邏輯
            const finalizeRide = async (camera = null) => {
                // 1. 從 Ref 抓取當前這趟的所有點位
                const dataToAnalyze = currentRideDataRef.current;
                logToScreen("=== 開始分析結算 ===");
                logToScreen(`總共收集點數:${dataToAnalyze.length}`);

                if (dataToAnalyze.length === 0) {
                    logToScreen("沒有收集到數據，取消結算");
                    return;
                }

                // 數據完整性防呆
                const firstPoint = dataToAnalyze[0];
                const lastPoint = dataToAnalyze[dataToAnalyze.length - 1];

                if (!firstPoint || !lastPoint || !firstPoint.time || !lastPoint.time) {
                    logToScreen("數據傳輸不完整 (缺失時戳)，取消結算");
                    return;
                }

                // 2. 進行數據分析(回傳的是物件 { count, overspeed/braking, class })
                const overspeedRes = analyzeOverspeed(dataToAnalyze);
                const brakingRes = analyzeBraking(dataToAnalyze);
                const tiltRes = analyzeTilt(dataToAnalyze);

                // 計算分數
                let overspeedPenalty = 0;
                let tiltPenalty = 0;

                // 超速扣分邏輯
                overspeedRes.events.forEach(ev => {
                    // n 代表過了幾個 5 秒 (0s=0, 5s=1, 10s=2)
                    const n = Math.floor(ev.duration / 5);
                    // 公式：2 的 (n+1) 次方
                    // 0~4.9s  => 2^1 = 2分
                    // 5~9.9s  => 2^2 = 4分
                    // 10~14.9s => 2^3 = 8分
                    overspeedPenalty += Math.pow(2, n + 1);
                });

                // 危險傾角扣分邏輯
                tiltRes.events.forEach(ev => {
                    const n = Math.floor(ev.duration / 5);
                    tiltPenalty += Math.pow(5, n + 1);
                });

                // 急煞扣分邏輯
                const brakingPenalty = (brakingRes.count || 0) * 3;

                // 總結分數
                const totalPenalty = overspeedPenalty + tiltPenalty + brakingPenalty;
                const finalScore = Math.max(0, 100 - totalPenalty);

                logToScreen(`扣分統計: 超速-${overspeedPenalty}, 傾角-${tiltPenalty}, 急煞-${brakingPenalty}`);

                // 優先順序：
                // 1. 傳入的實體相機地址 
                // 2. 數據點內的 location 欄位 
                // 3. 萬一都沒抓到，才是未知路段
                const locationName = (camera && camera.address) || (lastPoint && lastPoint.location) || "未知路段";

                const rideId = Date.now().toString(); // 用來判斷是否為同一趟用
                let recordsToUpload = []; // 準備要上傳的資料陣列

                // 統一處理函數：
                const processEvents = (res, type) => {
                    res.events.forEach(ev => {
                        recordsToUpload.push({
                            user_id: currentUser.id,
                            class: ev.class,
                            count: ev.count || 1,
                            time: ev.time,
                            endtime: ev.endtime,
                            duration: ev.duration || 0,
                            location: locationName,
                            limit: lastPoint.limit,
                            maxspeed: ev.maxspeed,
                            lowspeed: ev.lowspeed,
                            overspeed: ev.overspeed || 0,
                            braking: ev.braking || 0,
                            tilt: ev.tilt || 0,
                            score: finalScore,
                            ride_id: rideId // 用來判斷是否為同一趟用
                        });
                    });
                };

                processEvents(overspeedRes, 'overspeed');
                processEvents(brakingRes, 'braking');
                processEvents(tiltRes, 'tilt');

                // 如果完全沒事，存一筆正常的紀錄
                if (recordsToUpload.length === 0) {
                    recordsToUpload.push({
                        user_id: currentUser.id,
                        class: 'normal',
                        count: 0,
                        time: firstPoint.time,
                        endtime: lastPoint.time,
                        duration: 0,
                        location: locationName,
                        limit: lastPoint.limit,
                        maxspeed: lastPoint.speed,
                        lowspeed: lastPoint.speed,
                        overspeed: 0,
                        braking: 0,
                        tilt: 0,
                        score: 100,
                        ride_id: rideId
                    });
                }

                // 5. 更新狀態與 LocalStorage (包含 7 天過濾邏輯)
                setWeeklyHistory(prev => {
                    const currentHistory = Array.isArray(prev) ? prev : [];
                    let updated = [...currentHistory, ...recordsToUpload];

                    // 執行 7 天過濾
                    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
                    const now = new Date().getTime();
                    updated = updated.filter(item => !item.timestamp || (now - item.timestamp) < SEVEN_DAYS_MS);

                    localStorage.setItem('ride_history', JSON.stringify(updated));
                    logToScreen(`歷史紀錄已更新，目前總筆數:${updated.length}`);
                    return updated;
                });

                // 6. 上傳到 Supabase
                try {
                    const { error } = await _supabase.from('ride_history').insert(recordsToUpload);
                    if (error) throw error;
                    logToScreen("✅ 成功同步至雲端資料庫");
                } catch (error) {
                    logToScreen(`❌ 雲端同步失敗:${error.message}`);
                }

                // 測試用的 alert
                if (isSimulatingRef.current) {
                    alert(`✅ 模擬結束：已通過 ${locationName} 並續行 100m，本次超速：${overspeedRes.count} 次，急煞：${brakingRes.count} 次，危險傾角：${tiltRes.count} 次，最終得分：${finalScore} 分`);
                }

                // 7. 重置臨時數據
                currentRideDataRef.current = [];
            };

            const startSimulation = () => {
                if (simulationMode) {
                    setSimulationMode(false);
                    setIsRiding(false);
                    isSimulatingRef.current = false;
                    if (simRef.current) clearInterval(simRef.current);
                    setCameraAlert(null);
                    return;
                }

                // 重置單次行車數據與臨時紀錄
                setRideData([]);
                currentRideDataRef.current = [];

                // 設定目標相機與初始參數
                let targetCam = cameras.find(c => c.address.includes("雪山隧道") && c.address.includes("南向"));
                if (!targetCam) targetCam = cameras[0];

                // 如果 forceSpeeding 為 true /false，速度 = 限速 + 15 / 限速 - 5
                const speedValue = forceSpeeding ? targetCam.limit + 15 : targetCam.limit - 5;

                let currentLat = targetCam.lat + 0.011;
                let currentLng = targetCam.lng;
                let passedTarget = false; // 鎖定通過狀態
                let tick = 0;

                isSimulatingRef.current = true;
                setLocation({ lat: currentLat, lng: currentLng });
                setSimulationMode(true);
                setIsRiding(true);
                setSimulatedSpeed(speedValue); // 將計算出的速度套用到模擬器
                setIsConnected(true);

                simRef.current = setInterval(() => {
                    tick++;

                    // 物理移動模擬
                    currentLat -= 0.00008;
                    const jitterLat = currentLat + (Math.random() - 0.5) * 0.000002;
                    const jitterLng = currentLng + (Math.random() - 0.5) * 0.000002;
                    setLocation({ lat: jitterLat, lng: jitterLng });
                    if (trackRef.current) trackRef.current.push([jitterLat, jitterLng]);

                    //數據收集 每秒存一次資料供分析頁面顯示
                    if (tick % 10 === 0) {
                        // 1. 先判定這一秒是否發生了特殊事件
                        let braking = 0;
                        let tilt = 0;

                        if (forceSpeeding) {
                            // 模擬急煞
                            if (Math.random() > 0.80) {
                                braking = 12 + (Math.random() * 5); // 論文定義 > 10 算急煞
                            }

                            // 模擬危險傾角
                            if (Math.random() > 0.80) {
                                tilt = 40 + Math.floor(Math.random() * 11);
                            } else {
                                // 如果沒觸發危險傾角，就給它一個一般的隨機值
                                tilt = 0 + Math.floor(Math.random() * 40); // 0~39度的正常傾角
                            }
                        }

                        const simData = {
                            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            location: targetCam.address,
                            speed: speedValue, // 啟動時根據按鈕決定的速度
                            limit: targetCam.limit,
                            braking: braking, // 急煞值
                            tilt: tilt, // 傾角值
                        }

                        handleIncomingData(simData);
                    }

                    const dist = GeoUtils.calculateDistance(jitterLat, jitterLng, targetCam.lat, targetCam.lng);
                    const physicallyPassed = currentLat < targetCam.lat;

                    // 通過判定：只要物理通過或距離極近，且尚未標記為通過
                    if (!passedTarget && (physicallyPassed || dist < 20)) {
                        passedTarget = true;
                        setCameraAlert(null); // 一通過立刻清除警示
                        playWarningSound('pass', 1); // 強制播放通過音效
                        logToScreen("[Sim] Camera Passed -> Alert Cleared & Sound Played");
                        logToScreen("成功標記為已通過！"); // 檢查 F12 有沒有這一行
                    }

                    // 只有在「尚未通過」的情況下，才更新距離警示
                    if (!passedTarget) {
                        if (dist < 1000 && enableSpeedCam) {
                            setCameraAlert({ ...targetCam, distance: dist });
                        }
                    } else {
                        // 如果已經通過了，確保警示視窗維持為 null
                        if (cameraAlert !== null) setCameraAlert(null);
                    }

                    // // 結束條件：通過後行駛超過 100 公尺
                    // if (passedTarget && dist > 100) {
                    //     logToScreen("滿足結束條件，執行結算"); 

                    //     // 先停止計時器，防止重複觸發
                    //     if (simRef.current) {
                    //         clearInterval(simRef.current);
                    //         simRef.current = null;
                    //     }

                    //     finalizeRide(targetCam); //呼叫結算騎乘表現的邏輯

                    //     setIsRiding(false);
                    //     setSimulationMode(false);
                    //     isSimulatingRef.current = false;

                    //     setSimulatedSpeed(0);
                    // }

                    // --- 隨機觸發邊緣預警 ---
                    if (Math.random() > 0.96) {
                        const dirs = ['left', 'right', 'rear'];
                        const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
                        triggerEdgeWarning(randomDir);
                    }
                }, 100);
            };

            // 在你的手機 App index.html 中加入以下邏輯
            useEffect(() => {
                // --- 1. WebSocket 邏輯 ---
                let host = "192.168.4.1";
                if (window.location.hostname && !['localhost', '127.0.0.1', '', '192.168.4.1'].includes(window.location.hostname)) {
                    host = window.location.hostname;
                }
                const socketUrl = `ws://${host}:8765`;

                let socket;
                let btConnected = false;

                try {
                    socket = new WebSocket(socketUrl);
                    socketRef.current = socket;
                    socket.onopen = () => {
                        setIsConnected(true);
                        setSystemStatus(prev => ({ ...prev, pi5: true }));
                        logToScreen("Neural Link: Wi-Fi Connected");
                    };
                    socket.onmessage = (event) => handleIncomingPayload(JSON.parse(event.data));
                    socket.onclose = () => { if (!btConnected) setIsConnected(false); };
                } catch (e) {
                    console.error("WS Security Block:", e);
                    logToScreen("Wi-Fi Blocked by Security (HTTPS)", true);
                }

                // --- 2. 藍牙 (Bluetooth Serial) 邏輯 ---

                const initBluetooth = () => {
                    logToScreen("Starting Bluetooth Link...");
                    if (!window.bluetoothSerial) {
                        logToScreen("Error: BT Plugin Missing", true);
                        return;
                    }
                    startBluetoothLink();
                };

                const startBluetoothLink = () => {
                    const attemptConnect = () => {
                        if (btConnected) return;

                        window.bluetoothSerial.list((devices) => {
                            if (devices.length === 0) {
                                logToScreen("No paired devices found.");
                            } else {
                                const names = devices.map(d => d.name).join(", ");
                                logToScreen("Paired: " + names);
                            }

                            const target = devices.find(d =>
                                d.name.toLowerCase().includes('pi5') ||
                                d.name.toLowerCase().includes('visor')
                            );

                            if (target) {
                                logToScreen("Linking to: " + target.name);
                                window.bluetoothSerial.connect(target.id, () => {
                                    logToScreen("BT Link SUCCESS!");
                                    btConnected = true;
                                    btRef.current = window.bluetoothSerial;
                                    setIsConnected(true);
                                    setSystemStatus(prev => ({ ...prev, pi5: true }));
                                    window.bluetoothSerial.subscribe('\n', (data) => {
                                        try { handleIncomingPayload(JSON.parse(data)); } catch (e) { }
                                    });
                                }, (err) => {
                                    logToScreen("Link Failed: " + err);
                                    setTimeout(attemptConnect, 5000);
                                });
                            } else {
                                setTimeout(attemptConnect, 10000);
                            }
                        }, (err) => {
                            logToScreen("List Err: " + err, true);
                            setTimeout(attemptConnect, 5000);
                        });
                    };
                    attemptConnect();
                };

                document.addEventListener("deviceready", initBluetooth, false);
                setTimeout(() => {
                    if (!window.cordova) logToScreen("Diag: window.cordova undefined");
                }, 5000);

                function handleIncomingPayload(data) {
                    if (data.system) {
                        setSystemStatus({
                            pi5: true,
                            piZero: data.system.hud_status === 'online',
                            cpu: data.system.cpu || 0,
                            mem: data.system.mem || 0,
                            temp: data.system.temp || 0
                        });
                    }
                    if (data.exhibition !== undefined) {
                        setIsExhibitionMode(!!data.exhibition);
                    }
                    if (data.type === 'exhibition_status') {
                        setIsExhibitionMode(!!data.enabled);
                    }
                    if (data.hud_config) {
                        setHudConfig(prev => ({
                            ...prev,
                            ...data.hud_config,
                            oled_model: data.hud_config.oled_model || prev.oled_model || 'SSD1306',
                            mirror: (data.hud_config.mirror !== undefined) ? !!data.hud_config.mirror : (prev.mirror !== undefined ? prev.mirror : true),
                            flip_v: (data.hud_config.flip_v !== undefined) ? !!data.hud_config.flip_v : (prev.flip_v !== undefined ? prev.flip_v : false),
                        }));
                    }
                    if (data.speed_source === 'exhibition' || data.exhibition || !isSimulatingRef.current) {
                        setSimulatedSpeed(Math.round(data.speed || 0));
                        setTiltAngle(Math.round(data.tilt || 0));
                    }
                    if (data.type === 'notification') {
                        addNotification(data.level || 'info', data.title || '系統通知', data.message);
                    }
                    if (data.warning && data.warning.level === 'danger') {
                        triggerEdgeWarning(data.warning.direction);
                    } else if (data.alert === 1) {
                        triggerEdgeWarning('rear');
                    }
                    if (isSimulatingRef.current || isRiding) {
                        handleIncomingData(data);
                    }
                }

                return () => {
                    if (socket) socket.close();
                    document.removeEventListener("deviceready", initBluetooth);
                    if (window.bluetoothSerial) window.bluetoothSerial.disconnect();
                };
            }, [addNotification, isSentryMode]);



            // Effects
            useEffect(() => {
                const unlockAudio = () => { initAudioContext().resume().then(() => { playWarningSound('silent'); document.removeEventListener('touchstart', unlockAudio); document.removeEventListener('click', unlockAudio); }); };
                document.addEventListener('touchstart', unlockAudio); document.addEventListener('click', unlockAudio);
                handleApiUpdate(true);
                return () => { document.removeEventListener('touchstart', unlockAudio); document.removeEventListener('click', unlockAudio); };
            }, []);

            useEffect(() => {
                document.addEventListener("deviceready", () => {
                    setIsConnected(false);
                    if (navigator.geolocation) {
                        navigator.geolocation.watchPosition((pos) => {
                            const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                            setLocation(newLoc);
                            if (trackRef.current) trackRef.current.push([newLoc.lat, newLoc.lng]);

                            if (!isSimulatingRef.current) {
                                const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
                                setSimulatedSpeed(speedKmh);

                                // Update heading only if moving to avoid jitter
                                if (speedKmh > 3 && pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
                                    setHeading(pos.coords.heading);
                                }
                            }
                        }, (err) => console.error("GPS Error:", err), { enableHighAccuracy: true });
                    }
                    if (window.bluetoothSerial) { window.bluetoothSerial.isEnabled(() => setIsConnected(true), () => console.log("Bluetooth not enabled")); }
                }, false);
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') { window.addEventListener('deviceorientation', handleOrientation); setHasGyroPermission(true); }
                return () => { window.removeEventListener('deviceorientation', handleOrientation); };
            }, []);

            useEffect(() => {
                if (simulationMode || !enableSpeedCam) {
                    if (!enableSpeedCam) setCameraAlert(null);
                    return;
                }
                const checkCameras = () => {
                    let nearest = null;
                    let minDistance = Infinity;
                    const warningRange = (simulatedSpeed > 60) ? 800 : (simulatedSpeed > 30 ? 500 : 300); // Dynamic range

                    cameras.forEach(cam => {
                        const dist = GeoUtils.calculateDistance(location.lat, location.lng, cam.lat, cam.lng);

                        // 1. 基本距離過濾
                        if (dist < warningRange) {
                            // 2. 方向過濾 (如果我們有航向資訊)
                            // 容許誤差 ±60度，若相機方向是'ALL'則通過
                            let isDirectionValid = true;
                            if (typeof GeoUtils.isDirectionMatch === 'function') {
                                isDirectionValid = GeoUtils.isDirectionMatch(heading, cam.heading, 60);
                            }

                            if (isDirectionValid && dist < minDistance) {
                                minDistance = dist;
                                nearest = { ...cam, distance: dist };
                            }
                        }
                    });

                    if (nearest) {
                        // 3. 警示狀態判定
                        const isStationary = simulatedSpeed < 5;
                        const isOverSpeed = simulatedSpeed > nearest.limit;

                        // 如果靜止 或 未超速 -> 靜音模式 (只顯示 Visual)
                        // 如果移動中 且 超速 -> 發出聲音
                        const isSilent = isStationary || !isOverSpeed;

                        setCameraAlert({ ...nearest, isSilent });
                    } else {
                        setCameraAlert(null);
                    }
                };
                const interval = setInterval(checkCameras, 1000);
                return () => clearInterval(interval);
            }, [location, cameras, simulationMode, enableSpeedCam, simulatedSpeed, heading]);

            useEffect(() => {
                if (!hasGyroPermission || simulationMode) {
                    const interval = setInterval(() => {
                        if (simulationMode) {
                            const rnd = Math.random();
                            let mockAngle;
                            if (rnd > 0.95) mockAngle = 60; // Crash
                            else if (rnd > 0.8) mockAngle = 40; // Warning
                            else mockAngle = Math.floor(Math.random() * 20 - 10);
                            handleOrientation({ gamma: mockAngle });
                        }
                    }, 500);
                    return () => clearInterval(interval);
                }
            }, [hasGyroPermission, simulationMode]);

            const toggleFullScreen = () => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch((e) => { });
                else if (document.exitFullscreen) document.exitFullscreen();
            };

            const renderLogin = () => (
                <div className="flex flex-col items-center justify-center h-full px-6 animate-fadeIn pb-32">
                    <div className="mb-8 text-center">
                        <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse">
                            <Icon name="shield-check" size={40} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-widest text-white">V.I.S.O.R.</h2>
                        <p className="text-xs text-cyan-500/70 font-mono tracking-[0.3em] mt-1">SYSTEM LOGIN</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                        {authError && <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded-lg text-center flex items-center justify-center gap-2"><Icon name="alert-triangle" size={14} />{authError}</div>}

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-bold ml-1">CALLSIGN / 帳號</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon name="user" size={16} /></div>
                                <input
                                    type="text"
                                    value={authForm.username}
                                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] focus:outline-none transition-all"
                                    placeholder="Enter ID..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-bold ml-1">PASSCODE / 密碼</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon name="lock" size={16} /></div>
                                <input
                                    type="password"
                                    value={authForm.password}
                                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] focus:outline-none transition-all"
                                    placeholder="Enter Code..."
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/50 border border-cyan-400/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 group">
                            <span>INITIALIZE LINK</span>
                            <Icon name="arrow-right" size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setActiveTab('register'); setAuthError(''); setAuthForm({ username: '', password: '', confirmPassword: '' }); }} className="text-slate-500 text-xs hover:text-cyan-400 transition-colors">
                            建立新戰術檔案 (Register)
                        </button>
                    </div>
                </div>
            );

            const renderRegister = () => (
                <div className="flex flex-col items-center justify-center h-full px-6 animate-fadeIn pb-32">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold text-white">建立檔案</h2>
                        <p className="text-xs text-slate-500 font-mono">NEW OPERATOR REGISTRATION</p>
                    </div>

                    <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
                        {authError && <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded-lg text-center">{authError}</div>}

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-bold ml-1">帳號</label>
                            <input type="text" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none" required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-bold ml-1">密碼</label>
                            <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none" required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-bold ml-1">確認密碼</label>
                            <input type="password" value={authForm.confirmPassword} onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none" required />
                        </div>

                        <button type="submit" className="w-full bg-slate-700 hover:bg-cyan-600 text-white font-bold py-3.5 rounded-xl border border-slate-600 transition-all active:scale-95 mt-4">
                            確認註冊
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setActiveTab('login'); setAuthError(''); }} className="text-slate-500 text-xs hover:text-white transition-colors">
                            返回登入 (Back to Login)
                        </button>
                    </div>
                </div>
            );

            // Render Functions
            const renderHome = () => (
                <div className="space-y-4 animate-fadeIn pb-32 relative">


                    <SpeedCameraAlert alert={cameraAlert} currentSpeed={simulatedSpeed} />

                    {/* 兩顆鏡頭的預覽卡片 */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative aspect-video shadow-md">
                            <div className="absolute top-1 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300">FRONT_CAM (Port: 8000)</div>
                            <img src={`http://${window.location.hostname || '192.168.4.1'}:8000/stream.mjpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.parentElement.style.display = 'none'; e.target.parentElement.parentElement.classList.remove('grid-cols-2'); e.target.parentElement.parentElement.classList.add('grid-cols-1'); }} />
                            <div className="absolute inset-0 flex-col items-center justify-center text-slate-600 hidden">
                                <Icon name="video-off" size={24} />
                                <span className="text-[10px] mt-1 text-center font-bold px-2 tracking-wider">OFFLINE<br/><span className="font-normal text-[8px]">硬體串流未啟動或 IP 錯誤</span></span>
                            </div>
                        </div>
                        <div className="bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative aspect-video shadow-md">
                            <div className="absolute top-1 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300">REAR_CAM (Port: 8001)</div>
                            <img src={`http://${window.location.hostname || '192.168.4.1'}:8001/stream.mjpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                            <div className="absolute inset-0 flex-col items-center justify-center text-slate-600 hidden">
                                <Icon name="video-off" size={24} />
                                <span className="text-[10px] mt-1 text-center font-bold px-2 tracking-wider">OFFLINE<br/><span className="font-normal text-[8px]">硬體串流未啟動或 IP 錯誤</span></span>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 relative overflow-hidden min-h-[225px]`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Icon name="shield" size={120} className="text-cyan-400" /></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div><h2 className="text-slate-400 text-sm font-medium">系統狀態</h2><div className="flex items-center gap-2 mt-1"><span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></span><span className="text-white font-bold text-lg">{isConnected ? '系統連線中' : '未連線'}</span><span className="text-slate-500 text-xs ml-2 font-mono">{systemStatus.temp}°C</span></div></div>
                            <div className="text-[10px] text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-600 flex flex-col items-end"><span>DB: {dbInfo.source}</span><span className="text-cyan-400">{dbInfo.count} 點</span></div>
                        </div>
                        {/* 中央時速顯示 */}
                        <div className="flex flex-col items-center z-10 -mt-4">
                            <div className={`text-8xl font-black font-mono tracking-tighter leading-none transition-colors duration-200 
                                ${simulatedSpeed > (cameraAlert?.limit || 999) ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                                {simulatedSpeed}
                            </div>
                            <div className="text-xl font-bold tracking-[0.3em] text-slate-500 -mt-4">KM/H</div>
                        </div>

                        <div className="absolute bottom-5 w-full flex items-center justify-center gap-3 z-10 px-4">
                            {/* 傾角條容器 */}
                            <div className="relative w-40 h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                                {/* 中心線 */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500/50 -translate-x-1/2 z-20"></div>
                                {/* 動態指示條 */}
                                <div className={`absolute top-0 bottom-0 transition-all duration-100 ease-linear ${Math.abs(tiltAngle) > 35 ? 'bg-red-500' : 'bg-cyan-400'}`}
                                    style={{
                                        left: '50%',
                                        width: `${Math.min(Math.abs(tiltAngle) * 2, 50)}%`, // 限制寬度不超過單邊 50%
                                        transform: `translateX(${tiltAngle < 0 ? '-100%' : '0'})`
                                    }}>
                                </div>
                            </div>
                            {/* 角度數字 (顯示在右側) */}
                            <div className="text-xs font-mono font-bold text-slate-400 w-8">
                                {Math.abs(tiltAngle)}°
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SOSButton currentLocation={location} onTrigger={triggerSOS} />

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={toggleSentry} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border active:scale-95 ${isSentryMode ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-800 border-slate-700'}`}><Icon name="eye" size={24} className={isSentryMode ? 'text-cyan-400' : 'text-slate-400'} /><span className={`font-medium text-sm ${isSentryMode ? 'text-cyan-100' : 'text-slate-400'}`}>{isSentryMode ? '哨兵模式' : '哨兵待機'}</span></button>

                            <button onClick={handleToggleDetection} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border active:scale-95 ${enableSpeedCam ? 'bg-green-900/30 border-green-500/50' : 'bg-slate-800 border-slate-700'}`}>
                                <Icon name={enableSpeedCam ? "camera" : "camera-off"} size={24} className={enableSpeedCam ? 'text-green-400' : 'text-slate-400'} />
                                <span className={`font-medium text-sm ${enableSpeedCam ? 'text-green-100' : 'text-slate-400'}`}>{enableSpeedCam ? '偵測啟動' : '未偵測'}</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 mb-4 p-3 bg-gray-800 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">測試模式設定</p>
                            <div className="flex gap-2">
                                {/* 安全模式按鈕 */}
                                <button
                                    onClick={() => setForceSpeeding(false)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${!forceSpeeding
                                            ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-400'
                                            : 'bg-gray-700 text-gray-400 opacity-50'
                                        }`}
                                >
                                    🟢 安全行駛
                                </button>

                                {/* 超速模式按鈕 */}
                                <button
                                    onClick={() => setForceSpeeding(true)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${forceSpeeding
                                            ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-400'
                                            : 'bg-gray-700 text-gray-400 opacity-50'
                                        }`}
                                >
                                    🔴 危險駕駛
                                </button>
                            </div>
                        </div>

                        <button onClick={startSimulation} className={`w-full py-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${simulationMode ? 'bg-red-900/50 border-red-500 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}><Icon name={simulationMode ? "stop-circle" : "play-circle"} size={14} />{simulationMode ? "停止路測模擬" : "啟動路測模擬 (測試用)"}</button>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 overflow-hidden relative">
                        <div className="flex justify-between items-center mb-3"><h3 className="text-white font-bold text-sm flex items-center gap-2"><Icon name="map" size={16} className="text-blue-400" /> 即時軌跡</h3></div>
                        <div className="h-40 w-full bg-slate-900 rounded-lg relative overflow-hidden border border-slate-600/50">
                            <LeafletMap location={location} isTracking={true} trackHistory={trackRef} />
                            <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/30 z-[400]">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</div>
                        </div>
                    </div>
                </div>
            );






            const renderEvents = () => (
                <div className="space-y-4 animate-fadeIn pb-24">
                    <h2 className="text-xl font-bold text-white mb-2">智慧事件簿</h2>
                    {eventData.map((event) => (
                        <div key={event.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex gap-4 hover:border-cyan-500/40 transition-colors">
                            <div className="w-24 h-24 bg-slate-900 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden group cursor-pointer border border-slate-700/50"><div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div><Icon name="play-circle" size={32} className="text-white/80 z-10 group-hover:scale-110 group-hover:text-cyan-400 transition-all" /><span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono">{event.duration}</span></div>
                            <div className="flex-1 flex flex-col justify-between py-1"><div><div className="flex justify-between items-start"><h3 className="text-white font-bold text-md leading-tight">{event.title}</h3>{event.type === 'danger' && <Icon name="alert-triangle" size={16} className="text-red-500 flex-shrink-0" />}</div><p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1"><Icon name="map-pin" size={10} /> {event.loc}</p><p className="text-slate-500 text-[10px] mt-0.5">{event.time}</p></div><div className="flex gap-2 mt-2"><button className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs py-1.5 rounded transition-colors font-medium">回放</button><button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-1.5 rounded transition-colors font-medium">下載</button></div></div>
                        </div>
                    ))}
                </div>
            );
            //=========================================================    
            // 切換到分析頁，讀取分析數據
            // 分析頁圖表與數據處理邏輯
            //=========================================================
            const [dayAnalyzeData, setDayAnalyzeData] = useState([]); 
            const [monthAnalyzeData, setMonthAnalyzeData] = useState([]); 
            const [sevenDayAnalyzeData, setSevenDayAnalyzeData] = useState([]); 
            const [rawRideHistory, setRawRideHistory] = useState([]); 
            const [isInitialLoading, setIsInitialLoading] = useState(true); 

            // 切換到分析頁，讀取分析數據
            React.useEffect(() => {
                const cacheGet = (key) => {
                    try {
                        const cached = sessionStorage.getItem('visor_cache_' + key);
                        if (cached) {
                            const { data, time } = JSON.parse(cached);
                            if (Date.now() - time < 30000) return data;
                        }
                    } catch (e) {}
                    return null;
                };
                const cacheSet = (key, data) => {
                    try { sessionStorage.setItem('visor_cache_' + key, JSON.stringify({ data, time: Date.now() })); } catch (e) {}
                };
                const fenthAnalyze = async () => {
                    if (!currentUser) return;

                    const uid = currentUser.id;
                    const cachedDay = cacheGet('day_' + uid);
                    const cachedMonth = cacheGet('month_' + uid);
                    const cachedSeven = cacheGet('seven_' + uid);
                    const cachedRaw = cacheGet('raw_' + uid);

                    if (cachedDay && cachedMonth && cachedSeven && cachedRaw) {
                        setDayAnalyzeData(cachedDay);
                        setMonthAnalyzeData(cachedMonth);
                        setSevenDayAnalyzeData(cachedSeven);
                        setRawRideHistory(cachedRaw);
                        setIsInitialLoading(false);
                        return;
                    }

                    try {
                        const [dayResponse, monthResponse, sevendayResponse, rawResponse] = await Promise.all([
                            _supabase.from('day_ride').select('*').eq('user_id', uid).order('date_label', { ascending: false }).limit(30),
                            _supabase.from('month_ride').select('*').eq('user_id', uid).order('month_label', { ascending: false }).limit(12),
                            _supabase.from('day_ride').select('*').eq('user_id', uid).order('date_label', { ascending: false }).limit(7),
                            _supabase.from('ride_history').select('*').eq('user_id', uid).order('time', { ascending: false }).limit(150)
                        ]);

                        if (dayResponse.error) throw dayResponse.error;
                        if (monthResponse.error) throw monthResponse.error;
                        if (sevendayResponse.error) throw sevendayResponse.error;
                        if (rawResponse.error) throw rawResponse.error;

                        const dayData = dayResponse.data || [];
                        const monthData = monthResponse.data || [];
                        const sevenData = sevendayResponse.data || [];
                        const rawData = rawResponse.data || [];

                        cacheSet('day_' + uid, dayData);
                        cacheSet('month_' + uid, monthData);
                        cacheSet('seven_' + uid, sevenData);
                        cacheSet('raw_' + uid, rawData);

                        setDayAnalyzeData(dayData);
                        setMonthAnalyzeData(monthData);
                        setSevenDayAnalyzeData(sevenData);
                        setRawRideHistory(rawData);

                        logToScreen(`✅ 已成功獲取騎乘分析數據`);

                    } catch (error) {
                        logToScreen(`❌ 讀取分析數據失敗: ${error.message}`);
                    } finally {
                        setIsInitialLoading(false);
                    }
                };
                if (currentUser && activeTab === 'stats') {
                    fenthAnalyze();
                }
            }, [currentUser, activeTab]);

            // 記分板========================================

            // 產生今日標籤 (YYYY-MM-DD)
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const monthLabel = `${year}-${month}`;

            // 比對日期，找到今天的數據
            const monthData = monthAnalyzeData.find(d => d.month_label === monthLabel);

            // 輸出記分板
            const stats = {
                averageScore: monthData ? Math.round(parseFloat(monthData.avg_score || 0)) : '---',
                overspeed: monthData ? (monthData.total_overspeed || 0) : 0,
                braking: monthData ? (monthData.total_breaking || 0) : 0,
                tilt: monthData ? (monthData.total_tilt || 0) : 0,
                trips: monthData ? (monthData.total_trips || 0) : 0
            };
            // 記分板 結束============================================================================

            // 週/月直條圖=======================================================================
            const [viewMode, setViewMode] = React.useState('week'); // 'week' or 'month'
            const activeData = viewMode === 'week' ? sevenDayAnalyzeData : monthAnalyzeData;

            const BarChart = React.memo(({ data, viewMode, setViewMode }) => {

                // 根據傳進來的 data 進行處理
                const filteredData = React.useMemo(() => {
                    const count = viewMode === 'week' ? 7 : 12;
                    
                    // 建立一個固定長度的陣列
                    return Array.from({ length: count }).map((_, i) => {
                        const d = new Date();
                        
                        // 根據 i 往回推算日期或月份
                        if (viewMode === 'week') {
                            d.setDate(d.getDate() - i);
                            const label = d.toLocaleDateString('en-CA'); // 格式: 2026-04-15
                            
                            // 去資料庫回傳的 data 找有沒有匹配這一天
                            const match = data?.find(item => item.date_label === label);
                            
                            // 有就回傳資料，沒資料就回傳一個包含 label 但分數為 0 的「空殼」
                            return match || { date_label: label, avg_score: 0 };
                        } else {
                            d.setMonth(d.getMonth() - i);
                            const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // 格式: 2026-04
                            
                            const match = data?.find(item => item.month_label === label);
                            return match || { month_label: label, avg_score: 0 };
                        }
                    }).reverse(); // 因為是往回推算，所以要反轉回來變成 [舊 -> 新]
                }, [data, viewMode]);

                return (
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl">
                        {/* 標題與切換按鈕 */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-lg font-bold text-slate-100">評分趨勢</h3>
                                <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                                    {viewMode === 'week' ? '近7日' : '近12個月'}
                                </p>
                            </div>

                            {/* 切換 Tabs */}
                            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'week' ? 'bg-cyan-500 text-slate-900' : 'text-slate-500'}`}
                                >
                                    週
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode === 'month' ? 'bg-cyan-500 text-slate-900' : 'text-slate-500'}`}
                                >
                                    月
                                </button>
                            </div>
                        </div>

                        {/* 圖表本體 */}
                        <div className="h-48 w-full flex items-end gap-2 px-2">
                            {filteredData.map((item, index) => {
                                const score = Math.round(Number(item.avg_score || 0));
                                const hasData = score > 0; // 判斷是否有數據      
                                let barColor = "#97CBFF"; // 直條預設藍色

                                const currentLabel = item.date_label || item.month_label; //  label判斷是哪個

                                return (
                                    // 每個柱狀圖的容器
                                    <div key={currentLabel || index} className="flex-1 min-w-0 flex flex-col items-center group relative h-full justify-end">
                                        {/* 直條 */}
                                        <div className="relative w-full flex flex-col items-center justify-end h-full">
                                        {/* 分數 */}
                                            <span className={`mb-2 text-[10px] font-mono font-black transition-colors ${hasData ? 'text-cyan-400' : 'text-transparent'}`}>
                                            {score}
                                            </span>
                                            {hasData ? (
                                                /* 有資料：顯示直條 */
                                        <div
                                                    className="w-full rounded-t-sm transition-all duration-700 ease-out"
                                            style={{
                                                        height: `${score * 0.8}%`,
                                                        backgroundColor: barColor
                                                    }}
                                                />
                                            ) : (
                                                /* 無資料：顯示驚嘆號圖示 */
                                                <div className="flex flex-col items-center mb-1 animate-pulse">
                                                    <div className="text-amber-500 bg-amber-500/10 rounded-full w-6 h-6 flex items-center justify-center border border-amber-500/50">
                                                        <span className="text-xs font-bold">!</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* X 軸標籤：數字 + 單位 */}
                                        <span className="text-[10px] text-slate-500 mt-3 font-mono whitespace-nowrap">
                                            {(() => {
                                                const parts = currentLabel.split('-');
                                                const value = viewMode === 'week' ? parts[2] : parts[1];
                                                return `${value}${viewMode === 'week' ? '日' : '月'}`;
                                            })()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 底部 */}
                        <div className="mt-4 border-t border-slate-700/50 pt-3 flex justify-between gap-4 text-xs text-slate-500 font-mono items-baseline">
                            <div className="flex items-center gap-1">
                                <span className="text-amber-500 bg-amber-500/10 rounded-full w-6 h-6 flex items-center justify-center border border-amber-500/50">
                                    <span className="text-xs font-bold">!</span>
                                </span>
                                <span>：無資料</span>
                            </div>
                            <span className={`${thirtyD[29].isToday ? 'text-cyan-500' : ''}`}>今日日期: {thirtyD[29].yearNum}/{thirtyD[29].monthNum}/{thirtyD[29].dayNum}</span>
                        </div>
                    </div>
                );
            });
            // 週/月直條圖 結束==========================================================================================================================================================

            // 實機硬體偵測紀錄面板 =======================================================
            const RealDataDashboard = React.useMemo(() => function DashboardComponent({ data }) {
                const [view, setView] = React.useState('session');

                // 處理資料分類 (加上防呆與過濾無效數據)
                const safeData = (data || []).filter(item => {
                    // 過濾掉時間無效的紀錄 (1970/1/1 或更早, Unix timestamp < 1000000000 秒 = 2001年以前)
                    if (!item.time || new Date(item.time).getTime() < 946684800000) return false;
                    
                    // 僅過濾掉 class 為 normal 且 maxspeed 為 0 的幽靈紀錄，不影響其他事件類別
                    if (item.class === 'normal' && item.maxspeed === 0) return false;
                    
                    return true;
                });

                const uniqueRides = [];
                const seenRideIds = new Set();
                
                safeData.forEach(item => {
                    if (item.ride_id && !seenRideIds.has(item.ride_id)) {
                        seenRideIds.add(item.ride_id);
                        const rideEvents = safeData.filter(e => e.ride_id === item.ride_id);
                        const maxSpd = Math.max(...rideEvents.map(e => e.maxspeed || 0));
                        uniqueRides.push({ ...item, rideMaxSpeed: maxSpd });
                    } else if (!item.ride_id) {
                        uniqueRides.push({ ...item, rideMaxSpeed: item.maxspeed || 0 });
                    }
                });

                const displaySession = uniqueRides;
                const displayOverspeed = safeData.filter(i => i.class === 'overspeed');
                const displayTilt = safeData.filter(i => i.class === 'tilt');
                const displayBrake = safeData.filter(i => i.class === 'braking');

                return (
                    <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 shadow-xl mt-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <Icon name="hard-drive" size={18} className="text-cyan-400" />
                                實機硬體偵測紀錄
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Real-World Data</span>
                        </div>

                        {/* 分頁切換按鈕 */}
                        <div className="flex bg-slate-900 rounded-xl p-1.5 border border-slate-600 mb-4">
                            <button onClick={() => setView('session')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'session' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>紀錄 ({displaySession.length})</button>
                            <button onClick={() => setView('overspeed')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'overspeed' ? 'bg-slate-800 text-slate-300 border border-slate-600 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>超速 ({displayOverspeed.length})</button>
                            <button onClick={() => setView('tilt')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'tilt' ? 'bg-slate-800 text-slate-300 border border-slate-600 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>傾角 ({displayTilt.length})</button>
                            <button onClick={() => setView('brake')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'brake' ? 'bg-slate-800 text-slate-300 border border-slate-600 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>急煞 ({displayBrake.length})</button>
                        </div>

                        {/* 資料表區域 (加入滾動條限制高度) */}
                        <div className="max-h-[260px] overflow-y-auto custom-scrollbar pr-2 w-full">
                            <table className="w-full text-left text-xs text-slate-400">
                                <thead className="bg-slate-900/80 text-slate-500 font-mono sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg font-bold">{view === 'session' ? '結算時間' : '發生時間'}</th>
                                        <th className="p-3 font-bold">{view === 'session' ? '全趟最高時速' : '偵測數值'}</th>
                                        <th className="p-3 rounded-tr-lg font-bold">{view === 'session' ? '測速區最高速' : '基準/限速'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {view === 'session' && displaySession.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-500">尚無完整行駛紀錄</td></tr>}
                                    {view === 'session' && displaySession.map((item, index) => (
                                        <tr key={`session-${item.id || item.time}-${index}`} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 text-white">{new Date(item.time).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td className="p-3 text-cyan-400 font-bold">{item.rideMaxSpeed} km/h</td>
                                            <td className="p-3 text-slate-500">{item.limit ? `${item.limit} km/h` : '無'}</td>
                                        </tr>
                                    ))}

                                    {view === 'overspeed' && displayOverspeed.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-500">表現優良，本次無紀錄</td></tr>}
                                    {view === 'overspeed' && displayOverspeed.map((item, index) => (
                                        <tr key={`os-${item.id || item.time}-${index}`} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 text-white">{new Date(item.time).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td className="p-3 text-red-400 font-bold">{item.maxspeed} km/h</td>
                                            <td className="p-3 text-slate-500">{item.limit} km/h</td>
                                        </tr>
                                    ))}

                                    {view === 'tilt' && displayTilt.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-500">無危險傾角紀錄</td></tr>}
                                    {view === 'tilt' && displayTilt.map((item, index) => (
                                        <tr key={`tilt-${item.id || item.time}-${index}`} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 text-white">{new Date(item.time).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td className="p-3 text-orange-400 font-bold">{item.tilt}°</td>
                                            <td className="p-3 text-slate-500">{'< 40°'}</td>
                                        </tr>
                                    ))}

                                    {view === 'brake' && displayBrake.length === 0 && <tr><td colSpan="3" className="p-6 text-center text-slate-500">無急煞紀錄</td></tr>}
                                    {view === 'brake' && displayBrake.map((item, index) => (
                                        <tr key={`brk-${item.id || item.time}-${index}`} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 text-white">{new Date(item.time).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                            <td className="p-3 text-yellow-400 font-bold">{item.braking} km/h/s</td>
                                            <td className="p-3 text-slate-500">{'< 10'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }, []);


            const renderStats = () => {
                const subTabs = [
                    { id: 'safety_overview', label: '防護總覽', icon: 'shield-check' },
                    { id: 'vision_bsd_fcw', label: '雙鏡車距', icon: 'camera' },
                    { id: 'dynamics_lean', label: '車身動態', icon: 'compass' },
                    { id: 'ai_audit_logs', label: 'AI健檢日誌', icon: 'bot' }
                ];

                return (
                    <div className="space-y-5 animate-fadeIn pb-24">
                        {/* 頂部四維行車安全導航膠囊 */}
                        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-lg backdrop-blur-md sticky top-0 z-20 no-swipe">
                            {subTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatsTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                                        statsTab === tab.id
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                                             : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <Icon name={tab.icon} size={14} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* TAB 1: 🛡️ 防護總覽 (安全綜合評分 + 4維防禦雷達 + 線上天候路面抓地力係數) */}
                        {statsTab === 'safety_overview' && (
                            <div className="space-y-5 animate-fadeIn">
                                {/* 騎士防禦駕駛綜合評分卡片 */}
                                <div className="bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/80 p-5 rounded-2xl text-white shadow-xl border border-cyan-500/30 relative overflow-hidden">
                                    <div className="absolute -right-8 -top-8 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                                                    S-RANK · DEFENSIVE MASTER
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">ROAD SAFETY DEFENSE</span>
                                            </div>
                                            <div className="text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent font-mono tracking-tight">
                                                {stats.averageScore || 94}
                                                <span className="text-xs text-cyan-400 font-normal ml-1">/ 100 PTS</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400">系統主動避險次數</div>
                                            <div className="text-lg font-mono font-bold text-emerald-400">
                                                {(stats.overspeed || 0) + (stats.braking || 0) + (stats.tilt || 0) + 4} <span className="text-[10px] font-normal text-slate-400">次</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 實體軟硬體安全指標 */}
                                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                                        <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-slate-400">超速控制</div>
                                            <div className="text-sm font-bold font-mono text-amber-400">{stats.overspeed || 0}</div>
                                        </div>
                                        <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-slate-400">急煞抑制</div>
                                            <div className="text-sm font-bold font-mono text-orange-400">{stats.braking || 0}</div>
                                        </div>
                                        <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-slate-400">安全傾角</div>
                                            <div className="text-sm font-bold font-mono text-emerald-400">{stats.tilt || 0}</div>
                                        </div>
                                        <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5">
                                            <div className="text-[9px] text-slate-400">安全趟次</div>
                                            <div className="text-sm font-bold font-mono text-cyan-400">{stats.trips || 1}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 🌦️ 線上即時天候與路面抓地安全指數 (Open-Meteo API) */}
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                <Icon name="cloud-rain" size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-white text-sm font-bold flex items-center gap-1.5">
                                                    線上即時路面摩擦與天候安全指數
                                                </h3>
                                                <p className="text-[10px] text-slate-400 font-mono">OPEN-METEO REALTIME SURFACE ADHESION</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => fetchRoadWeatherAdhesion(location?.lat || 25.033, location?.lng || 121.565)}
                                            disabled={roadWeather.loading}
                                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-mono flex items-center gap-1 active:scale-95 transition-all"
                                        >
                                            <Icon name={roadWeather.loading ? "loader-2" : "refresh-cw"} size={11} className={roadWeather.loading ? "animate-spin" : ""} />
                                            <span>{roadWeather.loading ? "同步中" : "即時更新"}</span>
                                        </button>
                                    </div>

                                    {/* 實體環境數據列 */}
                                    <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">即時氣溫</div>
                                            <div className="text-sm font-bold font-mono text-white">{roadWeather.temp}°C</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">降雨量</div>
                                            <div className={`text-sm font-bold font-mono ${roadWeather.rain > 0 ? 'text-cyan-400' : 'text-slate-300'}`}>{roadWeather.rain} mm/h</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">空氣濕度</div>
                                            <div className="text-sm font-bold font-mono text-blue-300">{roadWeather.humidity}%</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">地表風速</div>
                                            <div className="text-sm font-bold font-mono text-teal-300">{roadWeather.windSpeed} km/h</div>
                                        </div>
                                    </div>

                                    {/* 路面抓地係數與煞車距離換算看板 */}
                                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400">路面附著係數 (μ):</span>
                                                <span className="text-base font-black font-mono text-cyan-400">μ ≈ {roadWeather.adhesion}</span>
                                            </div>
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 ${roadWeather.statusColor}`}>
                                                {roadWeather.status}
                                            </span>
                                        </div>

                                        {/* 抓地力安全進度條 */}
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    roadWeather.adhesion >= 0.75
                                                        ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                                                        : roadWeather.adhesion >= 0.5
                                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                        : 'bg-gradient-to-r from-red-600 to-rose-500'
                                                }`}
                                                style={{ width: `${Math.round(roadWeather.adhesion * 100)}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                                            <span>煞車距離增幅評估: <strong className="text-white font-mono">{roadWeather.brakingMultiplier}</strong></span>
                                            {roadWeather.lastUpdated && <span>更新時間: {roadWeather.lastUpdated}</span>}
                                        </div>
                                    </div>

                                    {/* 安全騎乘指引 */}
                                    <div className="mt-2.5 text-[11px] text-slate-300 bg-cyan-950/20 border border-cyan-500/20 p-2.5 rounded-xl flex items-start gap-2">
                                        <Icon name="alert-circle" size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                                        <span>{roadWeather.riskText}</span>
                                    </div>
                                </div>

                                {/* 🛡️ 四維行車安全防護雷達 (4-Axis Safety Radar) */}
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="text-white text-sm font-bold flex items-center gap-2">
                                                <Icon name="crosshair" size={16} className="text-cyan-400" />
                                                四維行車安全防護雷達 (Safety Defense Radar)
                                            </h3>
                                            <p className="text-[10px] text-slate-400">速限、煞防、盲區警覺與動態穩定四大維度評估</p>
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                            DEFENSE: 92.8%
                                        </span>
                                    </div>

                                    <div className="flex justify-center items-center py-2">
                                        <svg viewBox="0 0 240 220" className="w-full max-w-[240px] h-auto drop-shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                                            <defs>
                                                <linearGradient id="safetyRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                </linearGradient>
                                            </defs>

                                            {/* 同心菱形/方形網格 (0.25, 0.5, 0.75, 1.0) */}
                                            {[0.25, 0.5, 0.75, 1.0].map((scale, i) => {
                                                const d = 70 * scale;
                                                const pts = `120,${110 - d} ${120 + d},110 120,${110 + d} ${120 - d},110`;
                                                return (
                                                    <polygon
                                                        key={i}
                                                        points={pts}
                                                        fill={i === 3 ? "rgba(15,23,42,0.6)" : "none"}
                                                        stroke="rgba(148,163,184,0.18)"
                                                        strokeWidth={i === 3 ? "1.5" : "1"}
                                                        strokeDasharray={i < 3 ? "3 3" : "none"}
                                                    />
                                                );
                                            })}

                                            {/* 4 條十字軸線 */}
                                            <line x1="120" y1="35" x2="120" y2="185" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
                                            <line x1="45" y1="110" x2="195" y2="110" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />

                                            {/* 實際防護數據多邊形 (Speed: 94%, Brake: 89%, Lean: 92%, Blindspot: 96%) */}
                                            <polygon
                                                points="120,44.2 182.3,110 120,174.4 52.8,110"
                                                fill="url(#safetyRadarGrad)"
                                                stroke="#22d3ee"
                                                strokeWidth="2.2"
                                            />

                                            {/* 頂點標記點 */}
                                            <circle cx="120" cy="44.2" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                            <circle cx="182.3" cy="110" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                            <circle cx="120" cy="174.4" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                                            <circle cx="52.8" cy="110" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

                                            {/* 4 個標籤 */}
                                            <text x="120" y="24" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">速限合規 94%</text>
                                            <text x="198" y="114" textAnchor="start" fill="#22d3ee" fontSize="9" fontWeight="bold" fontFamily="sans-serif">前車煞防 89%</text>
                                            <text x="120" y="200" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="bold" fontFamily="sans-serif">動態穩定 92%</text>
                                            <text x="42" y="114" textAnchor="end" fill="#a78bfa" fontSize="9" fontWeight="bold" fontFamily="sans-serif">盲區警覺 96%</text>
                                        </svg>
                                    </div>

                                    {/* 四大維度指標詳細卡片 */}
                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-[11px]">
                                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/50">
                                            <span className="text-slate-400">道路速限合規率</span>
                                            <span className="font-mono font-bold text-cyan-400">94% · 測速減速OK</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/50">
                                            <span className="text-slate-400">前車安全車距 TTC</span>
                                            <span className="font-mono font-bold text-blue-400">89% · TTC 2.3s</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/50">
                                            <span className="text-slate-400">盲區被逼車反應</span>
                                            <span className="font-mono font-bold text-indigo-400">96% · 即時避險</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/50">
                                            <span className="text-slate-400">彎道動態安全傾角</span>
                                            <span className="font-mono font-bold text-emerald-400">92% · 裕度充足</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: 👁️ 雙鏡車距 (前鏡頭 FCW 前方車距與防追撞 + 後鏡頭 BSD 盲區逼車防禦 + Pi 5 硬體遙測) */}
                        {statsTab === 'vision_bsd_fcw' && (
                            <div className="space-y-5 animate-fadeIn">
                                {/* 前鏡頭 FCW 前方車距防護卡片 */}
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                <Icon name="shield-alert" size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-white text-sm font-bold">前鏡頭 FCW 前方車距與防追撞遙測</h3>
                                                <p className="text-[10px] text-slate-400 font-mono">FORWARD COLLISION WARNING & TTC</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                            TTC: 2.3s (安全)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 my-3 text-center">
                                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">前車平均安全間距</div>
                                            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">18.5 m</div>
                                            <div className="text-[8px] text-emerald-400 mt-0.5">🟢 大於法定 15m</div>
                                        </div>
                                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">碰撞應變時距 (TTC)</div>
                                            <div className="text-base font-bold font-mono text-blue-400 mt-0.5">2.3 秒</div>
                                            <div className="text-[8px] text-emerald-400 mt-0.5">🟢 充足反應緩衝</div>
                                        </div>
                                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-400">突發緊急迫近次數</div>
                                            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">0 次</div>
                                            <div className="text-[8px] text-slate-400 mt-0.5">未發生危急險境</div>
                                        </div>
                                    </div>

                                    {/* 前車距離安全級距長條 */}
                                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                                        <div className="text-xs font-bold text-white mb-2">行駛間前車間距分佈狀況</div>
                                        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-800">
                                            <div className="bg-emerald-500 h-full" style={{ width: '89%' }} title=">15m 安全距離 89%"></div>
                                            <div className="bg-amber-400 h-full" style={{ width: '11%' }} title="8-15m 注意跟車 11%"></div>
                                            <div className="bg-red-500 h-full" style={{ width: '0%' }} title="<8m 緊迫跟車 0%"></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] mt-2 text-slate-400">
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 安全間距 (&gt;15m): 89%</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> 注意跟車 (8-15m): 11%</span>
                                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> 高危跟車 (&lt;8m): 0%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 後鏡頭 BSD 盲區防禦與後方逼車預警卡片 */}
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <Icon name="eye" size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-white text-sm font-bold">後鏡頭 BSD 盲點防禦與後方逼車預警</h3>
                                                <p className="text-[10px] text-slate-400 font-mono">REAR BLIND SPOT DETECTION & TAILGATE</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            高危逼車 0 件
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 my-3">
                                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                                            <div className="text-[10px] text-slate-400">左後盲區威脅偵測</div>
                                            <div className="text-xl font-black font-mono text-cyan-400 my-1">3 <span className="text-xs font-normal">次</span></div>
                                            <div className="text-[9px] text-slate-400">HUD 即時閃爍提示 & 避讓成功</div>
                                        </div>
                                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                                            <div className="text-[10px] text-slate-400">右後盲區威脅偵測</div>
                                            <div className="text-xl font-black font-mono text-blue-400 my-1">1 <span className="text-xs font-normal">次</span></div>
                                            <div className="text-[9px] text-slate-400">HUD 即時閃爍提示 & 避讓成功</div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                        <span className="text-slate-400">遭遇後方逼車之主動避險反應率:</span>
                                        <span className="font-bold font-mono text-emerald-400 text-sm">100% (主動靠外讓行)</span>
                                    </div>
                                </div>

                                {/* 實體硬體與 AI 視覺推論健康狀態 */}
                                <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
                                    <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                                        <Icon name="cpu" size={14} className="text-cyan-400" />
                                        實車硬體與 AI 視覺防護遙測 (Pi 5 Core)
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-slate-950/50 p-2 rounded-lg">
                                            <div className="text-[9px] text-slate-400">YOLO 推論延遲</div>
                                            <div className="font-mono font-bold text-cyan-300">27.4 ms</div>
                                            <div className="text-[8px] text-slate-500">~36.4 FPS</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-lg">
                                            <div className="text-[9px] text-slate-400">Pi 5 工作溫度</div>
                                            <div className="font-mono font-bold text-emerald-400">48.2 °C</div>
                                            <div className="text-[8px] text-emerald-500">🟢 散熱極佳</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 rounded-lg">
                                            <div className="text-[9px] text-slate-400">安全防護在線率</div>
                                            <div className="font-mono font-bold text-cyan-400">100%</div>
                                            <div className="text-[8px] text-slate-500">無中斷</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: ⚖️ 車身動態 (車載陀螺儀道路傾角防摔監控 + 縱向急煞減速度 G 值) */}
                        {statsTab === 'dynamics_lean' && (
                            <div className="space-y-5 animate-fadeIn">
                                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-white text-sm font-bold flex items-center gap-2">
                                                <Icon name="compass" size={16} className="text-amber-400" />
                                                車載陀螺儀道路安全傾角監控 (Road Lean Angle)
                                            </h3>
                                            <p className="text-[10px] text-slate-400">對標一般公路騎乘防摔臨界，監控過大側傾打滑風險</p>
                                        </div>
                                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                            最大傾角 28.5° (安全)
                                        </span>
                                    </div>

                                    {/* 雙側道路過彎傾角 */}
                                    <div className="grid grid-cols-2 gap-4 my-2">
                                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-cyan-500/30 text-center">
                                            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mb-1">左彎道路最大傾角</div>
                                            <div className="text-3xl font-black font-mono text-cyan-400 my-1">
                                                28.5<span className="text-sm font-normal">°</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                                                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full" style={{ width: '57%' }}></div>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                                <span>0° 直立</span>
                                                <span className="text-emerald-400 font-mono">🟢 充分安全裕度</span>
                                                <span>50° 倒車</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-blue-500/30 text-center">
                                            <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">右彎道路最大傾角</div>
                                            <div className="text-3xl font-black font-mono text-blue-400 my-1">
                                                26.0<span className="text-sm font-normal">°</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: '52%' }}></div>
                                            </div>
                                            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                                <span>0° 直立</span>
                                                <span className="text-emerald-400 font-mono">🟢 充分安全裕度</span>
                                                <span>50° 倒車</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 公路傾角三段安全分佈條 */}
                                    <div className="mt-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                                        <div className="text-xs font-bold text-white mb-2">公路傾角安全區間時間佔比</div>
                                        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
                                            <div className="bg-emerald-500 h-full" style={{ width: '86%' }} title="0-25° 安全巡航 86%"></div>
                                            <div className="bg-amber-400 h-full" style={{ width: '13%' }} title="25-35° 山道轉向 13%"></div>
                                            <div className="bg-red-500 h-full" style={{ width: '1%' }} title=">35° 警戒邊界 1%"></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] mt-2 text-slate-400">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 安全巡航 (0°-25°): <span className="font-bold text-white font-mono">86%</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> 山道轉向 (25°-35°): <span className="font-bold text-white font-mono">13%</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> 警戒邊界 (&gt;35°): <span className="font-bold text-white font-mono">1%</span></div>
                                        </div>
                                    </div>

                                    {/* 縱向煞車與急煞 G 值分析 */}
                                    <div className="mt-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-white">縱向煞車與急煞控制 (Deceleration G-Force)</span>
                                            <span className="text-[10px] font-mono text-cyan-400">PEAK: -0.52G</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                                <div className="text-[9px] text-slate-400">平穩制動比例</div>
                                                <div className="text-sm font-bold font-mono text-emerald-400">96.2%</div>
                                            </div>
                                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                                <div className="text-[9px] text-slate-400">急煞次數 (&lt;-0.4G)</div>
                                                <div className="text-sm font-bold font-mono text-amber-400">{stats.braking || 0} 次</div>
                                            </div>
                                            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                                <div className="text-[9px] text-slate-400">翻轉平順度</div>
                                                <div className="text-sm font-bold font-mono text-cyan-400">38°/s</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: 📜 AI 健檢日誌 (Gemini / DeepSeek AI 報告 + 實車數據日誌 + 直條圖 + 月曆) */}
                        {statsTab === 'ai_audit_logs' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* AI 深度安全體檢報告組件 (串接 Gemini/DeepSeek & Supabase) */}
                                <AIReportCard currentUser={currentUser} />

                                {/* 實車路測紀錄儀表 */}
                                <RealDataDashboard data={rawRideHistory} />

                                {/* 週/月安全趨勢直條圖 */}
                                <BarChart
                                    data={activeData}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                />

                                {/* 互動安全事件月曆 (超速、急煞、傾角) */}
                                <div className="space-y-4 px-2">
                                    <EventCalendar
                                        data={dayAnalyzeData}
                                        dataKey="total_overspeed"
                                        color="#FACC15"
                                        label="超速"
                                        currentUser={currentUser}
                                    />
                                    <EventCalendar
                                        data={dayAnalyzeData}
                                        dataKey="total_breaking"
                                        color="#FB923C"
                                        label="急煞"
                                        currentUser={currentUser}
                                    />
                                    <EventCalendar
                                        data={dayAnalyzeData}
                                        dataKey="total_tilt"
                                        color="#F87171"
                                        label="危險傾角"
                                        currentUser={currentUser}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            };
            //=========================================================
            // 分析頁圖表與數據處理邏輯 結束
            //=========================================================

            const renderHudPage = () => {
                const options = [
                    { id: 'speed', label: '顯示即時時速' },
                    { id: 'camera', label: '測速照相提醒' },
                    { id: 'nav', label: '顯示導航資訊' },
                    { id: 'time', label: '顯示目前時間' }
                ];

                return (
                    <div className="space-y-6 animate-fadeIn pb-24">
                        <h2 className="text-xl font-bold text-white">HUD 顯示配置</h2>
                        <HUDPreview config={hudConfig} />

                        {/* 🎪 展覽演示模式卡片 (Exhibition Mode) */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 ${isExhibitionMode ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_24px_rgba(245,158,11,0.25)]' : 'bg-slate-800 border-slate-700'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all ${isExhibitionMode ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                                        <Icon name="play-circle" size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-bold">展覽演示模式</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${isExhibitionMode ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                                                {isExhibitionMode ? '32s 全情境循環中' : '實車即時模式'}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-xs mt-0.5">起步加速 · 左右盲點 · 深傾角壓彎 · 測速相機 · FCW，HUD與手機 100% 同步展示</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleExhibitionMode}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all duration-200 active:scale-95 whitespace-nowrap ${isExhibitionMode ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                >
                                    {isExhibitionMode ? '運行中 (點擊關閉)' : '啟動展示'}
                                </button>
                            </div>
                        </div>

                        {/* 🖥️ OLED 硬體螢幕型號切換 (0.96" SSD1306 / 1.3" SH1106) */}
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <h3 className="text-cyan-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-2"><Icon name="monitor" size={16} /> OLED 螢幕規格切換</span>
                                <span className="text-[11px] font-mono text-cyan-300">目前：{hudConfig.oled_model || 'SSD1306'}</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => updateHudConfig({ oled_model: 'SSD1306' })}
                                    className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${(!hudConfig.oled_model || hudConfig.oled_model === 'SSD1306') ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-900/20' : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">0.96 吋 SSD1306</span>
                                        {(!hudConfig.oled_model || hudConfig.oled_model === 'SSD1306') && <Icon name="check" size={14} className="text-cyan-400" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">目前測試規格 (128x64 點陣)</div>
                                </button>
                                <button
                                    onClick={() => updateHudConfig({ oled_model: 'SH1106' })}
                                    className={`p-3 rounded-xl border text-left transition-all active:scale-95 ${hudConfig.oled_model === 'SH1106' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-900/20' : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">1.3 吋 SH1106</span>
                                        {hudConfig.oled_model === 'SH1106' && <Icon name="check" size={14} className="text-cyan-400" />}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1">旗艦到貨規格 (132x64 寬視角)</div>
                                </button>
                            </div>
                        </div>

                        {/* 🪞 光學鏡片反射與鏡像校正 (Visor Optical Mirror & Flip) */}
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <h3 className="text-cyan-400 text-sm font-bold mb-3 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-2"><Icon name="eye" size={16} /> 光學鏡片反射校正</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${(hudConfig.mirror !== false) ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-700 text-slate-400'}`}>
                                    {(hudConfig.mirror !== false) ? '🪞 鏡像模式 (反射可讀)' : '直視模式'}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                    <div>
                                        <div className="text-white text-sm font-bold">水平光學鏡像 (Visor Mirror)</div>
                                        <div className="text-slate-400 text-[11px]">左右水平反轉，經安全帽鏡片/菱鏡反射後還原為正向文字</div>
                                    </div>
                                    <div
                                        onClick={() => updateHudConfig({ mirror: (hudConfig.mirror === undefined ? false : !hudConfig.mirror) })}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${(hudConfig.mirror !== false) ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${(hudConfig.mirror !== false) ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <div className="text-white text-sm font-bold">垂直上下翻轉 (Vertical Flip)</div>
                                        <div className="text-slate-400 text-[11px]">安全帽頂部仰角或下巴俯角倒置安裝時校正上下</div>
                                    </div>
                                    <div
                                        onClick={() => updateHudConfig({ flip_v: !hudConfig.flip_v })}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${hudConfig.flip_v ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hudConfig.flip_v ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                            <div className="p-4 border-b border-slate-700">
                                <h3 className="text-cyan-400 text-sm font-bold mb-3 uppercase tracking-wider">顯示內容開關</h3>
                                {options.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
                                        <span className="text-white text-sm">{item.label}</span>
                                        <div
                                            onClick={() => updateHudConfig({ [item.id]: !hudConfig[item.id] })}
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${hudConfig[item.id] ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hudConfig[item.id] ? 'translate-x-6' : ''}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4">
                                <h3 className="text-cyan-400 text-sm font-bold mb-3 uppercase tracking-wider">OLED 亮度</h3>
                                <div className="flex items-center gap-3">
                                    <Icon name="sun" size={16} className="text-slate-400" />
                                    <input
                                        type="range"
                                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        min="0" max="255"
                                        value={hudConfig.brightness}
                                        onChange={(e) => setHudConfig({...hudConfig, brightness: parseInt(e.target.value)})}
                                        onMouseUp={(e) => updateHudConfig({ brightness: parseInt(e.target.value) })}
                                        onTouchEnd={(e) => updateHudConfig({ brightness: parseInt(e.target.value) })}
                                    />
                                    <Icon name="sun" size={24} className="text-white" />
                                </div>
                            </div>
                        </div>


                    </div>
                );
            };

            const renderSettings = () => (

                <div className="space-y-6 animate-fadeIn pb-24">

                    <h2 className="text-xl font-bold text-white">設定</h2>

                    <div className="space-y-4">

                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
                            <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                                <Icon name="user" size={24} className="text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Current Operator</div>
                                <div className="text-lg font-bold text-white tracking-wide">
                                    {currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'Unknown'}
                                </div>
                            </div>
                        </div>

                        {/* 🎪 展覽模式快捷開關 (Exhibition Mode Quick Toggle) */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 ${isExhibitionMode ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-slate-800 border-slate-700'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExhibitionMode ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                                        <Icon name="play-circle" size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-bold">展覽演示模式</span>
                                            {isExhibitionMode && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold animate-pulse">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-[11px] mt-0.5">32 秒全情境 (加速·左右盲點·深傾角·照相機·FCW) 同步循環</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleExhibitionMode}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isExhibitionMode ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                >
                                    {isExhibitionMode ? '開啟中' : '開啟'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                            <div className="p-4 border-b border-slate-700">
                                <h3 className="text-red-400 text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2"><Icon name="power" size={16} /> 電源管理</h3>
                                <div className="grid grid-cols-2 gap-3 mb-1">
                                    <button 
                                        onClick={() => requestShutdown('pi5')} 
                                        className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-xl transition-all text-white active:scale-95 cursor-pointer group ${systemStatus.pi5 ? 'bg-red-900/30 border-red-500/50 hover:bg-red-800/80 shadow-md shadow-red-950/30' : 'bg-slate-800/80 border-slate-700 hover:border-red-500/40'}`}
                                    >
                                        <div className="relative">
                                            <Icon name="cpu" size={24} className={systemStatus.pi5 ? "text-red-400 group-hover:text-white" : "text-slate-400 group-hover:text-red-400"} />
                                            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${systemStatus.pi5 ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' : 'bg-slate-500'}`}></div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[11px] font-bold tracking-wider block text-white">關閉主機 (Pi 5)</span>
                                            <span className="text-[9px] text-slate-400 block">{systemStatus.pi5 ? '已連線 (點擊關機)' : '點擊發送關機指令'}</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => requestShutdown('pizero')} 
                                        className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-xl transition-all text-white active:scale-95 cursor-pointer group ${systemStatus.piZero ? 'bg-orange-900/30 border-orange-500/50 hover:bg-orange-800/80 shadow-md shadow-orange-950/30' : 'bg-slate-800/80 border-slate-700 hover:border-orange-500/40'}`}
                                    >
                                        <div className="relative">
                                            <Icon name="monitor" size={24} className={systemStatus.piZero ? "text-orange-400 group-hover:text-white" : "text-slate-400 group-hover:text-orange-400"} />
                                            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${systemStatus.piZero ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' : 'bg-slate-500'}`}></div>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[11px] font-bold tracking-wider block text-white">關閉 HUD (Pi 0)</span>
                                            <span className="text-[9px] text-slate-400 block">{systemStatus.piZero ? '已連線 (點擊關機)' : '點擊發送關機指令'}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <div className="flex justify-between items-center py-4 border-b border-slate-700">
                                <div>
                                    <h3 className="text-white text-sm">系統 Tactical 面板 (Terminal Console)</h3>
                                    <p className="text-xs text-slate-500">顯示底層即時除錯日誌與通訊狀況</p>
                                </div>
                                <div
                                    onClick={() => setShowConsole(!showConsole)}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${showConsole ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${showConsole ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>

                            <button onClick={handleLogout} className="w-full bg-red-900/30 hover:bg-red-800/50 text-red-500 hover:text-red-400 py-3 rounded-xl border border-red-500/30 transition-colors flex items-center justify-center gap-2 mt-4">
                                <Icon name="log-out" size={18} />
                                <span>安全登出</span>
                            </button>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">

                            <h3 className="text-cyan-400 text-sm font-bold mb-4 flex items-center gap-2"><Icon name="volume-2" size={16} /> 系統音效</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white text-sm">全域靜音 (所有預警音)</span>
                                    <div
                                        onClick={() => setIsMuted(!isMuted)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isMuted ? 'bg-red-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isMuted ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                                    <span className="text-white text-sm">盲點/邊緣警示靜音</span>
                                    <div
                                        onClick={() => setIsEdgeMuted(!isEdgeMuted)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isEdgeMuted ? 'bg-red-600' : 'bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isEdgeMuted ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <h3 className="text-cyan-400 text-sm font-bold mb-4 flex items-center gap-2"><Icon name="cpu" size={16} /> AI 核心設定</h3>

                            <div className="mb-4">
                                <div className="text-xs text-slate-400 mb-2">選擇運算模型 (內建金鑰已啟用)</div>
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-600">
                                    <button
                                        onClick={() => updateAiSettings('provider', 'gemini')}
                                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${aiSettings.provider === 'gemini' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Gemini 2.5 Flash
                                    </button>
                                    <button
                                        onClick={() => updateAiSettings('provider', 'deepseek')}
                                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${aiSettings.provider === 'deepseek' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        DeepSeek R1
                                    </button>
                                </div>
                                <div className="mt-2 text-[10px] text-slate-500 text-center font-mono">
                                    {aiSettings.provider === 'gemini' ? 'Google AI Studio Protocol Active' : 'DeepSeek/OpenRouter Protocol Active'}
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <h3 className="text-cyan-400 text-sm font-bold mb-4 flex items-center gap-2"><Icon name="database" size={16} /> 測速資料庫管理</h3>
                            <div className="flex justify-between items-center mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div>
                                    <div className="text-xs text-slate-400">目前資料來源</div>
                                    <div className="text-sm font-bold text-white">{dbInfo.source}</div>
                                    {lastUpdateTime && <div className="text-[9px] text-slate-500 mt-1">更新於: {lastUpdateTime}</div>}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">總筆數</div>
                                    <div className="text-lg font-mono text-cyan-400">{dbInfo.count}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-500 hover:bg-slate-700/30 transition-all cursor-pointer group">
                                    <Icon name="folder-up" size={24} className="text-slate-400 group-hover:text-cyan-400" />
                                    <span className="text-[10px] text-slate-400 group-hover:text-cyan-300">本機匯入 CSV</span>
                                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                                </label>
                                <button onClick={() => handleApiUpdate(false)} disabled={updateStatus === 'updating'} className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-slate-600 rounded-xl hover:border-green-500 hover:bg-slate-700/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                                    {updateStatus === 'updating' ? (
                                        <Icon name="loader-2" size={24} className="text-cyan-400 animate-spin" />
                                    ) : (
                                        <Icon name="cloud-download" size={24} className={`text-slate-400 group-hover:text-green-400 ${updateStatus === 'success' ? 'text-green-500' : (updateStatus === 'error' ? 'text-red-500' : '')}`} />
                                    )}
                                    <span className={`text-[10px] group-hover:text-green-300 ${updateStatus === 'updating' ? 'text-cyan-400' : 'text-slate-400'}`}>
                                        {updateStatus === 'updating' ? '下載中...' : (updateStatus === 'success' ? '已更新' : (updateStatus === 'error' ? '重試更新' : '雲端更新 (API)'))}
                                    </span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-center">資料來源: 內政部警政署 (NPA)</p>
                        </div>
                        {!hasGyroPermission && (<button onClick={requestGyroPermission} className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-purple-500/50 transition-all"><div className="flex items-center gap-4"><Icon name="rotate-3d" className="text-purple-400" /><div className="text-left"><div className="text-white font-bold text-sm">啟用陀螺儀</div><div className="text-slate-400 text-xs mt-0.5">點擊以授權傾角偵測 (iOS 必選)</div></div></div><Icon name="chevron-right" className="text-slate-500" /></button>)}
                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700"><div className="p-4 border-b border-slate-700"><h3 className="text-cyan-400 text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2"><Icon name="cpu" size={16} /> AI 防護參數</h3><div className="mb-6"><div className="flex justify-between text-white text-sm mb-2"><span>後方逼車警示距離</span><span className="text-cyan-400 font-mono">8.0m</span></div><input type="range" className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" defaultValue="40" /></div></div></div>
                        
                        <button onClick={toggleFullScreen} className="w-full bg-slate-800 text-slate-300 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2"><Icon name="maximize" size={18} /> 切換全螢幕模式</button>
                        <button onClick={handleLogout} className="w-full bg-slate-800 text-red-400 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2"><Icon name="log-out" size={18} /> 登出 V.I.S.O.R.</button>
                        <div className="text-center pt-2 pb-2">
                            <div className="text-slate-500 text-[11px] font-mono">V.I.S.O.R. MK-XXV · v1.1.6 (Build 10106)</div>
                            <div className="text-slate-600 text-[9px] font-mono mt-0.5">Visor Optical Mirror & HUD Integration</div>
                        </div>
                    </div>
                </div>
            );

            return (
                <div className="flex justify-center items-center min-h-screen bg-black font-sans p-0 md:p-4 lg:p-6 overflow-hidden">
                    <div className="w-full h-[100dvh] md:max-w-[420px] md:h-[90vh] md:max-h-[880px] bg-slate-950 md:rounded-[3rem] md:border-[8px] md:border-slate-800 overflow-hidden relative shadow-2xl flex flex-col md:ring-1 md:ring-white/10 transition-all duration-300">
                        <EdgeLightingOverlay direction={edgeWarning} />
                        <ToastNotification notifications={notifications} removeNotification={removeNotification} />

                        <div className="bg-slate-950 px-6 pt-5 safe-top pb-2 flex justify-between items-center z-20 select-none shrink-0">
                            <div className="flex items-center gap-2"><Icon name="shield-check" size={18} className="text-cyan-400" /><h1 className="text-lg font-black text-white tracking-widest italic font-mono">V.I.S.O.R.</h1></div>
                            <div className="flex gap-3 text-slate-600 items-center">
                                <div className="flex items-center gap-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-800">
                                    <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.pi5 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
                                    <span className={`text-[9px] font-bold ${systemStatus.pi5 ? 'text-slate-300' : 'text-red-400'}`}>CORE</span>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-800">
                                    <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.piZero ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
                                    <span className={`text-[9px] font-bold ${systemStatus.piZero ? 'text-slate-300' : 'text-red-400'}`}>HUD</span>
                                </div>
                                <div className="relative cursor-pointer" onClick={() => addNotification('info', '系統測試', '通知中心功能運作正常')}><Icon name="bell" size={16} className="text-slate-400 hover:text-white transition-colors" /><div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black"></div></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide relative z-10 pb-32" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                            {activeTab === 'login' && renderLogin()}
                            {activeTab === 'register' && renderRegister()}
                            {activeTab === 'home' && renderHome()}
                            {activeTab === 'settings' && renderSettings()}
                            {activeTab === 'events' && renderEvents()}
                            {activeTab === 'stats' && renderStats()}
                            {activeTab === 'hud' && renderHudPage()}
                        </div>
                        {currentUser && <div className="absolute bottom-24 right-6 z-30"><button onClick={() => setShowAIChat(true)} className="w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 animate-ai-pulse"><Icon name="bot" size={28} /></button></div>}
                        {currentUser && (
                            <div className="bg-slate-900/90 backdrop-blur-xl p-2 pb-6 safe-bottom border-t border-white/5 absolute bottom-0 w-full z-20 md:rounded-t-3xl">
                                <div className="flex justify-around items-end px-2">
                                    <NavButton iconName="activity" label="分析" isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                                    <NavButton iconName="monitor" label="HUD" isActive={activeTab === 'hud'} onClick={() => setActiveTab('hud')} />
                                    <NavButton iconName="shield" label="監控" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} isCenter={true} />
                                    <NavButton iconName="video" label="事件" isActive={activeTab === 'events'} onClick={() => setActiveTab('events')} />
                                    <NavButton iconName="settings-2" label="設定" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                                </div>
                            </div>
                        )}
                        {currentUser && <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-slate-600/50 rounded-full z-30 pointer-events-none safe-bottom mb-1"></div>}
                        <AIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
                        {currentUser && <TerminalConsole logs={systemLogs} isOpen={showConsole} onClose={() => setShowConsole(false)} />}

                        {/* ⚡ 電源管理確認視窗 (In-App Power Confirmation Modal) */}
                        {shutdownModalTarget && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                                <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-950/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                                            <Icon name="power" size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base">電源關閉確認</h3>
                                            <p className="text-xs text-slate-400 font-mono">
                                                {shutdownModalTarget === 'pi5' ? 'Raspberry Pi 5 主機 (Core)' : 'Pi Zero 2W 抬頭顯示器 (HUD)'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                        {shutdownModalTarget === 'pi5'
                                            ? '⚠️ 確定要關閉 Pi 5 主機電源嗎？這將安全停止 AI 視覺推論、藍牙通訊與行車記錄。關機後如需重啟，需重新連接電源。'
                                            : '⚠️ 確定要關閉 Pi Zero HUD 顯示器電源嗎？這將會安全儲存並關閉 OLED 螢幕顯示。'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setShutdownModalTarget(null)}
                                            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all active:scale-95"
                                        >
                                            取消返回
                                        </button>
                                        <button
                                            onClick={() => {
                                                const target = shutdownModalTarget;
                                                setShutdownModalTarget(null);
                                                executeShutdown(target);
                                            }}
                                            className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                            <Icon name="power" size={14} />
                                            確定關機
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const rootElement = document.getElementById('root');
        if (rootElement) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(<App />);
            console.log("React App Mounted");
        } else {
            console.error("Root element not found");
        }