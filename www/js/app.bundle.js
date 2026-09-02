(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };
  var require_app = __commonJS({
    "www/js/app.jsx"(exports) {
      const { useState, useEffect, useMemo, useRef, useCallback } = React;
      const Recharts = window.Recharts || null;
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } = Recharts || {};
      const supabaseUrl = "https://klocpegynqrkrsggtdpa.supabase.co";
      const supabaseKey = "sb_publishable_F8milukMYwEBxDjyAOb3KQ_38jmgTpB";
      const _supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;
      if (_supabase) {
        logToScreen("V.I.S.O.R. Supabase \u96F2\u7AEF\u6A21\u7D44\u5DF2\u5C31\u7DD2");
      } else {
        logToScreen("Supabase SDK \u8F09\u5165\u5931\u6557\uFF0C\u8ACB\u6AA2\u67E5\u7DB2\u8DEF\u6216 CSP \u8A2D\u5B9A", true);
      }
      window._visorAudioCtx = null;
      const initAudioContext = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        if (!window._visorAudioCtx) window._visorAudioCtx = new AudioContext();
        return window._visorAudioCtx;
      };
      const playWarningSound = (type = "warning", repeat = 1) => __async(null, null, function* () {
        if (window._visorIsMuted) return;
        try {
          const ctx = initAudioContext();
          if (!ctx) return;
          if (ctx.state === "suspended") yield ctx.resume();
          const playOnce = (timeOffset) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            switch (type) {
              case "danger":
                oscillator.type = "triangle";
                oscillator.frequency.setValueAtTime(600, ctx.currentTime + timeOffset);
                oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + timeOffset + 0.15);
                gainNode.gain.setValueAtTime(0.4, ctx.currentTime + timeOffset);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.2);
                oscillator.start(ctx.currentTime + timeOffset);
                oscillator.stop(ctx.currentTime + timeOffset + 0.2);
                break;
              case "pass":
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(523, ctx.currentTime + timeOffset);
                oscillator.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + timeOffset + 0.1);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.4);
                oscillator.start(ctx.currentTime + timeOffset);
                oscillator.stop(ctx.currentTime + timeOffset + 0.4);
                break;
              case "overspeed":
                oscillator.type = "triangle";
                oscillator.frequency.setValueAtTime(1200, ctx.currentTime + timeOffset);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime + timeOffset);
                gainNode.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + timeOffset + 0.1);
                oscillator.start(ctx.currentTime + timeOffset);
                oscillator.stop(ctx.currentTime + timeOffset + 0.1);
                break;
              case "sos":
                oscillator.type = "triangle";
                const step = 0.5;
                const hi = 960;
                const lo = 770;
                for (let j = 0; j < 6; j++) {
                  oscillator.frequency.setValueAtTime(j % 2 === 0 ? lo : hi, ctx.currentTime + timeOffset + j * step);
                }
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime + timeOffset);
                gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + timeOffset + 0.8);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime + timeOffset + step * 6 - 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + step * 6);
                oscillator.start(ctx.currentTime + timeOffset);
                oscillator.stop(ctx.currentTime + timeOffset + step * 6);
                break;
              default:
                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(440, ctx.currentTime + timeOffset);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.3);
                oscillator.start(ctx.currentTime + timeOffset);
                oscillator.stop(ctx.currentTime + timeOffset + 0.3);
            }
          };
          for (let i = 0; i < repeat; i++) {
            let gap = 0.4;
            if (type === "danger") gap = 0.2;
            if (type === "overspeed" || type === "radar") gap = 0.15;
            playOnce(i * gap);
          }
        } catch (e) {
          console.warn("Audio warning failed:", e);
        }
      });
      const callAI = (prompt, systemInstruction = "") => __async(null, null, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
        const settingsStr = localStorage.getItem("visor_ai_settings");
        const settings = settingsStr ? JSON.parse(settingsStr) : { provider: "gemini" };
        const provider = settings.provider || "gemini";
        if (provider === "deepseek") {
          const apiKey = window.CryptoUtils.getBuiltinKey("deepseek");
          if (!apiKey) return "\u26A0\uFE0F \u7CFB\u7D71\u932F\u8AA4\uFF1A\u7121\u6CD5\u8B80\u53D6\u5167\u5EFA DeepSeek \u91D1\u9470\u3002";
          try {
            const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
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
              const err = yield response.json();
              throw new Error(((_a = err.error) == null ? void 0 : _a.message) || response.status);
            }
            const data = yield response.json();
            return ((_d = (_c = (_b = data.choices) == null ? void 0 : _b[0]) == null ? void 0 : _c.message) == null ? void 0 : _d.content) || "V.I.S.O.R. (DeepSeek) \u7121\u56DE\u61C9";
          } catch (e) {
            console.error("DeepSeek API Error:", e);
            return `\u26A0\uFE0F DeepSeek \u9023\u7DDA\u7570\u5E38\uFF1A${e.message}`;
          }
        } else {
          const apiKey = window.CryptoUtils.getBuiltinKey("gemini");
          if (!apiKey) return "\u26A0\uFE0F \u7CFB\u7D71\u932F\u8AA4\uFF1A\u7121\u6CD5\u8B80\u53D6\u5167\u5EFA Gemini \u91D1\u9470\u3002";
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } };
          try {
            const response = yield fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!response.ok) {
              const errData = yield response.json();
              throw new Error(`API Error: ${((_e = errData.error) == null ? void 0 : _e.message) || response.status}`);
            }
            const data = yield response.json();
            return ((_j = (_i = (_h = (_g = (_f = data.candidates) == null ? void 0 : _f[0]) == null ? void 0 : _g.content) == null ? void 0 : _h.parts) == null ? void 0 : _i[0]) == null ? void 0 : _j.text) || "V.I.S.O.R. Core \u7121\u6CD5\u9023\u7DDA (No Data)";
          } catch (error) {
            console.error("Gemini API Error:", error);
            return `\u26A0\uFE0F Gemini \u9023\u7DDA\u7570\u5E38\uFF1A${error.message}`;
          }
        }
      });
      const BUILT_IN_CAMERAS = [
        { address: "\u570B\u9053\u4E94\u865F\u5357\u541122.5\u516C\u91CC(\u96EA\u5C71\u96A7\u9053)", lat: 24.88923, lng: 121.761765, limit: 90, type: "fixed", direct: "\u5F80\u5357", heading: 180 },
        { address: "\u570B\u9053\u4E94\u865F\u5317\u541122.5\u516C\u91CC(\u96EA\u5C71\u96A7\u9053)", lat: 24.889566, lng: 121.762215, limit: 90, type: "fixed", direct: "\u5F80\u5317", heading: 0 },
        { address: "\u570B\u9053\u4E94\u865F\u5357\u541123.9\u516C\u91CC(\u96EA\u5C71\u96A7\u9053)", lat: 24.87876, lng: 121.76942, limit: 90, type: "fixed", direct: "\u5F80\u5357", heading: 180 },
        { address: "\u91D1\u6E56\u93AE\u9EC3\u6D77\u8DEF(\u967D\u660E\u6E56\u8DEF\u6BB5)", lat: 24.458809, lng: 118.43147, limit: 60, type: "fixed", direct: "\u5357\u5317\u96D9\u5411", heading: "ALL" }
      ];
      const toPascalCase = (str) => str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());
      const Icon = ({ name, size = 24, className = "" }) => {
        const containerRef = useRef(null);
        useEffect(() => {
          if (!window.lucide || !containerRef.current) return;
          const iconName = toPascalCase(name);
          const iconNode = window.lucide.icons[iconName];
          if (!iconNode) return;
          const svgElement = window.lucide.createElement(iconNode);
          svgElement.setAttribute("width", size);
          svgElement.setAttribute("height", size);
          if (className) svgElement.setAttribute("class", className);
          containerRef.current.innerHTML = "";
          containerRef.current.appendChild(svgElement);
        }, [name, size, className]);
        return /* @__PURE__ */ React.createElement("span", { ref: containerRef, style: { display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0 } });
      };
      const EdgeLightingOverlay = ({ direction }) => {
        if (!direction) return null;
        let lightingClass = "";
        let iconName = "alert-circle";
        let label = "WARNING";
        switch (direction) {
          case "front":
            lightingClass = "edge-light-front";
            iconName = "arrow-up-circle";
            label = "\u524D\u65B9\u78B0\u649E\u9810\u8B66";
            break;
          case "rear":
            lightingClass = "edge-light-rear";
            iconName = "arrow-down-circle";
            label = "\u5F8C\u65B9\u8FFD\u649E\u9810\u8B66";
            break;
          case "left":
            lightingClass = "edge-light-left";
            iconName = "arrow-left-circle";
            label = "\u5DE6\u5074\u76F2\u9EDE\u8B66\u793A";
            break;
          case "right":
            lightingClass = "edge-light-right";
            iconName = "arrow-right-circle";
            label = "\u53F3\u5074\u76F2\u9EDE\u8B66\u793A";
            break;
        }
        return /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 pointer-events-none z-[100] transition-all duration-200 ${lightingClass}` }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex items-center justify-center opacity-80" }, /* @__PURE__ */ React.createElement("div", { className: "bg-black/60 backdrop-blur-md border border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse" }, /* @__PURE__ */ React.createElement(Icon, { name: iconName, size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "font-bold tracking-widest" }, label))));
      };
      const SpeedCameraAlert = React.memo(({ alert: alert2, currentSpeed }) => {
        const lastSoundTimeRef = useRef(0);
        const lastCameraRef = useRef(null);
        const radarTimerRef = useRef(null);
        const isOverSpeed = alert2 ? currentSpeed > alert2.limit : false;
        const isStationary = currentSpeed < 5;
        const distance = alert2 ? alert2.distance : Infinity;
        const address = alert2 ? alert2.address : null;
        useEffect(() => {
          if (!alert2) return;
          if (isStationary) return;
          if (distance <= 0) {
            playWarningSound("pass", 1);
            return;
          }
          if (distance < 200 && distance > 0) {
            if (isOverSpeed) {
              playWarningSound("overspeed", 3);
            } else {
              playWarningSound("warning", 1);
            }
          } else if (distance >= 200 && distance < 600) {
            playWarningSound("warning", 1);
          }
        }, [address, isOverSpeed, Math.floor(distance / 50), distance <= 0, isStationary]);
        if (!alert2) return null;
        return /* @__PURE__ */ React.createElement("div", { className: `w-full rounded-xl p-3 mb-4 flex items-center gap-4 shadow-lg transition-all duration-300 border ${isOverSpeed ? "bg-red-900/90 border-red-500 animate-danger" : isStationary ? "bg-slate-800/80 border-slate-600 opacity-70" : "bg-slate-800/95 border-yellow-500/50"}` }, /* @__PURE__ */ React.createElement("div", { className: `w-14 h-14 rounded-full flex items-center justify-center shadow shrink-0 ${isOverSpeed ? "bg-white border-4 border-red-600 text-black" : "bg-slate-700 border-2 border-slate-500 text-slate-300"}` }, /* @__PURE__ */ React.createElement("span", { className: "font-black text-2xl tracking-tighter" }, alert2.limit)), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-300 text-xs font-bold flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Icon, { name: "camera", size: 14, className: isOverSpeed ? "text-red-400" : "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[150px]" }, alert2.address)), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/10" }, alert2.direct || "\u96D9\u5411")), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-1 mt-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "\u8DDD\u96E2"), /* @__PURE__ */ React.createElement("span", { className: `text-4xl font-black font-mono leading-none ${isOverSpeed ? "text-yellow-300" : "text-white"}` }, Math.round(alert2.distance)), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "m"), isStationary && /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 text-[10px] ml-2 font-bold" }, "[\u975C\u6B62\u4E2D]"), !isStationary && isOverSpeed && /* @__PURE__ */ React.createElement("span", { className: "text-yellow-300 text-xl font-bold ml-2 animate-pulse" }, "\u8ACB\u6E1B\u901F!"))));
      });
      const SOSButton = React.memo(({ currentLocation, onTrigger }) => {
        const [activating, setActivating] = useState(false);
        const [countdown, setCountdown] = useState(3);
        useEffect(() => {
          let timer;
          if (activating && countdown > 0) timer = setTimeout(() => setCountdown((c) => c - 1), 1e3);
          else if (countdown === 0) {
            if (onTrigger) onTrigger(false);
            setActivating(false);
            setCountdown(3);
          }
          return () => clearTimeout(timer);
        }, [activating, countdown, onTrigger]);
        const start = () => setActivating(true);
        const stop = () => {
          setActivating(false);
          setCountdown(3);
        };
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            onMouseDown: start,
            onMouseUp: stop,
            onMouseLeave: stop,
            onTouchStart: start,
            onTouchEnd: stop,
            className: `w-full relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-200 flex flex-row items-center justify-center gap-4 active:scale-95 select-none shadow-xl ${activating ? "bg-red-900/80 border-red-500 animate-sos" : "bg-gradient-to-r from-red-900/40 to-slate-900 border-red-500/50 hover:border-red-500"}`
          },
          activating && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-red-600/30 z-0", style: { width: `${(3 - countdown) / 3 * 100}%`, transition: "width 1s linear" } }),
          /* @__PURE__ */ React.createElement("div", { className: `p-3 rounded-full ${activating ? "bg-white text-red-600" : "bg-red-600 text-white"} transition-colors z-10` }, /* @__PURE__ */ React.createElement(Icon, { name: "phone-call", size: 32 })),
          /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-start z-10" }, /* @__PURE__ */ React.createElement("span", { className: `text-xl font-black tracking-wider ${activating ? "text-white" : "text-red-100"}` }, "E-SOS \u7DCA\u6025\u6C42\u6551"), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-red-300/80 font-mono" }, activating ? `\u91CB\u653E\u4EE5\u53D6\u6D88 (${countdown})` : "\u9577\u6309 3 \u79D2\u767C\u9001\u6C42\u6551\u8A0A\u865F"))
        );
      });
      const NavButton = React.memo(({ iconName, label, isActive, onClick, isCenter = false }) => /* @__PURE__ */ React.createElement("button", { onClick, className: `flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isCenter ? "mb-4" : "p-2 w-16 group"}` }, /* @__PURE__ */ React.createElement("div", { className: `transition-all duration-300 ${isActive ? isCenter ? "scale-110" : "-translate-y-1" : ""} ${isCenter ? "bg-cyan-600 dark:bg-cyan-900/80 w-14 h-14 flex items-center justify-center rounded-full border-2 border-cyan-400 shadow-lg dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]" : ""}` }, /* @__PURE__ */ React.createElement(Icon, { name: iconName, size: isCenter ? 28 : 24, className: isCenter ? "text-white dark:text-cyan-400" : isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300", strokeWidth: isActive || isCenter ? 2.5 : 2 })), !isCenter && /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-medium transition-all duration-300 ${isActive ? "text-cyan-600 dark:text-cyan-400 opacity-100" : "text-slate-400 dark:text-slate-500 opacity-70"}` }, label)));
      const ToastNotification = ({ notifications, removeNotification }) => {
        return /* @__PURE__ */ React.createElement("div", { className: "fixed top-20 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4" }, notifications.map((note) => /* @__PURE__ */ React.createElement("div", { key: note.id, className: `pointer-events-auto overflow-hidden w-full max-w-sm p-4 rounded-xl shadow-2xl backdrop-blur-md border flex items-start gap-3 transform transition-all duration-300 ${note.isClosing ? "animate-fadeOut" : "animate-fadeIn"} ${note.type === "danger" ? "bg-red-900/90 border-red-500 text-white" : note.type === "warning" ? "bg-yellow-900/90 border-yellow-500 text-yellow-100" : "bg-slate-800/90 border-cyan-500 text-cyan-100"}` }, /* @__PURE__ */ React.createElement("div", { className: `w-8 h-8 flex items-center justify-center shrink-0 rounded-full ${note.type === "danger" ? "bg-red-500 text-white" : note.type === "warning" ? "bg-yellow-500 text-black" : "bg-cyan-500 text-black"}` }, /* @__PURE__ */ React.createElement(Icon, { name: note.type === "danger" ? "alert-octagon" : note.type === "warning" ? "alert-triangle" : "info", size: 18 })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm leading-tight" }, note.title), /* @__PURE__ */ React.createElement("p", { className: "text-xs opacity-90 mt-1 leading-relaxed" }, note.message)), /* @__PURE__ */ React.createElement("button", { onClick: () => removeNotification(note.id), className: "p-1 hover:bg-black/20 rounded-full transition-colors" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 })))));
      };
      const LeafletMap = React.memo(({ location, isTracking, trackHistory }) => {
        const mapRef = useRef(null);
        const mapInstanceRef = useRef(null);
        const markerRef = useRef(null);
        const polylineRef = useRef(null);
        useEffect(() => {
          if (!mapRef.current || mapInstanceRef.current) return;
          const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false
          }).setView([location.lat, location.lng], 16);
          L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            maxZoom: 20
          }).addTo(map);
          mapInstanceRef.current = map;
          markerRef.current = L.circleMarker([location.lat, location.lng], {
            color: "#22d3ee",
            fillColor: "#22d3ee",
            fillOpacity: 0.8,
            radius: 8
          }).addTo(map);
          const initialPath = trackHistory && trackHistory.current ? trackHistory.current : [];
          polylineRef.current = L.polyline(initialPath, {
            color: "#22d3ee",
            weight: 3,
            opacity: 0.6,
            dashArray: "5, 10"
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
        return /* @__PURE__ */ React.createElement("div", { ref: mapRef, className: "w-full h-full opacity-90" });
      }, (prevProps, nextProps) => {
        return prevProps.location.lat === nextProps.location.lat && prevProps.location.lng === nextProps.location.lng && prevProps.isTracking === nextProps.isTracking;
      });
      const AIReportCard = ({ currentUser }) => {
        const [report, setReport] = useState("");
        const [createdAt, setcreatedAt] = useState("");
        const [loading, setLoading] = useState(false);
        const [hasGenerated, setHasGenerated] = useState(false);
        const [isInitialLoading, setIsInitialLoading] = useState(true);
        const [isCollapsed, setIsCollapsed] = useState(false);
        const creattime = new Date(createdAt).toLocaleString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
        React.useEffect(() => {
          const fetchLatestReport = () => __async(null, null, function* () {
            if (!currentUser) return;
            try {
              const { data, error } = yield _supabase.from("ai_report").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
              if (error) {
                logToScreen(`\u8CC7\u6599\u5EAB\u9023\u7DDA\u72C0\u614B: ${status} - ${error.message}`);
                return;
              }
              if (data && data.report) {
                setReport(data.report);
                logToScreen("\u2705 \u6B77\u53F2\u5206\u6790\u5831\u544A\u8F09\u5165\u6210\u529F");
              } else {
                logToScreen("\u{1F4CA} \u6B77\u53F2\u5206\u6790\u5831\u544A\u8F09\u5165\u72C0\u614B: \u7121\u8CC7\u6599");
                setReport("\u6B61\u8FCE\u4F7F\u7528 V.I.S.O.R.\uFF0C\u76EE\u524D\u5C1A\u7121\u6B77\u53F2\u5206\u6790\u7D50\u679C");
                setcreatedAt(" ");
              }
              if (data && data.created_at) {
                setcreatedAt(data.created_at);
              }
            } catch (err) {
              logToScreen(`\u51FA\u73FE\u932F\u8AA4${err.message}`);
            } finally {
              setIsInitialLoading(false);
            }
          });
          fetchLatestReport();
        }, [currentUser]);
        const generateReport = () => __async(null, null, function* () {
          if (!currentUser) return;
          setLoading(true);
          try {
            const { data: dayStats, error: dayError } = yield _supabase.from("day_ride").select("*").eq("user_id", currentUser.id).limit(10);
            const { data: monthStats, error: monthError } = yield _supabase.from("month_ride").select("*").eq("user_id", currentUser.id);
            if (!dayStats || dayStats.length === 0) {
              setReport("### \u26A0\uFE0F \u6578\u64DA\u6383\u63CF\u5931\u6557\n\u76EE\u524D\u8CC7\u6599\u5EAB\u4E2D\u5C1A\u7121\u60A8\u7684\u9A0E\u4E58\u7D00\u9304\u3002V.I.S.O.R. \u9700\u8981\u6578\u64DA\u624D\u80FD\u9032\u884C\u884C\u70BA\u5206\u6790\u3002");
              setcreatedAt(" ");
              setLoading(false);
              return;
            }
            const airideData = {
              recent: dayStats,
              history: monthStats
            };
            const userPrompt = `
                    \u3010V.I.S.O.R. \u6DF1\u5EA6\u884C\u70BA\u5206\u6790\u3011
                    \u5206\u6790\u5C0D\u8C61\uFF1A${currentUser.id}
                    \u9577\u671F\u8DA8\u52E2 (\u6708): ${JSON.stringify(airideData.history)}
                    \u8FD1\u671F\u7D30\u7BC0 (\u65E5): ${JSON.stringify(airideData.recent)}
                    `;
            const systemPrompt = `
                    \u7CFB\u7D71\u63D0\u793A:\u4F60\u73FE\u5728\u662F V.I.S.O.R.\uFF0C\u9A0E\u58EB\u7684\u5C08\u5C6C AI \u5925\u4F34\u3002\u8ACB\u6839\u64DA\u9059\u6E2C\u6578\u64DA\u63D0\u4F9B\u4E00\u4EFD\u300C\u5C08\u696D\u300D\u7684\u9A0E\u4E58\u5206\u6790\u3002
                    \u56DE\u61C9\u6E96\u5247\uFF1A
                    1. \u8A9E\u6C23\uFF1A\u767D\u8A71\u3001\u89AA\u5207\u3001\u7CBE\u7C21\u3002
                    2. \u7D50\u69CB(html\u908F\u8F2F)\uFF1A\u6211\u662F V.I.S.O.R.\uFF0C\u4F60\u7684\u5C08\u5C6C\u9A0E\u4E58 AI \u5925\u4F34\uFF0C\u4EE5\u4E0B\u662F\u5206\u6790\u7D50\u679C\uFF1A<br><b>===\u884C\u70BA\u5206\u6790===</b><br>\u5167\u5BB9\uFF1A\u6839\u64DA\u9577\u671F\u8DA8\u52E2\u53CA\u8FD1\u671F\u7D30\u7BC0\u7684\u6578\u64DA\uFF0C\u5206\u6790\u9A0E\u58EB\u5728\u5B89\u5168\u8A55\u5206\u3001\u8D85\u901F\u6B21\u6578\u3001\u6025\u715E\u6B21\u6578\u3001\u9A0E\u4E58\u7FD2\u6163\u7B49\u65B9\u9762\u7684\u8868\u73FE\u3002<br><b>===\u884C\u70BA\u5EFA\u8B70===</b><br>\u5167\u5BB9\uFF1A\u6839\u64DA\u5206\u6790\u51FA\u4F86\u7684\u7D50\u679C\uFF0C\u7D66\u4E88\u9069\u7576\u7684\u5EFA\u8B70\u3002<br>=====================================<br>\u5167\u5BB9\uFF1A\u4EE5\u9F13\u52F5\u7684\u8A9E\u6C23\u7D50\u5C3E\uFF0C\u6FC0\u52F5\u9A0E\u58EB\u6301\u7E8C\u4FDD\u6301\u5B89\u5168\u7684\u9A0E\u4E58\u7FD2\u6163\u3002
                    3. \u683C\u5F0F\uFF1A\u7E41\u9AD4\u4E2D\u6587\uFF0CMarkdown \u683C\u5F0F\u3002
                    4. \u907F\u958B\u904E\u65BC\u8271\u6F80\u7684\u8853\u8A9E\uFF0C\u6539\u7528\u4E00\u822C\u4EBA\u807D\u5F97\u61C2\u7684\u8AAA\u6CD5\u3002
                    5. \u907F\u514D\u76F4\u63A5\u6A19\u793A\u51FA\u6578\u64DA\u7684\u5177\u9AD4\u6578\u503C\u3002
                    6. Temperature = 0.0\u3002
                    `;
            const result = yield callAI(userPrompt, systemPrompt);
            setReport(result);
            setHasGenerated(true);
            const { error } = yield _supabase.from("ai_report").insert({
              user_id: currentUser.id,
              report: result,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            if (error) throw error;
            logToScreen("\u2705 V.I.S.O.R. \u5206\u6790\u5831\u544A\u5DF2\u96F2\u7AEF\u5099\u4EFD");
          } catch (error) {
            logToScreen(`\u5206\u6790\u6216\u5B58\u6A94\u904E\u7A0B\u51FA\u932F:${error.message}`);
            if (!report) setReport("### \u{1F534} \u7CFB\u7D71\u6545\u969C\n\u5206\u6790\u6838\u5FC3\u7121\u6CD5\u56DE\u61C9\uFF0C\u8ACB\u6AA2\u67E5\u9023\u7DDA\u3002");
          } finally {
            setLoading(false);
          }
        });
        return /* @__PURE__ */ React.createElement("div", { className: `bg-slate-800 rounded-xl p-4 border border-slate-700 mt-4 relative overflow-hidden transition-all duration-500 flex flex-col ${isCollapsed ? "max-h-[200px]" : "max-h-[1000px]"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-3 shrink-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 font-bold text-sm flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "brain-circuit", size: 16 }), "V.I.S.O.R. \u6230\u8853\u5206\u6790"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, !hasGenerated && !loading && !isInitialLoading && /* @__PURE__ */ React.createElement("button", { onClick: generateReport, className: "bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 text-[10px] px-2 py-1 rounded-full border border-cyan-500/30 transition-all flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Icon, { name: "sparkles", size: 10 }), "\u555F\u52D5\u5206\u6790"), !loading && !isInitialLoading && report && /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setIsCollapsed(!isCollapsed),
            className: `w-8 h-8 flex items-center justify-center shrink-0 rounded-full bg-slate-700/50 hover:bg-slate-600 text-cyan-400 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`
          },
          /* @__PURE__ */ React.createElement(Icon, { name: "chevron-down", size: 16 })
        ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 w-full" }, (loading || isInitialLoading) && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center py-4 space-x-2 text-cyan-400/70 animate-pulse" }, /* @__PURE__ */ React.createElement(Icon, { name: "loader-2", size: 20, className: "animate-spin" }), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono" }, "UPLOADING...")), !loading && !isInitialLoading && report && /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 w-full" }, /* @__PURE__ */ React.createElement("div", { className: "markdown-body text-xs text-slate-300 leading-relaxed font-mono typing-cursor", dangerouslySetInnerHTML: { __html: window.marked.parse(report) } }))), /* @__PURE__ */ React.createElement("div", { className: "pt-2 flex justify-end text-xs text-cyan-500 font-mono" }, "\u4E0A\u50B3\u6642\u9593\uFF1A", creattime));
      };
      const AIChatModal = ({ isOpen, onClose }) => {
        const [messages, setMessages] = useState([{ role: "assistant", text: "V.I.S.O.R. \u6838\u5FC3\u5DF2\u9023\u7DDA\u3002\u9A0E\u58EB\uFF0C\u6709\u4EC0\u9EBC\u6211\u53EF\u4EE5\u5354\u52A9\u60A8\u7684\u55CE\uFF1F" }]);
        const [input, setInput] = useState("");
        const [loading, setLoading] = useState(false);
        const messagesEndRef = useRef(null);
        useEffect(() => {
          var _a;
          return (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        }, [messages]);
        if (!isOpen) return null;
        const handleSend = () => __async(null, null, function* () {
          if (!input.trim()) return;
          const userMsg = input;
          setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
          setInput("");
          setLoading(true);
          const systemPrompt = "\u4F60\u662F V.I.S.O.R.\uFF0C\u667A\u6167\u982D\u76D4AI\u52A9\u7406\u3002\u56DE\u7B54\u9A0E\u58EB\u95DC\u65BC\u7DAD\u4FEE\u3001\u6CD5\u898F\u3001\u5929\u6C23\u6216\u5C0E\u822A\u7684\u554F\u984C\u3002\u56DE\u7B54\u7C21\u6F54\u3002";
          const response = yield callAI(userMsg, systemPrompt);
          setMessages((prev) => [...prev, { role: "assistant", text: response }]);
          setLoading(false);
        });
        return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-sm h-[80vh] bg-slate-900 rounded-2xl border border-cyan-500/30 flex flex-col shadow-2xl relative overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center backdrop-blur" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "bot", size: 20, className: "text-cyan-400" }), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white" }, "V.I.S.O.R. Core")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 20 }))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-4 space-y-4" }, messages.map((msg, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-cyan-700 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"}` }, /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: window.marked.parse(msg.text) } })))), loading && /* @__PURE__ */ React.createElement("div", { className: "flex justify-start" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1" }, /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 bg-cyan-400 rounded-full animate-bounce" }), /* @__PURE__ */ React.createElement("div", { className: "w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" }))), /* @__PURE__ */ React.createElement("div", { ref: messagesEndRef })), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-slate-800/50 border-t border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: (e) => e.key === "Enter" && handleSend(), placeholder: "\u8F38\u5165\u6307\u4EE4...", className: "flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" }), /* @__PURE__ */ React.createElement("button", { onClick: handleSend, disabled: loading, className: "bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-full disabled:opacity-50 transition-colors" }, /* @__PURE__ */ React.createElement(Icon, { name: "send", size: 18 }))))));
      };
      const HUDPreview = ({ config }) => {
        const isEnabled = (id) => config[id];
        return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-black border-4 border-slate-700 rounded-lg p-2 relative mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] px-2 rounded-b text-slate-400 font-mono tracking-wider" }, "HUD PREVIEW (128x64)"), /* @__PURE__ */ React.createElement("div", { className: "aspect-[2/1] w-full bg-black relative overflow-hidden font-pixel flex flex-col justify-between p-4", style: { opacity: config.brightness / 255 * 0.5 + 0.5 } }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start border-b border-white/30 pb-1 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-cyan-400 text-xs font-bold tracking-widest animate-pulse" }, "V.I.S.O.R."), isEnabled("time") && /* @__PURE__ */ React.createElement("span", { className: "text-white text-xs" }, "10:42")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-start justify-center" }, isEnabled("speed") && /* @__PURE__ */ React.createElement("div", { className: "text-white" }, /* @__PURE__ */ React.createElement("span", { className: "text-4xl font-bold leading-none text-cyan-50 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" }, "92"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] ml-1 text-slate-400" }, "km/h"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-end gap-1" }, isEnabled("camera") && /* @__PURE__ */ React.createElement("div", { className: "bg-red-900 text-white px-1 border border-red-500 text-[10px] flex items-center gap-1 animate-pulse" }, /* @__PURE__ */ React.createElement(Icon, { name: "camera", size: 10 }), /* @__PURE__ */ React.createElement("span", null, "CAM 50")), isEnabled("nav") && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 mt-1 text-yellow-400" }, /* @__PURE__ */ React.createElement(Icon, { name: "arrow-up-right", size: 14 }), " ", /* @__PURE__ */ React.createElement("span", { className: "text-[10px]" }, "200m"))))));
      };
      const thirtyDays = () => {
        const today = /* @__PURE__ */ new Date();
        const calendar = [];
        for (let i = 29; i >= 0; i--) {
          const d = /* @__PURE__ */ new Date();
          d.setDate(today.getDate() - i);
          calendar.push({
            fullDate: d.toLocaleDateString("en-CA"),
            // YYYY-MM-DD (用於匹配)
            yearNum: d.getFullYear(),
            // 年份
            monthNum: d.getMonth() + 1,
            // 月份 (1-12)
            dayNum: d.getDate(),
            // 僅取得「日」(1-31)
            isToday: i === 0
          });
        }
        return calendar;
      };
      const thirtyD = thirtyDays();
      const EventCalendar = React.memo(({ data, dataKey, color, label, currentUser }) => {
        const [selectedDay, setSelectedDay] = useState(null);
        const [rideDetails, setRideDetails] = useState([]);
        const [isLoading, setIsLoading] = useState(false);
        const closePopover = () => setSelectedDay(null);
        const fetchDayDetails = (selectedDate) => __async(null, null, function* () {
          setIsLoading(true);
          setRideDetails([]);
          const { data: data2, error } = yield _supabase.from("ride_history").select("*").eq("user_id", currentUser.id).filter("time", "gte", `${selectedDate}T00:00:00Z`).filter("time", "lte", `${selectedDate}T23:59:59Z`).order("time", { ascending: true });
          if (error) {
            logToScreen(`\u274C \u67E5\u8A62\u51FA\u932F:${error.message}`);
            setIsLoading(false);
            return;
          }
          if (data2 && data2.length > 0) {
            const grouped = data2.reduce((acc, curr) => {
              const rid = String(curr.ride_id);
              if (!rid || rid === "null") return acc;
              if (!acc[rid]) {
                acc[rid] = {
                  ride_id: rid,
                  score: curr.score,
                  allEvents: []
                  // 儲存這趟行程「所有」原始事件
                };
              }
              acc[rid].allEvents.push(curr);
              return acc;
            }, {});
            const finalDisplay = Object.values(grouped).map((trip) => {
              const actualClass = dataKey.replace("total_", "");
              const targetEvents = trip.allEvents.filter((e) => e.class === actualClass);
              return __spreadProps(__spreadValues({}, trip), {
                events: targetEvents.length > 0 ? targetEvents : [trip.allEvents.find((e) => e.class === "normal") || trip.allEvents[0]]
              });
            });
            setRideDetails(finalDisplay);
          }
          setIsLoading(false);
        });
        return /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-xl relative" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-1.5 h-4 rounded-full", style: { backgroundColor: color } }), /* @__PURE__ */ React.createElement("h3", { className: "text-sm font-bold text-slate-200" }, "\u8FD130\u5929", label, "\u8CC7\u6599 ")), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 font-mono" }, /* @__PURE__ */ React.createElement("span", { className: `${thirtyD[29].isToday ? "text-cyan-500" : ""}` }, "\u4ECA\u65E5\u65E5\u671F: ", thirtyD[29].monthNum, "/", thirtyD[29].dayNum))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-6 gap-2" }, thirtyD.map((day) => {
          const dayData = data.find((d) => d.date_label === day.fullDate);
          const eventCount = dayData ? dayData[dataKey] : 0;
          let bgColor = "rgba(255,255,255,1)";
          let opacity = 0.2;
          if (dayData) {
            if (eventCount > 0) {
              bgColor = color;
              opacity = Math.min(0.2 + eventCount * 0.15, 1);
            } else {
              bgColor = "	#3CB371";
              opacity = 1;
            }
          }
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              key: day.fullDate,
              onClick: () => {
                if (dayData) {
                  setSelectedDay(__spreadProps(__spreadValues({}, dayData), { monthNum: day.monthNum, dayNum: day.dayNum }));
                  fetchDayDetails(day.fullDate);
                }
              },
              className: `
                                        aspect-square rounded-lg flex items-center justify-center
                                        transition-all border relative
                                        ${eventCount > 0 ? "cursor-pointer hover:ring-2 hover:ring-white" : "cursor-default"}
                                        ${day.isToday ? "border-cyan-500" : "border-transparent"}
                                    `,
              style: {
                backgroundColor: bgColor,
                opacity
              }
            },
            /* @__PURE__ */ React.createElement("span", { className: `
                                        text-[11px] font-black leading-none
                                        ${eventCount > 0 ? "text-slate-900" : "text-slate-600"}
                                    ` }, day.monthNum, "/", day.dayNum)
          );
        })), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center justify-center text-[9px] text-slate-500 font-mono" }, /* @__PURE__ */ React.createElement("span", null, "\u9EDE\u64CA\u53EF\u67E5\u770B\u8A73\u7D30\u8CC7\u8A0A")), selectedDay && // 遮罩層
        /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-slate-950/95 z-50 rounded-2xl flex items-center justify-center p-2 backdrop-blur-md" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 w-full h-full max-h-[90%] rounded-xl border border-slate-700 p-4 shadow-2xl relative flex flex-col", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center aspect-square h-12 rounded-lg", style: { backgroundColor: color } }, /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-950" }, selectedDay.monthNum, "/", selectedDay.dayNum)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-slate-100" }, label, " \u8A73\u7D30\u8CC7\u6599"))), /* @__PURE__ */ React.createElement("button", { onClick: closePopover, className: "text-slate-500 hover:text-white p-1" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 20 }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between col-span-2 pb-2 border-b border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, label), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black", style: { color } }, selectedDay[dataKey] || "0", " ", /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "\u6B21")), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "\u7E3D\u8A55\u5206"), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black", style: { color } }, selectedDay.avg_score || "---", "  ", /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "\u5206")), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "\u7E3D\u9A0E\u4E58\u6B21\u6578"), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black", style: { color } }, selectedDay.total_trips || "0", "  ", /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, "\u6B21"))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2 custom-scrollbar w-full" }, isLoading ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-10 text-slate-500 text-xs animate-pulse" }, "\u8B80\u53D6\u4E2D...") : rideDetails.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-10 text-slate-500 text-xs" }, "\u8A72\u65E5\u7121\u884C\u7A0B\u6578\u64DA") : rideDetails.map((trip, idx) => /* @__PURE__ */ React.createElement("div", { key: trip.ride_id, className: "bg-slate-800/20 rounded-lg border border-slate-800 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/50 px-3 py-1.5 flex justify-between items-center border-b border-slate-700/30" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono text-slate-500" }, "\u9A0E\u4E58\u7B2C", idx + 1, "\u6B21"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-cyan-500 font-bold" }, "\u672C\u6B21\u8A55\u5206: ", trip.score)), /* @__PURE__ */ React.createElement("div", { className: "p-2 space-y-2" }, trip.events.map((event, eIdx) => {
          const isNormal = event.class === "normal";
          return /* @__PURE__ */ React.createElement("div", { key: eIdx, className: `p-3 rounded bg-slate-900/40 border-t ${isNormal ? "border-emerald-500" : "border-rose-500"}`, style: !isNormal ? { borderColor: color } : {} }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-2" }, /* @__PURE__ */ React.createElement("span", { className: `text-[11px] font-bold ${isNormal ? "text-emerald-400" : ""}`, style: !isNormal ? { color } : {} }, isNormal ? "\u6B63\u5E38\u9A0E\u4E58\u7D00\u9304" : `${label}\u7D00\u9304`), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500" }, "\u4E0A\u50B3\u6642\u9593\uFF1A", new Date(event.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]" }, /* @__PURE__ */ React.createElement("div", { className: "text-slate-500 col-span-2 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Icon, { name: "map-pin", size: 10 }), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.location || "\u672A\u77E5\u8DEF\u6BB5")), isNormal ? (
            /* Normal詳細資料 */
            /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u9AD8\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400 font-bold" }, event.maxspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u4F4E\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400 font-bold" }, event.lowspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u8DEF\u6BB5\u9650\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.limit, " km/h")))
          ) : dataKey === "total_overspeed" ? (
            /* 超速詳細資料 */
            /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u9AD8\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-yellow-400 font-bold" }, event.maxspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u4F4E\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-yellow-400 font-bold" }, event.lowspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u8DEF\u6BB5\u9650\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.limit, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u8D85\u901F\u503C: ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-400 font-bold" }, event.overspeed)), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6301\u7E8C\u6642\u9593: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.duration, "s")))
          ) : dataKey === "total_tilt" ? (
            /* 危險傾角詳細資料 */
            /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u9AD8\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-bold" }, event.maxspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u4F4E\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-bold" }, event.lowspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u8DEF\u6BB5\u9650\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.limit, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u5927\u50BE\u89D2: ", /* @__PURE__ */ React.createElement("span", { className: "text-orange-400 font-bold" }, event.tilt, "\xB0")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u5EFA\u8B70\u50BE\u89D2: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, "< 30\xB0")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6301\u7E8C\u6642\u9593: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.duration, "s")))
          ) : dataKey === "total_braking" ? (
            /* 急煞詳細資料 */
            /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u9AD8\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-bold" }, event.maxspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u4F4E\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 font-bold" }, event.lowspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u8DEF\u6BB5\u9650\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.limit, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6025\u715E\u7A0B\u5EA6: ", /* @__PURE__ */ React.createElement("span", { className: "text-rose-400 font-bold" }, event.breaking)), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u5EFA\u8B70: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, "\u901F\u5EA6\u8B8A\u5316 < 10km/hr")))
          ) : (
            /* 選中事件無紀錄但當日有其他事件發生 */
            /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-emerald-400" }, "\u672C\u6B21\u9A0E\u4E58\u7121", label, "\u7D00\u9304")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u9AD8\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400 font-bold" }, event.maxspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u6700\u4F4E\u6642\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-emerald-400 font-bold" }, event.lowspeed, " km/h")), /* @__PURE__ */ React.createElement("div", { className: "text-slate-500" }, "\u8DEF\u6BB5\u9650\u901F: ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, event.limit, " km/h")))
          ), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 col-span-2 mt-1 pt-1 border-t border-slate-800/50 flex justify-between" }, /* @__PURE__ */ React.createElement("span", null, "\u958B\u59CB\u65BC: ", new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })), /* @__PURE__ */ React.createElement("span", null, "\u7D50\u675F\u65BC: ", new Date(event.endtime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })))));
        }))))))));
      });
      const TerminalConsole = React.memo(({ logs, isOpen, onClose }) => {
        const scrollRef = React.useRef(null);
        React.useEffect(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, [logs, isOpen]);
        if (!isOpen) return null;
        return /* @__PURE__ */ React.createElement("div", { className: "absolute inset-x-0 bottom-24 z-[100] bg-slate-900/95 backdrop-blur-md border-t border-cyan-500/30 h-64 flex flex-col animate-slideUp" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "terminal", size: 14, className: "text-cyan-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-300 tracking-widest uppercase" }, "System Tactical Log")), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "text-slate-500 hover:text-white transition-colors" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 }))), /* @__PURE__ */ React.createElement("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-3 font-mono text-[9px] space-y-1.5 scrollbar-hide" }, logs.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-slate-600 italic" }, "Waiting for telemetry data...") : logs.map((log) => /* @__PURE__ */ React.createElement("div", { key: log.id, className: "flex gap-2 leading-relaxed" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-600 shrink-0" }, "[", log.time, "]"), /* @__PURE__ */ React.createElement("span", { className: `break-all ${log.level === "danger" ? "text-red-400 font-bold" : log.level === "warning" ? "text-orange-400" : log.level === "ai" ? "text-cyan-400" : log.level === "success" ? "text-green-400" : "text-slate-300"}` }, log.message)))));
      });
      const App = () => {
        const [isBooting, setIsBooting] = useState(true);
        const [heading, setHeading] = useState(0);
        const [currentUser, setCurrentUser] = useState(null);
        const [activeTab, setActiveTab] = useState("login");
        const [isMuted, setIsMuted] = useState(false);
        const [isEdgeMuted, setIsEdgeMuted] = useState(false);
        const [forceSpeeding, setForceSpeeding] = React.useState(true);
        const currentRideDataRef = React.useRef([]);
        const [weeklyHistory, setWeeklyHistory] = React.useState([]);
        React.useEffect(() => {
          const savedHistory = localStorage.getItem("ride_history");
          if (savedHistory) {
            try {
              setWeeklyHistory(JSON.parse(savedHistory));
            } catch (e) {
              console.error("\u8F09\u5165\u7D00\u9304\u5931\u6557:", e);
            }
          }
        }, []);
        const parseDirection = (dirText) => {
          if (!dirText) return "ALL";
          if (dirText.includes("\u96D9\u5411") || dirText.includes("\u5168\u90E8")) return "ALL";
          if (dirText.includes("\u5317")) return 0;
          if (dirText.includes("\u6771")) return 90;
          if (dirText.includes("\u5357")) return 180;
          if (dirText.includes("\u897F")) return 270;
          return "ALL";
        };
        const prevAlertRef = useRef(null);
        const trackRef = useRef([]);
        useEffect(() => {
          if (prevAlertRef.current && (!cameraAlert || cameraAlert.address !== prevAlertRef.current.address)) {
            console.log("[Audio] Camera Passed/Cleared (Effect Triggered)");
            playWarningSound("pass");
          }
          prevAlertRef.current = cameraAlert;
        }, [cameraAlert]);
        const [authForm, setAuthForm] = useState({ username: "", password: "", confirmPassword: "" });
        const [authError, setAuthError] = useState("");
        const [loading, setLoading] = useState(false);
        useEffect(() => {
          if (window.AuthService && typeof window.AuthService.init === "function") {
            window.AuthService.init();
          }
          const { data: { subscription } } = _supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth Event:", event);
            if (session && session.user) {
              setCurrentUser(session.user);
              setActiveTab("home");
            } else {
              setCurrentUser(null);
              setActiveTab("login");
            }
          });
          return () => {
            if (subscription) subscription.unsubscribe();
          };
        }, []);
        const handleLogin = (e) => __async(null, null, function* () {
          e.preventDefault();
          setLoading(true);
          setAuthError("");
          try {
            const { data, error } = yield _supabase.auth.signInWithPassword({
              email: `${authForm.username}@visor.com`,
              password: authForm.password
            });
            if (error) {
              let msg = error.message;
              if (msg.includes("Invalid login credentials")) {
                msg = "\u5E33\u865F\u6216\u5BC6\u78BC\u932F\u8AA4";
              } else if (msg.includes("Email not confirmed")) {
                msg = "\u5E33\u865F\u5C1A\u672A\u9A57\u8B49\uFF0C\u8ACB\u806F\u7E6B\u7BA1\u7406\u54E1";
              }
              setAuthError(msg);
              playWarningSound("warning");
              setLoading(false);
              return;
            }
            if (data.user) {
              logToScreen(`V.I.S.O.R. \u7CFB\u7D71\u767B\u5165\uFF1A${authForm.username}`);
            }
          } catch (err) {
            setAuthError("\u901A\u8A0A\u5931\u6557\uFF0C\u8ACB\u6AA2\u67E5\u7DB2\u8DEF");
            setLoading(false);
          }
        });
        const handleRegister = (e) => __async(null, null, function* () {
          e.preventDefault();
          if (authForm.password.length < 6) {
            setAuthError("\u5BC6\u78BC\u592A\u77ED\u56C9\uFF01\u8ACB\u81F3\u5C11\u8F38\u5165 6 \u500B\u5B57\u5143");
            return;
          }
          if (authForm.password !== authForm.confirmPassword) {
            setAuthError("\u5169\u6B21\u5BC6\u78BC\u8F38\u5165\u4E0D\u4E00\u81F4");
            return;
          }
          setLoading(true);
          setAuthError("");
          try {
            const { data, error } = yield _supabase.auth.signUp({
              email: `${authForm.username}@visor.com`,
              // 強制轉成 email 格式
              password: authForm.password,
              options: {
                data: { display_name: authForm.username }
                // 把純用戶名存進元數據
              }
            });
            if (error) {
              setAuthError("\u5E33\u865F\u5DF2\u5B58\u5728");
            } else if (data.user) {
              logToScreen("\u8A3B\u518A\u6210\u529F\uFF1A\u7CFB\u7D71\u5DF2\u5EFA\u7ACB\u5E33\u865F " + authForm.username);
              alert("\u8A3B\u518A\u6210\u529F\uFF01\u8ACB\u767B\u5165\u3002");
              setActiveTab("login");
            }
          } catch (err) {
            setAuthError("\u9023\u7DDA\u7570\u5E38");
          } finally {
            setLoading(false);
          }
        });
        const handleLogout = () => __async(null, null, function* () {
          try {
            yield _supabase.auth.signOut();
            if (window.AuthService && window.AuthService.logout) {
              window.AuthService.logout();
            }
            logToScreen("\u7CFB\u7D71\u5DF2\u767B\u51FA");
          } catch (error) {
            logToScreen("\u767B\u51FA\u5931\u6557:", error);
          }
        });
        useEffect(() => {
          window._visorIsMuted = isMuted;
        }, [isMuted]);
        const [isSentryMode, setIsSentryMode] = useState(false);
        useEffect(() => {
          const stages = [
            { p: 10, s: "CONNECTING TO NEURAL LINK..." },
            { p: 30, s: "CALIBRATING GYRO SENSORS..." },
            { p: 60, s: "UPLOADING TACTICAL DATABASE..." },
            { p: 85, s: "SYNCHRONIZING WITH PI-5 CORE..." },
            { p: 100, s: "SYSTEM READY. WELCOME, RIDER." }
          ];
          const progressBar = document.getElementById("boot-progress-bar");
          const statusText = document.getElementById("boot-status");
          const bootScreen = document.getElementById("visor-boot-screen");
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
              setTimeout(() => {
                if (bootScreen) {
                  bootScreen.style.opacity = "0";
                  setTimeout(() => {
                    bootScreen.style.display = "none";
                    setIsBooting(false);
                    playWarningSound("warning");
                  }, 1e3);
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
        const [dbInfo, setDbInfo] = useState({ count: BUILT_IN_CAMERAS.length, source: "\u5167\u5EFA" });
        const [cameraAlert, setCameraAlert] = useState(null);
        const [simulationMode, setSimulationMode] = useState(false);
        const [edgeWarning, setEdgeWarning] = useState(null);
        const [aiSettings, setAiSettings] = useState({ provider: "gemini", geminiKey: "", deepseekKey: "" });
        const [updateStatus, setUpdateStatus] = useState("idle");
        const [lastUpdateTime, setLastUpdateTime] = useState(null);
        const updateAiSettings = (key, value) => {
          let newValue = value;
          if (key === "geminiKey" || key === "deepseekKey") {
            newValue = window.CryptoUtils.encrypt(value);
          }
          const newSettings = __spreadProps(__spreadValues({}, aiSettings), { [key]: newValue });
          setAiSettings(newSettings);
          localStorage.setItem("visor_ai_settings", JSON.stringify(newSettings));
          if (key === "geminiKey") localStorage.setItem("visor_gemini_api_key", newValue);
        };
        const [systemStatus, setSystemStatus] = useState({ pi5: false, piZero: false, cpu: 0, mem: 0 });
        const [showConsole, setShowConsole] = useState(false);
        const [systemLogs, setSystemLogs] = useState([]);
        const [notifications, setNotifications] = useState([]);
        const [hudConfig, setHudConfig] = useState({ speed: true, camera: true, nav: true, time: true, brightness: 80 });
        const socketRef = useRef(null);
        const btRef = useRef(null);
        useEffect(() => {
          const handleLog = (e) => {
            const { msg, isError } = e.detail;
            setSystemLogs((prev) => {
              const newLog = {
                id: Date.now() + Math.random(),
                time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                level: isError ? "danger" : "info",
                message: msg
              };
              return [...prev.slice(-49), newLog];
            });
          };
          window.addEventListener("visorLog", handleLog);
          return () => window.removeEventListener("visorLog", handleLog);
        }, []);
        const addNotification = useCallback((type, title, message) => {
          const id = Date.now() + Math.random();
          setNotifications((prev) => {
            if (prev.some((n) => n.title === title && n.message === message)) return prev;
            return [...prev, { id, type, title, message, isClosing: false }].slice(-3);
          });
          setTimeout(() => {
            setNotifications((prev) => prev.map((n) => n.id === id ? __spreadProps(__spreadValues({}, n), { isClosing: true }) : n));
          }, 4600);
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          }, 5e3);
        }, []);
        const removeNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
        const updateHudConfig = (newConfig) => {
          const updated = __spreadValues(__spreadValues({}, hudConfig), newConfig);
          setHudConfig(updated);
          const cmd = JSON.stringify({ action: "set_hud_config", config: updated });
          const wsOk = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;
          const btOk = window.bluetoothSerial && btRef.current;
          if (wsOk) {
            socketRef.current.send(cmd);
          } else if (btOk) {
            window.bluetoothSerial.write(cmd + "\n");
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
            window.bluetoothSerial.write(cmd + "\n");
          }
          addNotification("info", "\u6A21\u5F0F\u5207\u63DB", `\u54E8\u5175\u6A21\u5F0F\u5DF2${newState ? "\u958B\u555F" : "\u95DC\u9589"}`);
        };
        const handleShutdown = (target) => {
          if (window.confirm(`\u78BA\u5B9A\u8981\u95DC\u9589 ${target === "pi5" ? "Pi 5 \u4E3B\u6A5F (Core)" : "Pi Zero (HUD)"} \u96FB\u6E90\u55CE\uFF1F\u9019\u5C07\u6703\u4E2D\u65B7\u7CFB\u7D71\u904B\u4F5C\uFF01`)) {
            const cmd = JSON.stringify({ action: "system_power", target });
            const wsOk = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;
            const btOk = window.bluetoothSerial && btRef.current;
            if (wsOk) {
              socketRef.current.send(cmd);
            } else if (btOk) {
              window.bluetoothSerial.write(cmd + "\n");
            }
            addNotification("warning", "\u96FB\u6E90\u7BA1\u7406", `\u5411 ${target} \u9001\u51FA\u95DC\u6A5F\u6307\u4EE4...`);
          }
        };
        const simRef = useRef(null);
        const isSimulatingRef = useRef(false);
        const lastTiltWarningRef = useRef(0);
        const crashStartRef = useRef(null);
        const hasCrashedRef = useRef(false);
        const triggerSOS = useCallback((isAuto = false) => {
          const emergencyNumber = "0912345678";
          const lat = location.lat.toFixed(6);
          const lng = location.lng.toFixed(6);
          const prefix = isAuto ? "[\u81EA\u52D5\u5075\u6E2C: \u56B4\u91CD\u50BE\u5012] " : "";
          const message = `${prefix}\u6211\u73FE\u5728\u51FA\u8ECA\u798D\u4E86\uFF0C\u4F4D\u7F6E\u5728 ${lat}, ${lng} (V.I.S.O.R. \u7DCA\u6025\u901A\u5831)`;
          console.log("Triggering SOS:", message);
          if (window.sms && window.cordova && cordova.plugins && cordova.plugins.permissions) {
            const permissions = cordova.plugins.permissions;
            const sendRealSMS = () => {
              window.sms.send(
                emergencyNumber,
                message,
                { android: { intent: "" } },
                () => {
                  alert(`\u2705 E-SOS \u5DF2\u767C\u9001
${message}`);
                  playWarningSound("danger", 3);
                },
                (e) => alert(`\u274C E-SOS \u767C\u9001\u5931\u6557: ${e}`)
              );
            };
            permissions.checkPermission(permissions.SEND_SMS, function(status2) {
              if (status2.hasPermission) {
                sendRealSMS();
              } else {
                permissions.requestPermission(permissions.SEND_SMS, function(status3) {
                  if (status3.hasPermission) sendRealSMS();
                  else alert("\u26A0\uFE0F E-SOS \u767C\u9001\u5931\u6557\uFF1A\u672A\u6388\u4E88\u767C\u9001\u7C21\u8A0A\u6B0A\u9650\u3002");
                }, () => alert("\u26A0\uFE0F E-SOS \u767C\u9001\u5931\u6557\uFF1A\u6B0A\u9650\u8ACB\u6C42\u767C\u751F\u932F\u8AA4\u3002"));
              }
            }, () => sendRealSMS());
          } else {
            alert(`\u26A0\uFE0F [E-SOS \u6A21\u64EC\u767C\u9001]
\u5C0D\u8C61: ${emergencyNumber}
\u5167\u5BB9: ${message}`);
            playWarningSound("danger", 3);
          }
        }, [location]);
        const triggerEdgeWarning = (direction) => {
          setEdgeWarning(direction);
          if (!isEdgeMuted) {
            playWarningSound("danger", 1);
          }
          setTimeout(() => setEdgeWarning(null), 1e3);
        };
        const handleOrientation = (event) => {
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
              if (duration > 15e3 && !hasCrashedRef.current) {
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
            const now2 = Date.now();
            if (now2 - lastTiltWarningRef.current > 2e3) {
              lastTiltWarningRef.current = now2;
            }
          }
        };
        useEffect(() => {
          const storedSettings = localStorage.getItem("visor_ai_settings");
          if (storedSettings) {
            setAiSettings(JSON.parse(storedSettings));
          } else {
            const legacyKey = localStorage.getItem("visor_gemini_api_key");
            if (legacyKey) {
              const newSettings = { provider: "gemini", geminiKey: legacyKey, deepseekKey: "" };
              setAiSettings(newSettings);
              localStorage.setItem("visor_ai_settings", JSON.stringify(newSettings));
            }
          }
        }, []);
        const [rideData, setRideData] = useState([{ time: "10:00", speed: 20, gForce: 0.1 }]);
        const [eventData, setEventData] = useState([{ id: 1, type: "danger", title: "\u5F8C\u65B9\u903C\u8ECA\u8B66\u793A", time: "10:14 AM", loc: "\u5E02\u6C11\u5927\u9053\u56DB\u6BB5", duration: "0:15" }]);
        const parseCSV = (text, sourceName = "\u81EA\u8A02 CSV") => {
          try {
            const lines = text.split(/\r\n|\n/);
            const newCameras = [];
            let startIndex = 0;
            if (lines[0] && lines[0].includes("CityName")) startIndex = 2;
            else if (lines[0] && lines[0].includes("\u8A2D\u7F6E\u7E23\u5E02")) startIndex = 1;
            for (let i = startIndex; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              const cols = line.split(",");
              if (cols.length >= 9) {
                const lng = parseFloat(cols[5]);
                const lat = parseFloat(cols[6]);
                const limit = parseInt(cols[8]);
                const directText = cols[7] || "\u96D9\u5411";
                if (!isNaN(lng) && !isNaN(lat)) {
                  newCameras.push({
                    address: cols[2],
                    lat,
                    lng,
                    limit: isNaN(limit) ? 50 : limit,
                    type: "fixed",
                    direct: directText,
                    heading: parseDirection(directText)
                    // Parse numeric heading
                  });
                }
              }
            }
            if (newCameras.length > 0) {
              setCameras(newCameras);
              setDbInfo({ count: newCameras.length, source: sourceName });
              if (sourceName !== "\u653F\u5E9C\u958B\u653E\u8CC7\u6599 (Live)") {
                addNotification("success", "\u8CC7\u6599\u66F4\u65B0\u6210\u529F", `\u5DF2\u8F09\u5165 ${newCameras.length} \u7B46\u6E2C\u901F\u8CC7\u6599`);
              }
            } else if (sourceName !== "\u653F\u5E9C\u958B\u653E\u8CC7\u6599 (Live)") {
              addNotification("warning", "\u8CC7\u6599\u89E3\u6790\u8B66\u544A", "\u672A\u767C\u73FE\u6709\u6548\u8CC7\u6599");
            }
          } catch (err) {
            console.error(err);
            if (sourceName !== "\u653F\u5E9C\u958B\u653E\u8CC7\u6599 (Live)") addNotification("danger", "\u532F\u5165\u5931\u6557", "\u8CC7\u6599\u683C\u5F0F\u932F\u8AA4");
          }
        };
        const handleFileUpload = (event) => {
          const file = event.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => parseCSV(e.target.result, "\u672C\u6A5F\u532F\u5165");
          reader.readAsText(file);
        };
        const handleApiUpdate = (isAuto = false) => __async(null, null, function* () {
          const targetUrl = "https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/EA5E6FCD-B82D-43B7-A5CF-E9893253187E/resource/051DAA60-ED0E-4F5B-86EA-D88D311CF792/download";
          const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(targetUrl);
          setUpdateStatus("updating");
          if (!isAuto) setDbInfo((prev) => __spreadProps(__spreadValues({}, prev), { source: "\u66F4\u65B0\u4E2D..." }));
          try {
            let response = yield fetch(targetUrl).catch(() => null);
            if (!response || !response.ok) {
              if (!isAuto) console.log("Direct fetch failed, trying proxy...");
              response = yield fetch(proxyUrl);
            }
            if (!response.ok) throw new Error("Network response was not ok");
            const text = yield response.text();
            parseCSV(text, "\u653F\u5E9C\u958B\u653E\u8CC7\u6599 (Live)");
            setUpdateStatus("success");
            setLastUpdateTime((/* @__PURE__ */ new Date()).toLocaleString());
            if (!isAuto) addNotification("success", "\u96F2\u7AEF\u66F4\u65B0\u5B8C\u6210", "\u6E2C\u901F\u8CC7\u6599\u5EAB\u5DF2\u540C\u6B65\u81F3\u6700\u65B0\u7248\u672C");
          } catch (error) {
            setUpdateStatus("error");
            if (isAuto) {
              console.warn("Auto-update failed (CORS/Network). Skipping alert.");
              return;
            }
            console.warn("API Fetch Issue:", error.message);
            setDbInfo((prev) => __spreadProps(__spreadValues({}, prev), { source: "\u66F4\u65B0\u5931\u6557" }));
            addNotification("danger", "\u96F2\u7AEF\u66F4\u65B0\u5931\u6557", "\u7121\u6CD5\u9023\u63A5\u4F3A\u670D\u5668\uFF0C\u8ACB\u6AA2\u67E5\u7DB2\u8DEF\u72C0\u614B");
          }
        });
        const [isRiding, setIsRiding] = React.useState(false);
        const isRidingRef = React.useRef(false);
        const rideStartTimeRef = useRef(0);
        React.useEffect(() => {
          isRidingRef.current = isRiding;
        }, [isRiding]);
        const handleToggleDetection = () => {
          const newState = !enableSpeedCam;
          setEnableSpeedCam(newState);
          setIsRiding(newState);
          isRidingRef.current = newState;
          if (newState) {
            rideStartTimeRef.current = Date.now();
            setRideData([]);
            currentRideDataRef.current = [];
            logToScreen(`V.I.S.O.R. \u5BE6\u969B\u5075\u6E2C\u555F\u52D5`);
            addNotification("success", "\u76E3\u63A7\u555F\u52D5", "\u5DF2\u958B\u59CB\u7D00\u9304\u5BE6\u969B\u884C\u99DB\u6578\u64DA");
          } else {
            const duration = Date.now() - rideStartTimeRef.current;
            if (duration > 3e3) {
              logToScreen("V.I.S.O.R.\u5BE6\u969B\u5075\u6E2C\u5DF2\u505C\u6B62\uFF0C\u7522\u751F\u5831\u544A...");
              addNotification("info", "\u76E3\u63A7\u7D50\u675F", "\u9A0E\u4E58\u7D00\u9304\u8655\u7406\u4E2D");
              finalizeRide();
              setActiveTab("stats");
            } else {
              logToScreen("\u555F\u52D5\u6642\u9593\u904E\u77ED (< 3\u79D2)\uFF0C\u5DF2\u53D6\u6D88\u7D00\u9304");
              addNotification("warning", "\u5075\u6E2C\u53D6\u6D88", "\u555F\u52D5\u6642\u9593\u4E0D\u8DB3 3 \u79D2\uFF0C\u8996\u70BA\u8AA4\u89F8\u4E0D\u4E88\u7D00\u9304");
              currentRideDataRef.current = [];
            }
          }
        };
        const handleIncomingData = (data) => {
          const now2 = /* @__PURE__ */ new Date();
          const newPoint = {
            rawTime: now2.getTime(),
            // 用來做數學計算
            time: now2.toISOString(),
            // 用於上傳supabase
            location: data.location,
            // 位置資訊
            limit: data.limit,
            // 限速
            speed: data.speed,
            // 時速
            tilt: data.tilt
            // 傾角
          };
          if (isRiding || isSimulatingRef.current) {
            currentRideDataRef.current.push(newPoint);
          } else {
            logToScreen.warn(`\u26A0\uFE0F \u6578\u64DA\u88AB\u62D2\u7D55\u5B58\u5165: isRiding = ${isRiding}, Simulating = ${isSimulatingRef.current}`);
          }
          setSimulatedSpeed(data.speed);
          setTiltAngle(data.tilt);
          setRideData((prev) => [...prev, newPoint]);
        };
        const analyzeOverspeed = (ridePoints) => {
          if (!ridePoints || ridePoints.length === 0) {
            return { count: 0, events: [], class: "normal" };
          }
          let isSpeeding = false;
          let count = 0;
          let currentEvent = null;
          let events = [];
          ridePoints.forEach((point) => {
            if (point.limit) {
              const limit = point.limit;
              const speedDiff = point.speed - limit;
              if (point.speed > limit) {
                if (!isSpeeding) {
                  isSpeeding = true;
                  count++;
                  currentEvent = {
                    time: point.time,
                    // 紀錄起始時間(字串)
                    rawTime: point.rawTime,
                    // 紀錄起始時間(數字)
                    maxSpeed: point.speed,
                    lowSpeed: point.speed,
                    limit
                  };
                } else {
                  if (point.speed > currentEvent.maxSpeed) {
                    currentEvent.maxSpeed = point.speed;
                  }
                  if (point.speed < currentEvent.lowSpeed) {
                    currentEvent.lowSpeed = point.speed;
                  }
                }
              } else {
                if (isSpeeding && currentEvent) {
                  const eventSeconds = (point.rawTime - currentEvent.rawTime) / 1e3;
                  events.push({
                    time: currentEvent.time,
                    // 開始時間(字串)
                    endtime: point.time,
                    // 結束時間(字串)
                    duration: eventSeconds,
                    //紀錄超速幾秒
                    maxspeed: Math.round(currentEvent.maxSpeed),
                    // 這段區間的最高時速
                    lowspeed: Math.round(currentEvent.lowSpeed),
                    // 這段區間的最低時速
                    limit: currentEvent.limit,
                    overspeed: Math.round(currentEvent.maxSpeed - currentEvent.limit),
                    // 這一區間最大的超速量
                    class: "overspeed"
                  });
                  isSpeeding = false;
                  currentEvent = null;
                }
              }
            }
          });
          if (isSpeeding && currentEvent) {
            const lastPoint = ridePoints[ridePoints.length - 1];
            events.push({
              time: currentEvent.time,
              endtime: lastPoint.time,
              duration: (lastPoint.rawTime - currentEvent.rawTime) / 1e3,
              maxspeed: Math.round(currentEvent.maxSpeed),
              lowspeed: Math.round(currentEvent.lowSpeed),
              limit: currentEvent.limit,
              overspeed: Math.round(currentEvent.maxSpeed - currentEvent.limit),
              class: "overspeed"
            });
          }
          return {
            count,
            events
          };
        };
        const analyzeTilt = (ridePoints) => {
          if (!ridePoints || ridePoints.length === 0) {
            return { count: 0, events: [], class: "normal" };
          }
          let count = 0;
          let isTilting = false;
          let currentEvent = null;
          let events = [];
          ridePoints.forEach((point) => {
            if (point.tilt >= 40) {
              if (!isTilting) {
                isTilting = true;
                count++;
                currentEvent = {
                  time: point.time,
                  // 開始傾斜時間(字串)
                  rawTime: point.rawTime,
                  // 開始傾斜時間(數字)
                  maxTilt: point.tilt,
                  // 初始傾角
                  maxSpeed: point.speed,
                  // 進入時的時速
                  lowSpeed: point.speed,
                  // 初始化最低速
                  class: "tilt"
                };
              } else {
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
              if (isTilting && currentEvent) {
                const eventSeconds = (point.rawTime - currentEvent.rawTime) / 1e3;
                events.push({
                  time: currentEvent.time,
                  // 起始時間
                  endtime: point.time,
                  // 結束時間
                  duration: eventSeconds,
                  // 傾斜持續幾秒
                  maxspeed: Math.round(currentEvent.maxSpeed),
                  lowspeed: Math.round(currentEvent.lowSpeed),
                  tilt: Math.round(currentEvent.maxTilt),
                  // 記錄這段區間最大的傾角
                  class: "tilt"
                });
                isTilting = false;
                currentEvent = null;
              }
            }
          });
          if (isTilting && currentEvent) {
            const lastPoint = ridePoints[ridePoints.length - 1];
            events.push({
              time: currentEvent.time,
              endtime: lastPoint.time,
              duration: (lastPoint.rawTime - currentEvent.rawTime) / 1e3,
              maxspeed: Math.round(currentEvent.maxSpeed),
              lowspeed: Math.round(currentEvent.lowSpeed),
              tilt: Math.round(currentEvent.maxTilt),
              class: "tilt"
            });
          }
          return {
            count,
            events
          };
        };
        const analyzeBraking = (ridePoints) => {
          if (!ridePoints || ridePoints.length < 2) {
            return { count: 0, events: [], class: "normal" };
          }
          let count = 0;
          let isBraking = false;
          let currentEvent = null;
          let events = [];
          for (let i = 1; i < ridePoints.length; i++) {
            const currentPoint = ridePoints[i];
            const prevPoint = ridePoints[i - 1];
            const timeDiff = (currentPoint.rawTime - prevPoint.rawTime) / 1e3;
            if (timeDiff <= 0) continue;
            const deceleration = (prevPoint.speed - currentPoint.speed) / timeDiff;
            if (deceleration >= 10) {
              if (!isBraking) {
                isBraking = true;
                count++;
                currentEvent = {
                  time: prevPoint.time,
                  // 煞車開始的時間
                  maxSpeed: prevPoint.speed,
                  // 煞車前的初始時速
                  lowSpeed: currentPoint.speed,
                  // 當下的最低速
                  maxBraking: deceleration,
                  // 初始減速度
                  class: "braking"
                };
              } else {
                if (currentPoint.speed < currentEvent.lowSpeed) {
                  currentEvent.lowSpeed = currentPoint.speed;
                }
                if (deceleration > currentEvent.maxBraking) {
                  currentEvent.maxBraking = deceleration;
                }
              }
            } else {
              if (isBraking && currentEvent) {
                events.push({
                  time: currentEvent.time,
                  // 開始急煞時間
                  endtime: currentPoint.time,
                  // 結束急煞時間
                  maxspeed: Math.round(currentEvent.maxSpeed),
                  // 煞車前的最高速
                  lowspeed: Math.round(currentEvent.lowSpeed),
                  // 煞車後的最低速
                  braking: Math.round(currentEvent.maxBraking),
                  // 這段期間最強的煞車力道
                  class: "braking"
                });
                isBraking = false;
                currentEvent = null;
              }
            }
          }
          if (isBraking && currentEvent) {
            const lastPoint = ridePoints[ridePoints.length - 1];
            events.push({
              time: currentEvent.time,
              endtime: lastPoint.time,
              maxspeed: Math.round(currentEvent.maxSpeed),
              lowspeed: Math.round(currentEvent.lowSpeed),
              braking: Math.round(currentEvent.maxBraking),
              class: "braking"
            });
          }
          return {
            count,
            events
          };
        };
        const finalizeRide = (camera = null) => __async(null, null, function* () {
          const dataToAnalyze = currentRideDataRef.current;
          logToScreen("=== \u958B\u59CB\u5206\u6790\u7D50\u7B97 ===");
          logToScreen(`\u7E3D\u5171\u6536\u96C6\u9EDE\u6578:${dataToAnalyze.length}`);
          if (dataToAnalyze.length === 0) {
            logToScreen("\u6C92\u6709\u6536\u96C6\u5230\u6578\u64DA\uFF0C\u53D6\u6D88\u7D50\u7B97");
            return;
          }
          const firstPoint = dataToAnalyze[0];
          const lastPoint = dataToAnalyze[dataToAnalyze.length - 1];
          if (!firstPoint || !lastPoint || !firstPoint.time || !lastPoint.time) {
            logToScreen("\u6578\u64DA\u50B3\u8F38\u4E0D\u5B8C\u6574 (\u7F3A\u5931\u6642\u6233)\uFF0C\u53D6\u6D88\u7D50\u7B97");
            return;
          }
          const overspeedRes = analyzeOverspeed(dataToAnalyze);
          const brakingRes = analyzeBraking(dataToAnalyze);
          const tiltRes = analyzeTilt(dataToAnalyze);
          let overspeedPenalty = 0;
          let tiltPenalty = 0;
          overspeedRes.events.forEach((ev) => {
            const n = Math.floor(ev.duration / 5);
            overspeedPenalty += Math.pow(2, n + 1);
          });
          tiltRes.events.forEach((ev) => {
            const n = Math.floor(ev.duration / 5);
            tiltPenalty += Math.pow(5, n + 1);
          });
          const brakingPenalty = (brakingRes.count || 0) * 3;
          const totalPenalty = overspeedPenalty + tiltPenalty + brakingPenalty;
          const finalScore = Math.max(0, 100 - totalPenalty);
          logToScreen(`\u6263\u5206\u7D71\u8A08: \u8D85\u901F-${overspeedPenalty}, \u50BE\u89D2-${tiltPenalty}, \u6025\u715E-${brakingPenalty}`);
          const locationName = camera && camera.address || lastPoint && lastPoint.location || "\u672A\u77E5\u8DEF\u6BB5";
          const rideId = Date.now().toString();
          let recordsToUpload = [];
          const processEvents = (res, type) => {
            res.events.forEach((ev) => {
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
                ride_id: rideId
                // 用來判斷是否為同一趟用
              });
            });
          };
          processEvents(overspeedRes, "overspeed");
          processEvents(brakingRes, "braking");
          processEvents(tiltRes, "tilt");
          if (recordsToUpload.length === 0) {
            recordsToUpload.push({
              user_id: currentUser.id,
              class: "normal",
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
          setWeeklyHistory((prev) => {
            const currentHistory = Array.isArray(prev) ? prev : [];
            let updated = [...currentHistory, ...recordsToUpload];
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
            const now2 = (/* @__PURE__ */ new Date()).getTime();
            updated = updated.filter((item) => !item.timestamp || now2 - item.timestamp < SEVEN_DAYS_MS);
            localStorage.setItem("ride_history", JSON.stringify(updated));
            logToScreen(`\u6B77\u53F2\u7D00\u9304\u5DF2\u66F4\u65B0\uFF0C\u76EE\u524D\u7E3D\u7B46\u6578:${updated.length}`);
            return updated;
          });
          try {
            const { error } = yield _supabase.from("ride_history").insert(recordsToUpload);
            if (error) throw error;
            logToScreen("\u2705 \u6210\u529F\u540C\u6B65\u81F3\u96F2\u7AEF\u8CC7\u6599\u5EAB");
          } catch (error) {
            logToScreen(`\u274C \u96F2\u7AEF\u540C\u6B65\u5931\u6557:${error.message}`);
          }
          if (isSimulatingRef.current) {
            alert(`\u2705 \u6A21\u64EC\u7D50\u675F\uFF1A\u5DF2\u901A\u904E ${locationName} \u4E26\u7E8C\u884C 100m\uFF0C\u672C\u6B21\u8D85\u901F\uFF1A${overspeedRes.count} \u6B21\uFF0C\u6025\u715E\uFF1A${brakingRes.count} \u6B21\uFF0C\u5371\u96AA\u50BE\u89D2\uFF1A${tiltRes.count} \u6B21\uFF0C\u6700\u7D42\u5F97\u5206\uFF1A${finalScore} \u5206`);
          }
          currentRideDataRef.current = [];
        });
        const startSimulation = () => {
          if (simulationMode) {
            setSimulationMode(false);
            setIsRiding(false);
            isSimulatingRef.current = false;
            if (simRef.current) clearInterval(simRef.current);
            setCameraAlert(null);
            return;
          }
          setRideData([]);
          currentRideDataRef.current = [];
          let targetCam = cameras.find((c) => c.address.includes("\u96EA\u5C71\u96A7\u9053") && c.address.includes("\u5357\u5411"));
          if (!targetCam) targetCam = cameras[0];
          const speedValue = forceSpeeding ? targetCam.limit + 15 : targetCam.limit - 5;
          let currentLat = targetCam.lat + 0.011;
          let currentLng = targetCam.lng;
          let passedTarget = false;
          let tick = 0;
          isSimulatingRef.current = true;
          setLocation({ lat: currentLat, lng: currentLng });
          setSimulationMode(true);
          setIsRiding(true);
          setSimulatedSpeed(speedValue);
          setIsConnected(true);
          simRef.current = setInterval(() => {
            tick++;
            currentLat -= 8e-5;
            const jitterLat = currentLat + (Math.random() - 0.5) * 2e-6;
            const jitterLng = currentLng + (Math.random() - 0.5) * 2e-6;
            setLocation({ lat: jitterLat, lng: jitterLng });
            if (trackRef.current) trackRef.current.push([jitterLat, jitterLng]);
            if (tick % 10 === 0) {
              let braking = 0;
              let tilt = 0;
              if (forceSpeeding) {
                if (Math.random() > 0.8) {
                  braking = 12 + Math.random() * 5;
                }
                if (Math.random() > 0.8) {
                  tilt = 40 + Math.floor(Math.random() * 11);
                } else {
                  tilt = 0 + Math.floor(Math.random() * 40);
                }
              }
              const simData = {
                time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                location: targetCam.address,
                speed: speedValue,
                // 啟動時根據按鈕決定的速度
                limit: targetCam.limit,
                braking,
                // 急煞值
                tilt
                // 傾角值
              };
              handleIncomingData(simData);
            }
            const dist = GeoUtils.calculateDistance(jitterLat, jitterLng, targetCam.lat, targetCam.lng);
            const physicallyPassed = currentLat < targetCam.lat;
            if (!passedTarget && (physicallyPassed || dist < 20)) {
              passedTarget = true;
              setCameraAlert(null);
              playWarningSound("pass", 1);
              logToScreen("[Sim] Camera Passed -> Alert Cleared & Sound Played");
              logToScreen("\u6210\u529F\u6A19\u8A18\u70BA\u5DF2\u901A\u904E\uFF01");
            }
            if (!passedTarget) {
              if (dist < 1e3 && enableSpeedCam) {
                setCameraAlert(__spreadProps(__spreadValues({}, targetCam), { distance: dist }));
              }
            } else {
              if (cameraAlert !== null) setCameraAlert(null);
            }
            if (Math.random() > 0.96) {
              const dirs = ["left", "right", "rear"];
              const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
              triggerEdgeWarning(randomDir);
            }
          }, 100);
        };
        useEffect(() => {
          let host = "192.168.4.1";
          if (window.location.hostname && !["localhost", "127.0.0.1", "", "192.168.4.1"].includes(window.location.hostname)) {
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
              setSystemStatus((prev) => __spreadProps(__spreadValues({}, prev), { pi5: true }));
              logToScreen("Neural Link: Wi-Fi Connected");
            };
            socket.onmessage = (event) => handleIncomingPayload(JSON.parse(event.data));
            socket.onclose = () => {
              if (!btConnected) setIsConnected(false);
            };
          } catch (e) {
            console.error("WS Security Block:", e);
            logToScreen("Wi-Fi Blocked by Security (HTTPS)", true);
          }
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
                  const names = devices.map((d) => d.name).join(", ");
                  logToScreen("Paired: " + names);
                }
                const target = devices.find(
                  (d) => d.name.toLowerCase().includes("pi5") || d.name.toLowerCase().includes("visor")
                );
                if (target) {
                  logToScreen("Linking to: " + target.name);
                  window.bluetoothSerial.connect(target.id, () => {
                    logToScreen("BT Link SUCCESS!");
                    btConnected = true;
                    btRef.current = window.bluetoothSerial;
                    setIsConnected(true);
                    setSystemStatus((prev) => __spreadProps(__spreadValues({}, prev), { pi5: true }));
                    window.bluetoothSerial.subscribe("\n", (data) => {
                      try {
                        handleIncomingPayload(JSON.parse(data));
                      } catch (e) {
                      }
                    });
                  }, (err) => {
                    logToScreen("Link Failed: " + err);
                    setTimeout(attemptConnect, 5e3);
                  });
                } else {
                  setTimeout(attemptConnect, 1e4);
                }
              }, (err) => {
                logToScreen("List Err: " + err, true);
                setTimeout(attemptConnect, 5e3);
              });
            };
            attemptConnect();
          };
          document.addEventListener("deviceready", initBluetooth, false);
          setTimeout(() => {
            if (!window.cordova) logToScreen("Diag: window.cordova undefined");
          }, 5e3);
          function handleIncomingPayload(data) {
            if (data.system) {
              setSystemStatus({
                pi5: true,
                piZero: data.system.hud_status === "online",
                cpu: data.system.cpu || 0,
                mem: data.system.mem || 0,
                temp: data.system.temp || 0
              });
            }
            if (!isSimulatingRef.current) {
              setSimulatedSpeed(Math.round(data.speed || 0));
              setTiltAngle(Math.round(data.tilt || 0));
            }
            if (data.type === "notification") {
              addNotification(data.level || "info", data.title || "\u7CFB\u7D71\u901A\u77E5", data.message);
            }
            if (data.warning && data.warning.level === "danger") {
              triggerEdgeWarning(data.warning.direction);
            } else if (data.alert === 1) {
              triggerEdgeWarning("rear");
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
        useEffect(() => {
          const unlockAudio = () => {
            initAudioContext().resume().then(() => {
              playWarningSound("silent");
              document.removeEventListener("touchstart", unlockAudio);
              document.removeEventListener("click", unlockAudio);
            });
          };
          document.addEventListener("touchstart", unlockAudio);
          document.addEventListener("click", unlockAudio);
          handleApiUpdate(true);
          return () => {
            document.removeEventListener("touchstart", unlockAudio);
            document.removeEventListener("click", unlockAudio);
          };
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
                  if (speedKmh > 3 && pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
                    setHeading(pos.coords.heading);
                  }
                }
              }, (err) => console.error("GPS Error:", err), { enableHighAccuracy: true });
            }
            if (window.bluetoothSerial) {
              window.bluetoothSerial.isEnabled(() => setIsConnected(true), () => console.log("Bluetooth not enabled"));
            }
          }, false);
          if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") {
            window.addEventListener("deviceorientation", handleOrientation);
            setHasGyroPermission(true);
          }
          return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
          };
        }, []);
        useEffect(() => {
          if (simulationMode || !enableSpeedCam) {
            if (!enableSpeedCam) setCameraAlert(null);
            return;
          }
          const checkCameras = () => {
            let nearest = null;
            let minDistance = Infinity;
            const warningRange = simulatedSpeed > 60 ? 800 : simulatedSpeed > 30 ? 500 : 300;
            cameras.forEach((cam) => {
              const dist = GeoUtils.calculateDistance(location.lat, location.lng, cam.lat, cam.lng);
              if (dist < warningRange) {
                let isDirectionValid = true;
                if (typeof GeoUtils.isDirectionMatch === "function") {
                  isDirectionValid = GeoUtils.isDirectionMatch(heading, cam.heading, 60);
                }
                if (isDirectionValid && dist < minDistance) {
                  minDistance = dist;
                  nearest = __spreadProps(__spreadValues({}, cam), { distance: dist });
                }
              }
            });
            if (nearest) {
              const isStationary = simulatedSpeed < 5;
              const isOverSpeed = simulatedSpeed > nearest.limit;
              const isSilent = isStationary || !isOverSpeed;
              setCameraAlert(__spreadProps(__spreadValues({}, nearest), { isSilent }));
            } else {
              setCameraAlert(null);
            }
          };
          const interval = setInterval(checkCameras, 1e3);
          return () => clearInterval(interval);
        }, [location, cameras, simulationMode, enableSpeedCam, simulatedSpeed, heading]);
        useEffect(() => {
          if (!hasGyroPermission || simulationMode) {
            const interval = setInterval(() => {
              if (simulationMode) {
                const rnd = Math.random();
                let mockAngle;
                if (rnd > 0.95) mockAngle = 60;
                else if (rnd > 0.8) mockAngle = 40;
                else mockAngle = Math.floor(Math.random() * 20 - 10);
                handleOrientation({ gamma: mockAngle });
              }
            }, 500);
            return () => clearInterval(interval);
          }
        }, [hasGyroPermission, simulationMode]);
        const toggleFullScreen = () => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch((e) => {
          });
          else if (document.exitFullscreen) document.exitFullscreen();
        };
        const renderLogin = () => /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center h-full px-6 animate-fadeIn pb-32" }, /* @__PURE__ */ React.createElement("div", { className: "mb-8 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse" }, /* @__PURE__ */ React.createElement(Icon, { name: "shield-check", size: 40, className: "text-cyan-400" })), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-black italic tracking-widest text-white" }, "V.I.S.O.R."), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-cyan-500/70 font-mono tracking-[0.3em] mt-1" }, "SYSTEM LOGIN")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleLogin, className: "w-full max-w-sm space-y-4" }, authError && /* @__PURE__ */ React.createElement("div", { className: "bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded-lg text-center flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 14 }), authError), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 font-bold ml-1" }, "CALLSIGN / \u5E33\u865F"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" }, /* @__PURE__ */ React.createElement(Icon, { name: "user", size: 16 })), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "text",
            value: authForm.username,
            onChange: (e) => setAuthForm(__spreadProps(__spreadValues({}, authForm), { username: e.target.value })),
            className: "w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] focus:outline-none transition-all",
            placeholder: "Enter ID...",
            required: true
          }
        ))), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 font-bold ml-1" }, "PASSCODE / \u5BC6\u78BC"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" }, /* @__PURE__ */ React.createElement(Icon, { name: "lock", size: 16 })), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "password",
            value: authForm.password,
            onChange: (e) => setAuthForm(__spreadProps(__spreadValues({}, authForm), { password: e.target.value })),
            className: "w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.2)] focus:outline-none transition-all",
            placeholder: "Enter Code...",
            required: true
          }
        ))), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/50 border border-cyan-400/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 group" }, /* @__PURE__ */ React.createElement("span", null, "INITIALIZE LINK"), /* @__PURE__ */ React.createElement(Icon, { name: "arrow-right", size: 16, className: "group-hover:translate-x-1 transition-transform" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
          setActiveTab("register");
          setAuthError("");
          setAuthForm({ username: "", password: "", confirmPassword: "" });
        }, className: "text-slate-500 text-xs hover:text-cyan-400 transition-colors" }, "\u5EFA\u7ACB\u65B0\u6230\u8853\u6A94\u6848 (Register)")));
        const renderRegister = () => /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center h-full px-6 animate-fadeIn pb-32" }, /* @__PURE__ */ React.createElement("div", { className: "mb-6 text-center" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-white" }, "\u5EFA\u7ACB\u6A94\u6848"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 font-mono" }, "NEW OPERATOR REGISTRATION")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleRegister, className: "w-full max-w-sm space-y-4" }, authError && /* @__PURE__ */ React.createElement("div", { className: "bg-red-900/50 border border-red-500 text-red-200 text-xs p-3 rounded-lg text-center" }, authError), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 font-bold ml-1" }, "\u5E33\u865F"), /* @__PURE__ */ React.createElement("input", { type: "text", value: authForm.username, onChange: (e) => setAuthForm(__spreadProps(__spreadValues({}, authForm), { username: e.target.value })), className: "w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none", required: true })), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 font-bold ml-1" }, "\u5BC6\u78BC"), /* @__PURE__ */ React.createElement("input", { type: "password", value: authForm.password, onChange: (e) => setAuthForm(__spreadProps(__spreadValues({}, authForm), { password: e.target.value })), className: "w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none", required: true })), /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-slate-400 font-bold ml-1" }, "\u78BA\u8A8D\u5BC6\u78BC"), /* @__PURE__ */ React.createElement("input", { type: "password", value: authForm.confirmPassword, onChange: (e) => setAuthForm(__spreadProps(__spreadValues({}, authForm), { confirmPassword: e.target.value })), className: "w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 focus:outline-none", required: true })), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "w-full bg-slate-700 hover:bg-cyan-600 text-white font-bold py-3.5 rounded-xl border border-slate-600 transition-all active:scale-95 mt-4" }, "\u78BA\u8A8D\u8A3B\u518A")), /* @__PURE__ */ React.createElement("div", { className: "mt-6 text-center" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
          setActiveTab("login");
          setAuthError("");
        }, className: "text-slate-500 text-xs hover:text-white transition-colors" }, "\u8FD4\u56DE\u767B\u5165 (Back to Login)")));
        const renderHome = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-4 animate-fadeIn pb-32 relative" }, /* @__PURE__ */ React.createElement(SpeedCameraAlert, { alert: cameraAlert, currentSpeed: simulatedSpeed }), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative aspect-video shadow-md" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-1 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300" }, "FRONT_CAM (Port: 8000)"), /* @__PURE__ */ React.createElement("img", { src: `http://${window.location.hostname || "192.168.4.1"}:8000/stream.mjpg`, style: { width: "100%", height: "100%", objectFit: "cover" }, onError: (e) => {
          e.target.parentElement.style.display = "none";
          e.target.parentElement.parentElement.classList.remove("grid-cols-2");
          e.target.parentElement.parentElement.classList.add("grid-cols-1");
        } }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex-col items-center justify-center text-slate-600 hidden" }, /* @__PURE__ */ React.createElement(Icon, { name: "video-off", size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] mt-1 text-center font-bold px-2 tracking-wider" }, "OFFLINE", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "font-normal text-[8px]" }, "\u786C\u9AD4\u4E32\u6D41\u672A\u555F\u52D5\u6216 IP \u932F\u8AA4")))), /* @__PURE__ */ React.createElement("div", { className: "bg-black/50 border border-slate-700 rounded-xl overflow-hidden relative aspect-video shadow-md" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-1 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-[9px] font-bold text-slate-300" }, "REAR_CAM (Port: 8001)"), /* @__PURE__ */ React.createElement("img", { src: `http://${window.location.hostname || "192.168.4.1"}:8001/stream.mjpg`, style: { width: "100%", height: "100%", objectFit: "cover" }, onError: (e) => {
          e.target.style.display = "none";
          e.target.nextElementSibling.style.display = "flex";
        } }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex-col items-center justify-center text-slate-600 hidden" }, /* @__PURE__ */ React.createElement(Icon, { name: "video-off", size: 24 }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] mt-1 text-center font-bold px-2 tracking-wider" }, "OFFLINE", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "font-normal text-[8px]" }, "\u786C\u9AD4\u4E32\u6D41\u672A\u555F\u52D5\u6216 IP \u932F\u8AA4"))))), /* @__PURE__ */ React.createElement("div", { className: `bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 relative overflow-hidden min-h-[225px]` }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 p-4 opacity-10" }, /* @__PURE__ */ React.createElement(Icon, { name: "shield", size: 120, className: "text-cyan-400" })), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-4 relative z-10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-slate-400 text-sm font-medium" }, "\u7CFB\u7D71\u72C0\u614B"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mt-1" }, /* @__PURE__ */ React.createElement("span", { className: `w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" : "bg-red-500"}` }), /* @__PURE__ */ React.createElement("span", { className: "text-white font-bold text-lg" }, isConnected ? "\u7CFB\u7D71\u9023\u7DDA\u4E2D" : "\u672A\u9023\u7DDA"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 text-xs ml-2 font-mono" }, systemStatus.temp, "\xB0C"))), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 bg-slate-900/50 px-2 py-1 rounded border border-slate-600 flex flex-col items-end" }, /* @__PURE__ */ React.createElement("span", null, "DB: ", dbInfo.source), /* @__PURE__ */ React.createElement("span", { className: "text-cyan-400" }, dbInfo.count, " \u9EDE"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center z-10 -mt-4" }, /* @__PURE__ */ React.createElement("div", { className: `text-8xl font-black font-mono tracking-tighter leading-none transition-colors duration-200 
                                ${simulatedSpeed > ((cameraAlert == null ? void 0 : cameraAlert.limit) || 999) ? "text-red-500 animate-pulse" : "text-cyan-400"}` }, simulatedSpeed), /* @__PURE__ */ React.createElement("div", { className: "text-xl font-bold tracking-[0.3em] text-slate-500 -mt-4" }, "KM/H")), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-5 w-full flex items-center justify-center gap-3 z-10 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-40 h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm" }, /* @__PURE__ */ React.createElement("div", { className: "absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500/50 -translate-x-1/2 z-20" }), /* @__PURE__ */ React.createElement(
          "div",
          {
            className: `absolute top-0 bottom-0 transition-all duration-100 ease-linear ${Math.abs(tiltAngle) > 35 ? "bg-red-500" : "bg-cyan-400"}`,
            style: {
              left: "50%",
              width: `${Math.min(Math.abs(tiltAngle) * 2, 50)}%`,
              // 限制寬度不超過單邊 50%
              transform: `translateX(${tiltAngle < 0 ? "-100%" : "0"})`
            }
          }
        )), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-mono font-bold text-slate-400 w-8" }, Math.abs(tiltAngle), "\xB0"))), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement(SOSButton, { currentLocation: location, onTrigger: triggerSOS }), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("button", { onClick: toggleSentry, className: `p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border active:scale-95 ${isSentryMode ? "bg-cyan-900/30 border-cyan-500/50" : "bg-slate-800 border-slate-700"}` }, /* @__PURE__ */ React.createElement(Icon, { name: "eye", size: 24, className: isSentryMode ? "text-cyan-400" : "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: `font-medium text-sm ${isSentryMode ? "text-cyan-100" : "text-slate-400"}` }, isSentryMode ? "\u54E8\u5175\u6A21\u5F0F" : "\u54E8\u5175\u5F85\u6A5F")), /* @__PURE__ */ React.createElement("button", { onClick: handleToggleDetection, className: `p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border active:scale-95 ${enableSpeedCam ? "bg-green-900/30 border-green-500/50" : "bg-slate-800 border-slate-700"}` }, /* @__PURE__ */ React.createElement(Icon, { name: enableSpeedCam ? "camera" : "camera-off", size: 24, className: enableSpeedCam ? "text-green-400" : "text-slate-400" }), /* @__PURE__ */ React.createElement("span", { className: `font-medium text-sm ${enableSpeedCam ? "text-green-100" : "text-slate-400"}` }, enableSpeedCam ? "\u5075\u6E2C\u555F\u52D5" : "\u672A\u5075\u6E2C"))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2 mb-4 p-3 bg-gray-800 rounded-xl border border-gray-700" }, /* @__PURE__ */ React.createElement("p", { className: "text-gray-400 text-xs font-bold uppercase tracking-wider" }, "\u6E2C\u8A66\u6A21\u5F0F\u8A2D\u5B9A"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setForceSpeeding(false),
            className: `flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${!forceSpeeding ? "bg-green-600 text-white shadow-lg ring-2 ring-green-400" : "bg-gray-700 text-gray-400 opacity-50"}`
          },
          "\u{1F7E2} \u5B89\u5168\u884C\u99DB"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setForceSpeeding(true),
            className: `flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${forceSpeeding ? "bg-red-600 text-white shadow-lg ring-2 ring-red-400" : "bg-gray-700 text-gray-400 opacity-50"}`
          },
          "\u{1F534} \u5371\u96AA\u99D5\u99DB"
        ))), /* @__PURE__ */ React.createElement("button", { onClick: startSimulation, className: `w-full py-3 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${simulationMode ? "bg-red-900/50 border-red-500 text-white animate-pulse" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"}` }, /* @__PURE__ */ React.createElement(Icon, { name: simulationMode ? "stop-circle" : "play-circle", size: 14 }), simulationMode ? "\u505C\u6B62\u8DEF\u6E2C\u6A21\u64EC" : "\u555F\u52D5\u8DEF\u6E2C\u6A21\u64EC (\u6E2C\u8A66\u7528)")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700 overflow-hidden relative" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-3" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-sm flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "map", size: 16, className: "text-blue-400" }), " \u5373\u6642\u8ECC\u8DE1")), /* @__PURE__ */ React.createElement("div", { className: "h-40 w-full bg-slate-900 rounded-lg relative overflow-hidden border border-slate-600/50" }, /* @__PURE__ */ React.createElement(LeafletMap, { location, isTracking: true, trackHistory: trackRef }), /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-cyan-400 border border-cyan-500/30 z-[400]" }, location.lat.toFixed(5), ", ", location.lng.toFixed(5)))));
        const renderEvents = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-4 animate-fadeIn pb-24" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-white mb-2" }, "\u667A\u6167\u4E8B\u4EF6\u7C3F"), eventData.map((event) => /* @__PURE__ */ React.createElement("div", { key: event.id, className: "bg-slate-800 p-3 rounded-xl border border-slate-700 flex gap-4 hover:border-cyan-500/40 transition-colors" }, /* @__PURE__ */ React.createElement("div", { className: "w-24 h-24 bg-slate-900 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden group cursor-pointer border border-slate-700/50" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" }), /* @__PURE__ */ React.createElement(Icon, { name: "play-circle", size: 32, className: "text-white/80 z-10 group-hover:scale-110 group-hover:text-cyan-400 transition-all" }), /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono" }, event.duration)), /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col justify-between py-1" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-md leading-tight" }, event.title), event.type === "danger" && /* @__PURE__ */ React.createElement(Icon, { name: "alert-triangle", size: 16, className: "text-red-500 flex-shrink-0" })), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-xs mt-1.5 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Icon, { name: "map-pin", size: 10 }), " ", event.loc), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-[10px] mt-0.5" }, event.time)), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mt-2" }, /* @__PURE__ */ React.createElement("button", { className: "flex-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs py-1.5 rounded transition-colors font-medium" }, "\u56DE\u653E"), /* @__PURE__ */ React.createElement("button", { className: "flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-1.5 rounded transition-colors font-medium" }, "\u4E0B\u8F09"))))));
        const [dayAnalyzeData, setDayAnalyzeData] = useState([]);
        const [monthAnalyzeData, setMonthAnalyzeData] = useState([]);
        const [sevenDayAnalyzeData, setSevenDayAnalyzeData] = useState([]);
        const [rawRideHistory, setRawRideHistory] = useState([]);
        const [isInitialLoading, setIsInitialLoading] = useState(true);
        React.useEffect(() => {
          const cacheGet = (key) => {
            try {
              const cached = sessionStorage.getItem("visor_cache_" + key);
              if (cached) {
                const { data, time } = JSON.parse(cached);
                if (Date.now() - time < 3e4) return data;
              }
            } catch (e) {
            }
            return null;
          };
          const cacheSet = (key, data) => {
            try {
              sessionStorage.setItem("visor_cache_" + key, JSON.stringify({ data, time: Date.now() }));
            } catch (e) {
            }
          };
          const fenthAnalyze = () => __async(null, null, function* () {
            if (!currentUser) return;
            const uid = currentUser.id;
            const cachedDay = cacheGet("day_" + uid);
            const cachedMonth = cacheGet("month_" + uid);
            const cachedSeven = cacheGet("seven_" + uid);
            const cachedRaw = cacheGet("raw_" + uid);
            if (cachedDay && cachedMonth && cachedSeven && cachedRaw) {
              setDayAnalyzeData(cachedDay);
              setMonthAnalyzeData(cachedMonth);
              setSevenDayAnalyzeData(cachedSeven);
              setRawRideHistory(cachedRaw);
              setIsInitialLoading(false);
              return;
            }
            try {
              const [dayResponse, monthResponse, sevendayResponse, rawResponse] = yield Promise.all([
                _supabase.from("day_ride").select("*").eq("user_id", uid).order("date_label", { ascending: false }).limit(30),
                _supabase.from("month_ride").select("*").eq("user_id", uid).order("month_label", { ascending: false }).limit(12),
                _supabase.from("day_ride").select("*").eq("user_id", uid).order("date_label", { ascending: false }).limit(7),
                _supabase.from("ride_history").select("*").eq("user_id", uid).order("time", { ascending: false }).limit(150)
              ]);
              if (dayResponse.error) throw dayResponse.error;
              if (monthResponse.error) throw monthResponse.error;
              if (sevendayResponse.error) throw sevendayResponse.error;
              if (rawResponse.error) throw rawResponse.error;
              const dayData = dayResponse.data || [];
              const monthData2 = monthResponse.data || [];
              const sevenData = sevendayResponse.data || [];
              const rawData = rawResponse.data || [];
              cacheSet("day_" + uid, dayData);
              cacheSet("month_" + uid, monthData2);
              cacheSet("seven_" + uid, sevenData);
              cacheSet("raw_" + uid, rawData);
              setDayAnalyzeData(dayData);
              setMonthAnalyzeData(monthData2);
              setSevenDayAnalyzeData(sevenData);
              setRawRideHistory(rawData);
              logToScreen(`\u2705 \u5DF2\u6210\u529F\u7372\u53D6\u9A0E\u4E58\u5206\u6790\u6578\u64DA`);
            } catch (error) {
              logToScreen(`\u274C \u8B80\u53D6\u5206\u6790\u6578\u64DA\u5931\u6557: ${error.message}`);
            } finally {
              setIsInitialLoading(false);
            }
          });
          if (currentUser && activeTab === "stats") {
            fenthAnalyze();
          }
        }, [currentUser, activeTab]);
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const monthLabel = `${year}-${month}`;
        const monthData = monthAnalyzeData.find((d) => d.month_label === monthLabel);
        const stats = {
          averageScore: monthData ? Math.round(parseFloat(monthData.avg_score || 0)) : "---",
          overspeed: monthData ? monthData.total_overspeed || 0 : 0,
          braking: monthData ? monthData.total_breaking || 0 : 0,
          tilt: monthData ? monthData.total_tilt || 0 : 0,
          trips: monthData ? monthData.total_trips || 0 : 0
        };
        const [viewMode, setViewMode] = React.useState("week");
        const activeData = viewMode === "week" ? sevenDayAnalyzeData : monthAnalyzeData;
        const BarChart = React.memo(({ data, viewMode: viewMode2, setViewMode: setViewMode2 }) => {
          const filteredData = React.useMemo(() => {
            const count = viewMode2 === "week" ? 7 : 12;
            return Array.from({ length: count }).map((_, i) => {
              const d = /* @__PURE__ */ new Date();
              if (viewMode2 === "week") {
                d.setDate(d.getDate() - i);
                const label = d.toLocaleDateString("en-CA");
                const match = data == null ? void 0 : data.find((item) => item.date_label === label);
                return match || { date_label: label, avg_score: 0 };
              } else {
                d.setMonth(d.getMonth() - i);
                const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                const match = data == null ? void 0 : data.find((item) => item.month_label === label);
                return match || { month_label: label, avg_score: 0 };
              }
            }).reverse();
          }, [data, viewMode2]);
          return /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-2" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-slate-100" }, "\u8A55\u5206\u8DA8\u52E2"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 font-mono tracking-widest uppercase" }, viewMode2 === "week" ? "\u8FD17\u65E5" : "\u8FD112\u500B\u6708")), /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-900/80 p-1 rounded-xl border border-slate-700" }, /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setViewMode2("week"),
              className: `px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode2 === "week" ? "bg-cyan-500 text-slate-900" : "text-slate-500"}`
            },
            "\u9031"
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => setViewMode2("month"),
              className: `px-4 py-1.5 rounded-lg text-xs font-black transition-all ${viewMode2 === "month" ? "bg-cyan-500 text-slate-900" : "text-slate-500"}`
            },
            "\u6708"
          ))), /* @__PURE__ */ React.createElement("div", { className: "h-48 w-full flex items-end gap-2 px-2" }, filteredData.map((item, index) => {
            const score = Math.round(Number(item.avg_score || 0));
            const hasData = score > 0;
            let barColor = "#97CBFF";
            const currentLabel = item.date_label || item.month_label;
            return (
              // 每個柱狀圖的容器
              /* @__PURE__ */ React.createElement("div", { key: currentLabel || index, className: "flex-1 min-w-0 flex flex-col items-center group relative h-full justify-end" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full flex flex-col items-center justify-end h-full" }, /* @__PURE__ */ React.createElement("span", { className: `mb-2 text-[10px] font-mono font-black transition-colors ${hasData ? "text-cyan-400" : "text-transparent"}` }, score), hasData ? (
                /* 有資料：顯示直條 */
                /* @__PURE__ */ React.createElement(
                  "div",
                  {
                    className: "w-full rounded-t-sm transition-all duration-700 ease-out",
                    style: {
                      height: `${score * 0.8}%`,
                      backgroundColor: barColor
                    }
                  }
                )
              ) : (
                /* 無資料：顯示驚嘆號圖示 */
                /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center mb-1 animate-pulse" }, /* @__PURE__ */ React.createElement("div", { className: "text-amber-500 bg-amber-500/10 rounded-full w-6 h-6 flex items-center justify-center border border-amber-500/50" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold" }, "!")))
              )), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 mt-3 font-mono whitespace-nowrap" }, (() => {
                const parts = currentLabel.split("-");
                const value = viewMode2 === "week" ? parts[2] : parts[1];
                return `${value}${viewMode2 === "week" ? "\u65E5" : "\u6708"}`;
              })()))
            );
          })), /* @__PURE__ */ React.createElement("div", { className: "mt-4 border-t border-slate-700/50 pt-3 flex justify-between gap-4 text-xs text-slate-500 font-mono items-baseline" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-amber-500 bg-amber-500/10 rounded-full w-6 h-6 flex items-center justify-center border border-amber-500/50" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold" }, "!")), /* @__PURE__ */ React.createElement("span", null, "\uFF1A\u7121\u8CC7\u6599")), /* @__PURE__ */ React.createElement("span", { className: `${thirtyD[29].isToday ? "text-cyan-500" : ""}` }, "\u4ECA\u65E5\u65E5\u671F: ", thirtyD[29].yearNum, "/", thirtyD[29].monthNum, "/", thirtyD[29].dayNum)));
        });
        const RealDataDashboard = React.useMemo(() => function DashboardComponent({ data }) {
          const [view, setView] = React.useState("session");
          const safeData = (data || []).filter((item) => {
            if (!item.time || new Date(item.time).getTime() < 9466848e5) return false;
            if (item.class === "normal" && item.maxspeed === 0) return false;
            return true;
          });
          const uniqueRides = [];
          const seenRideIds = /* @__PURE__ */ new Set();
          safeData.forEach((item) => {
            if (item.ride_id && !seenRideIds.has(item.ride_id)) {
              seenRideIds.add(item.ride_id);
              const rideEvents = safeData.filter((e) => e.ride_id === item.ride_id);
              const maxSpd = Math.max(...rideEvents.map((e) => e.maxspeed || 0));
              uniqueRides.push(__spreadProps(__spreadValues({}, item), { rideMaxSpeed: maxSpd }));
            } else if (!item.ride_id) {
              uniqueRides.push(__spreadProps(__spreadValues({}, item), { rideMaxSpeed: item.maxspeed || 0 }));
            }
          });
          const displaySession = uniqueRides;
          const displayOverspeed = safeData.filter((i) => i.class === "overspeed");
          const displayTilt = safeData.filter((i) => i.class === "tilt");
          const displayBrake = safeData.filter((i) => i.class === "braking");
          return /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 rounded-2xl p-5 border border-slate-700 shadow-xl mt-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-5" }, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-sm flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "hard-drive", size: 18, className: "text-cyan-400" }), "\u5BE6\u6A5F\u786C\u9AD4\u5075\u6E2C\u7D00\u9304"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500 font-mono tracking-widest uppercase" }, "Real-World Data")), /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-900 rounded-xl p-1.5 border border-slate-600 mb-4" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setView("session"), className: `flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === "session" ? "bg-cyan-900/50 text-cyan-400 border border-cyan-500/50 shadow-md" : "text-slate-500 hover:text-slate-300"}` }, "\u7D00\u9304 (", displaySession.length, ")"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("overspeed"), className: `flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === "overspeed" ? "bg-slate-800 text-slate-300 border border-slate-600 shadow-md" : "text-slate-500 hover:text-slate-300"}` }, "\u8D85\u901F (", displayOverspeed.length, ")"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("tilt"), className: `flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === "tilt" ? "bg-slate-800 text-slate-300 border border-slate-600 shadow-md" : "text-slate-500 hover:text-slate-300"}` }, "\u50BE\u89D2 (", displayTilt.length, ")"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("brake"), className: `flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === "brake" ? "bg-slate-800 text-slate-300 border border-slate-600 shadow-md" : "text-slate-500 hover:text-slate-300"}` }, "\u6025\u715E (", displayBrake.length, ")")), /* @__PURE__ */ React.createElement("div", { className: "max-h-[260px] overflow-y-auto custom-scrollbar pr-2 w-full" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs text-slate-400" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-900/80 text-slate-500 font-mono sticky top-0 z-10 backdrop-blur-md" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "p-3 rounded-tl-lg font-bold" }, view === "session" ? "\u7D50\u7B97\u6642\u9593" : "\u767C\u751F\u6642\u9593"), /* @__PURE__ */ React.createElement("th", { className: "p-3 font-bold" }, view === "session" ? "\u5168\u8D9F\u6700\u9AD8\u6642\u901F" : "\u5075\u6E2C\u6578\u503C"), /* @__PURE__ */ React.createElement("th", { className: "p-3 rounded-tr-lg font-bold" }, view === "session" ? "\u6E2C\u901F\u5340\u6700\u9AD8\u901F" : "\u57FA\u6E96/\u9650\u901F"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-700/50" }, view === "session" && displaySession.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "p-6 text-center text-slate-500" }, "\u5C1A\u7121\u5B8C\u6574\u884C\u99DB\u7D00\u9304")), view === "session" && displaySession.map((item, index) => /* @__PURE__ */ React.createElement("tr", { key: `session-${item.id || item.time}-${index}`, className: "hover:bg-slate-800/50 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-white" }, new Date(item.time).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-cyan-400 font-bold" }, item.rideMaxSpeed, " km/h"), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-500" }, item.limit ? `${item.limit} km/h` : "\u7121"))), view === "overspeed" && displayOverspeed.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "p-6 text-center text-slate-500" }, "\u8868\u73FE\u512A\u826F\uFF0C\u672C\u6B21\u7121\u7D00\u9304")), view === "overspeed" && displayOverspeed.map((item, index) => /* @__PURE__ */ React.createElement("tr", { key: `os-${item.id || item.time}-${index}`, className: "hover:bg-slate-800/50 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-white" }, new Date(item.time).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-red-400 font-bold" }, item.maxspeed, " km/h"), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-500" }, item.limit, " km/h"))), view === "tilt" && displayTilt.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "p-6 text-center text-slate-500" }, "\u7121\u5371\u96AA\u50BE\u89D2\u7D00\u9304")), view === "tilt" && displayTilt.map((item, index) => /* @__PURE__ */ React.createElement("tr", { key: `tilt-${item.id || item.time}-${index}`, className: "hover:bg-slate-800/50 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-white" }, new Date(item.time).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-orange-400 font-bold" }, item.tilt, "\xB0"), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-500" }, "< 40\xB0"))), view === "brake" && displayBrake.length === 0 && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "3", className: "p-6 text-center text-slate-500" }, "\u7121\u6025\u715E\u7D00\u9304")), view === "brake" && displayBrake.map((item, index) => /* @__PURE__ */ React.createElement("tr", { key: `brk-${item.id || item.time}-${index}`, className: "hover:bg-slate-800/50 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-white" }, new Date(item.time).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-yellow-400 font-bold" }, item.braking, " km/h/s"), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-slate-500" }, "< 10")))))));
        }, []);
        const renderStats = () => {
          return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn pb-24" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-br from-cyan-950 to-blue-950 p-6 rounded-2xl text-white flex justify-between items-center shadow-lg border border-cyan-500/20" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-cyan-200 text-xs uppercase tracking-wider font-semibold" }, monthData ? "\u672C\u6708\u5B89\u5168\u8A55\u5206" : "\u5C1A\u7121\u6578\u64DA"), /* @__PURE__ */ React.createElement("div", { className: "text-6xl font-black mt-2 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent" }, stats.averageScore)), /* @__PURE__ */ React.createElement("div", { className: "text-right space-y-2 border-l border-white/10 pl-6 flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200 flex justify-between items-baseline gap-4" }, "\u8D85\u901F ", /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white text-base" }, stats.overspeed), " \u6B21")), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200 flex justify-between items-baseline gap-4" }, "\u6025\u715E ", /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white text-base" }, stats.braking), " \u6B21")), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200 flex justify-between items-baseline gap-4" }, "\u5371\u96AA\u50BE\u89D2 ", /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white text-base" }, stats.tilt), " \u6B21")), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200 flex justify-between items-baseline gap-4" }, "\u9A0E\u4E58\u6B21\u6578 ", /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-200" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-white text-base" }, stats.trips), " \u6B21")))), /* @__PURE__ */ React.createElement(RealDataDashboard, { data: rawRideHistory }), /* @__PURE__ */ React.createElement(AIReportCard, { currentUser }), /* @__PURE__ */ React.createElement(
            BarChart,
            {
              data: activeData,
              viewMode,
              setViewMode
            }
          ), /* @__PURE__ */ React.createElement("div", { className: "space-y-4 px-2" }, /* @__PURE__ */ React.createElement(
            EventCalendar,
            {
              data: dayAnalyzeData,
              dataKey: "total_overspeed",
              color: "#FACC15",
              label: "\u8D85\u901F",
              currentUser
            }
          ), /* @__PURE__ */ React.createElement(
            EventCalendar,
            {
              data: dayAnalyzeData,
              dataKey: "total_breaking",
              color: "#FB923C",
              label: "\u6025\u715E",
              currentUser
            }
          ), /* @__PURE__ */ React.createElement(
            EventCalendar,
            {
              data: dayAnalyzeData,
              dataKey: "total_tilt",
              color: "#F87171",
              label: "\u5371\u96AA\u50BE\u89D2",
              currentUser
            }
          )));
        };
        const renderHudPage = () => {
          const options = [
            { id: "speed", label: "\u986F\u793A\u5373\u6642\u6642\u901F" },
            { id: "camera", label: "\u6E2C\u901F\u7167\u76F8\u63D0\u9192" },
            { id: "nav", label: "\u986F\u793A\u5C0E\u822A\u8CC7\u8A0A" },
            { id: "time", label: "\u986F\u793A\u76EE\u524D\u6642\u9593" }
          ];
          return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn pb-24" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-white" }, "HUD \u986F\u793A\u914D\u7F6E"), /* @__PURE__ */ React.createElement(HUDPreview, { config: hudConfig }), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl overflow-hidden border border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-slate-700" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 text-sm font-bold mb-3 uppercase tracking-wider" }, "\u986F\u793A\u5167\u5BB9\u958B\u95DC"), options.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-white text-sm" }, item.label), /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: () => updateHudConfig({ [item.id]: !hudConfig[item.id] }),
              className: `w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${hudConfig[item.id] ? "bg-cyan-600" : "bg-slate-600"}`
            },
            /* @__PURE__ */ React.createElement("div", { className: `w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hudConfig[item.id] ? "translate-x-6" : ""}` })
          )))), /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 text-sm font-bold mb-3 uppercase tracking-wider" }, "OLED \u4EAE\u5EA6"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(Icon, { name: "sun", size: 16, className: "text-slate-400" }), /* @__PURE__ */ React.createElement(
            "input",
            {
              type: "range",
              className: "w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500",
              min: "0",
              max: "255",
              value: hudConfig.brightness,
              onChange: (e) => setHudConfig(__spreadProps(__spreadValues({}, hudConfig), { brightness: parseInt(e.target.value) })),
              onMouseUp: (e) => updateHudConfig({ brightness: parseInt(e.target.value) }),
              onTouchEnd: (e) => updateHudConfig({ brightness: parseInt(e.target.value) })
            }
          ), /* @__PURE__ */ React.createElement(Icon, { name: "sun", size: 24, className: "text-white" })))));
        };
        const renderSettings = () => {
          var _a, _b;
          return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 animate-fadeIn pb-24" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-white" }, "\u8A2D\u5B9A"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" }, /* @__PURE__ */ React.createElement(Icon, { name: "user", size: 24, className: "text-cyan-400" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 font-mono tracking-widest uppercase" }, "Current Operator"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-bold text-white tracking-wide" }, ((_a = currentUser == null ? void 0 : currentUser.user_metadata) == null ? void 0 : _a.display_name) || ((_b = currentUser == null ? void 0 : currentUser.email) == null ? void 0 : _b.split("@")[0]) || "Unknown"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl overflow-hidden border border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-slate-700" }, /* @__PURE__ */ React.createElement("h3", { className: "text-red-400 text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "power", size: 16 }), " \u96FB\u6E90\u7BA1\u7406"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 mb-1" }, /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => handleShutdown("pi5"),
              disabled: !systemStatus.pi5,
              className: `flex flex-col items-center justify-center gap-2 p-3 border rounded-xl transition-all text-white active:scale-95 group ${systemStatus.pi5 ? "bg-red-900/30 border-red-500/50 hover:bg-red-800/80 cursor-pointer" : "bg-slate-800 border-slate-600 opacity-50 cursor-not-allowed"}`
            },
            /* @__PURE__ */ React.createElement(Icon, { name: "cpu", size: 24, className: systemStatus.pi5 ? "text-red-400 group-hover:text-white" : "text-slate-500" }),
            /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold tracking-wider" }, systemStatus.pi5 ? "\u4E3B\u6A5F (Pi 5)" : "\u4E3B\u6A5F\u65B7\u7DDA")
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => handleShutdown("pizero"),
              disabled: !systemStatus.piZero,
              className: `flex flex-col items-center justify-center gap-2 p-3 border rounded-xl transition-all text-white active:scale-95 group ${systemStatus.piZero ? "bg-orange-900/30 border-orange-500/50 hover:bg-orange-800/80 cursor-pointer" : "bg-slate-800 border-slate-600 opacity-50 cursor-not-allowed"}`
            },
            /* @__PURE__ */ React.createElement(Icon, { name: "monitor", size: 24, className: systemStatus.piZero ? "text-orange-400 group-hover:text-white" : "text-slate-500" }),
            /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold tracking-wider" }, systemStatus.piZero ? "\u95DC\u9589 HUD (Pi 0)" : "HUD \u65B7\u7DDA")
          )))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center py-4 border-b border-slate-700" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-white text-sm" }, "\u7CFB\u7D71 Tactical \u9762\u677F (Terminal Console)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "\u986F\u793A\u5E95\u5C64\u5373\u6642\u9664\u932F\u65E5\u8A8C\u8207\u901A\u8A0A\u72C0\u6CC1")), /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: () => setShowConsole(!showConsole),
              className: `w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${showConsole ? "bg-cyan-600" : "bg-slate-600"}`
            },
            /* @__PURE__ */ React.createElement("div", { className: `w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${showConsole ? "translate-x-6" : ""}` })
          )), /* @__PURE__ */ React.createElement("button", { onClick: handleLogout, className: "w-full bg-red-900/30 hover:bg-red-800/50 text-red-500 hover:text-red-400 py-3 rounded-xl border border-red-500/30 transition-colors flex items-center justify-center gap-2 mt-4" }, /* @__PURE__ */ React.createElement(Icon, { name: "log-out", size: 18 }), /* @__PURE__ */ React.createElement("span", null, "\u5B89\u5168\u767B\u51FA"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 text-sm font-bold mb-4 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "volume-2", size: 16 }), " \u7CFB\u7D71\u97F3\u6548"), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-white text-sm" }, "\u5168\u57DF\u975C\u97F3 (\u6240\u6709\u9810\u8B66\u97F3)"), /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: () => setIsMuted(!isMuted),
              className: `w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isMuted ? "bg-red-600" : "bg-slate-600"}`
            },
            /* @__PURE__ */ React.createElement("div", { className: `w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isMuted ? "translate-x-6" : ""}` })
          )), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center pt-2 border-t border-slate-700/50" }, /* @__PURE__ */ React.createElement("span", { className: "text-white text-sm" }, "\u76F2\u9EDE/\u908A\u7DE3\u8B66\u793A\u975C\u97F3"), /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: () => setIsEdgeMuted(!isEdgeMuted),
              className: `w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isEdgeMuted ? "bg-red-600" : "bg-slate-600"}`
            },
            /* @__PURE__ */ React.createElement("div", { className: `w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isEdgeMuted ? "translate-x-6" : ""}` })
          )))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 text-sm font-bold mb-4 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "cpu", size: 16 }), " AI \u6838\u5FC3\u8A2D\u5B9A"), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400 mb-2" }, "\u9078\u64C7\u904B\u7B97\u6A21\u578B (\u5167\u5EFA\u91D1\u9470\u5DF2\u555F\u7528)"), /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-900 rounded-lg p-1 border border-slate-600" }, /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => updateAiSettings("provider", "gemini"),
              className: `flex-1 py-2 rounded-md text-xs font-bold transition-all ${aiSettings.provider === "gemini" ? "bg-cyan-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`
            },
            "Gemini 2.5 Flash"
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => updateAiSettings("provider", "deepseek"),
              className: `flex-1 py-2 rounded-md text-xs font-bold transition-all ${aiSettings.provider === "deepseek" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`
            },
            "DeepSeek R1"
          )), /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-[10px] text-slate-500 text-center font-mono" }, aiSettings.provider === "gemini" ? "Google AI Studio Protocol Active" : "DeepSeek/OpenRouter Protocol Active"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 text-sm font-bold mb-4 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "database", size: 16 }), " \u6E2C\u901F\u8CC7\u6599\u5EAB\u7BA1\u7406"), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400" }, "\u76EE\u524D\u8CC7\u6599\u4F86\u6E90"), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-white" }, dbInfo.source), lastUpdateTime && /* @__PURE__ */ React.createElement("div", { className: "text-[9px] text-slate-500 mt-1" }, "\u66F4\u65B0\u65BC: ", lastUpdateTime)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-400" }, "\u7E3D\u7B46\u6578"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-mono text-cyan-400" }, dbInfo.count))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("label", { className: "flex flex-col items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-500 hover:bg-slate-700/30 transition-all cursor-pointer group" }, /* @__PURE__ */ React.createElement(Icon, { name: "folder-up", size: 24, className: "text-slate-400 group-hover:text-cyan-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 group-hover:text-cyan-300" }, "\u672C\u6A5F\u532F\u5165 CSV"), /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".csv", onChange: handleFileUpload, className: "hidden" })), /* @__PURE__ */ React.createElement("button", { onClick: () => handleApiUpdate(false), disabled: updateStatus === "updating", className: "flex flex-col items-center justify-center gap-2 p-3 border-2 border-slate-600 rounded-xl hover:border-green-500 hover:bg-slate-700/30 transition-all group disabled:opacity-50 disabled:cursor-not-allowed" }, updateStatus === "updating" ? /* @__PURE__ */ React.createElement(Icon, { name: "loader-2", size: 24, className: "text-cyan-400 animate-spin" }) : /* @__PURE__ */ React.createElement(Icon, { name: "cloud-download", size: 24, className: `text-slate-400 group-hover:text-green-400 ${updateStatus === "success" ? "text-green-500" : updateStatus === "error" ? "text-red-500" : ""}` }), /* @__PURE__ */ React.createElement("span", { className: `text-[10px] group-hover:text-green-300 ${updateStatus === "updating" ? "text-cyan-400" : "text-slate-400"}` }, updateStatus === "updating" ? "\u4E0B\u8F09\u4E2D..." : updateStatus === "success" ? "\u5DF2\u66F4\u65B0" : updateStatus === "error" ? "\u91CD\u8A66\u66F4\u65B0" : "\u96F2\u7AEF\u66F4\u65B0 (API)"))), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-500 mt-2 text-center" }, "\u8CC7\u6599\u4F86\u6E90: \u5167\u653F\u90E8\u8B66\u653F\u7F72 (NPA)")), !hasGyroPermission && /* @__PURE__ */ React.createElement("button", { onClick: requestGyroPermission, className: "w-full bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-purple-500/50 transition-all" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement(Icon, { name: "rotate-3d", className: "text-purple-400" }), /* @__PURE__ */ React.createElement("div", { className: "text-left" }, /* @__PURE__ */ React.createElement("div", { className: "text-white font-bold text-sm" }, "\u555F\u7528\u9640\u87BA\u5100"), /* @__PURE__ */ React.createElement("div", { className: "text-slate-400 text-xs mt-0.5" }, "\u9EDE\u64CA\u4EE5\u6388\u6B0A\u50BE\u89D2\u5075\u6E2C (iOS \u5FC5\u9078)"))), /* @__PURE__ */ React.createElement(Icon, { name: "chevron-right", className: "text-slate-500" })), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800 rounded-xl overflow-hidden border border-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-slate-700" }, /* @__PURE__ */ React.createElement("h3", { className: "text-cyan-400 text-sm font-bold mb-4 uppercase tracking-wider flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "cpu", size: 16 }), " AI \u9632\u8B77\u53C3\u6578"), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-white text-sm mb-2" }, /* @__PURE__ */ React.createElement("span", null, "\u5F8C\u65B9\u903C\u8ECA\u8B66\u793A\u8DDD\u96E2"), /* @__PURE__ */ React.createElement("span", { className: "text-cyan-400 font-mono" }, "8.0m")), /* @__PURE__ */ React.createElement("input", { type: "range", className: "w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500", defaultValue: "40" })))), /* @__PURE__ */ React.createElement("button", { onClick: toggleFullScreen, className: "w-full bg-slate-800 text-slate-300 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "maximize", size: 18 }), " \u5207\u63DB\u5168\u87A2\u5E55\u6A21\u5F0F"), /* @__PURE__ */ React.createElement("button", { onClick: handleLogout, className: "w-full bg-slate-800 text-red-400 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "log-out", size: 18 }), " \u767B\u51FA V.I.S.O.R.")));
        };
        return /* @__PURE__ */ React.createElement("div", { className: "flex justify-center items-center min-h-screen bg-black font-sans p-0 md:p-4 lg:p-6 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "w-full h-[100dvh] md:max-w-[420px] md:h-[90vh] md:max-h-[880px] bg-slate-950 md:rounded-[3rem] md:border-[8px] md:border-slate-800 overflow-hidden relative shadow-2xl flex flex-col md:ring-1 md:ring-white/10 transition-all duration-300" }, /* @__PURE__ */ React.createElement(EdgeLightingOverlay, { direction: edgeWarning }), /* @__PURE__ */ React.createElement(ToastNotification, { notifications, removeNotification }), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 px-6 pt-5 safe-top pb-2 flex justify-between items-center z-20 select-none shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Icon, { name: "shield-check", size: 18, className: "text-cyan-400" }), /* @__PURE__ */ React.createElement("h1", { className: "text-lg font-black text-white tracking-widest italic font-mono" }, "V.I.S.O.R.")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 text-slate-600 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: `w-1.5 h-1.5 rounded-full ${systemStatus.pi5 ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-red-500 animate-pulse"}` }), /* @__PURE__ */ React.createElement("span", { className: `text-[9px] font-bold ${systemStatus.pi5 ? "text-slate-300" : "text-red-400"}` }, "CORE")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-slate-900 rounded-full px-2 py-0.5 border border-slate-800" }, /* @__PURE__ */ React.createElement("div", { className: `w-1.5 h-1.5 rounded-full ${systemStatus.piZero ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-red-500 animate-pulse"}` }), /* @__PURE__ */ React.createElement("span", { className: `text-[9px] font-bold ${systemStatus.piZero ? "text-slate-300" : "text-red-400"}` }, "HUD")), /* @__PURE__ */ React.createElement("div", { className: "relative cursor-pointer", onClick: () => addNotification("info", "\u7CFB\u7D71\u6E2C\u8A66", "\u901A\u77E5\u4E2D\u5FC3\u529F\u80FD\u904B\u4F5C\u6B63\u5E38") }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 16, className: "text-slate-400 hover:text-white transition-colors" }), /* @__PURE__ */ React.createElement("div", { className: "absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-black" })))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-5 scrollbar-hide relative z-10 pb-32" }, activeTab === "login" && renderLogin(), activeTab === "register" && renderRegister(), activeTab === "home" && renderHome(), activeTab === "settings" && renderSettings(), activeTab === "events" && renderEvents(), activeTab === "stats" && renderStats(), activeTab === "hud" && renderHudPage()), currentUser && /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-24 right-6 z-30" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setShowAIChat(true), className: "w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 animate-ai-pulse" }, /* @__PURE__ */ React.createElement(Icon, { name: "bot", size: 28 }))), currentUser && /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900/90 backdrop-blur-xl p-2 pb-6 safe-bottom border-t border-white/5 absolute bottom-0 w-full z-20 md:rounded-t-3xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-around items-end px-2" }, /* @__PURE__ */ React.createElement(NavButton, { iconName: "activity", label: "\u5206\u6790", isActive: activeTab === "stats", onClick: () => setActiveTab("stats") }), /* @__PURE__ */ React.createElement(NavButton, { iconName: "monitor", label: "HUD", isActive: activeTab === "hud", onClick: () => setActiveTab("hud") }), /* @__PURE__ */ React.createElement(NavButton, { iconName: "shield", label: "\u76E3\u63A7", isActive: activeTab === "home", onClick: () => setActiveTab("home"), isCenter: true }), /* @__PURE__ */ React.createElement(NavButton, { iconName: "video", label: "\u4E8B\u4EF6", isActive: activeTab === "events", onClick: () => setActiveTab("events") }), /* @__PURE__ */ React.createElement(NavButton, { iconName: "settings-2", label: "\u8A2D\u5B9A", isActive: activeTab === "settings", onClick: () => setActiveTab("settings") }))), currentUser && /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-slate-600/50 rounded-full z-30 pointer-events-none safe-bottom mb-1" }), /* @__PURE__ */ React.createElement(AIChatModal, { isOpen: showAIChat, onClose: () => setShowAIChat(false) }), currentUser && /* @__PURE__ */ React.createElement(TerminalConsole, { logs: systemLogs, isOpen: showConsole, onClose: () => setShowConsole(false) })));
      };
      const rootElement = document.getElementById("root");
      if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(/* @__PURE__ */ React.createElement(App, null));
        console.log("React App Mounted");
      } else {
        console.error("Root element not found");
      }
    }
  });
  require_app();
})();
