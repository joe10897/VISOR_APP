/**
 * V.I.S.O.R. Interactive Simulation & Autonomous Cinematic Engine (v2.0)
 * - Automatic Continuous Scenario Loop (Cruising -> Twisting -> Blindspot -> Emergency -> Loop)
 * - Real-time Physics Kinematics & Web Audio Synthesizer
 * - Dual CSI Camera Procedural Bounding Box Tracking & 24GHz Radar Polar Plotting
 */

class VisorSimEngine {
  constructor() {
    // Kinematic & Telemetry State
    this.speed = 72.0;          // Current speed in km/h
    this.targetSpeed = 72.0;    // Target speed
    this.tilt = 0.0;            // Current motorcycle roll angle in degrees (-45 to +45)
    this.targetTilt = 0.0;      // Target roll angle
    this.maxTilt = 0.0;         // Session peak lean angle
    this.tripDistance = 14.8;   // km
    this.tripTimeSeconds = 870; // 14 mins 30 secs
    this.satellites = 16;
    this.gpsEngine = 'Doppler 4Hz (原生)';
    this.systemFps = 30.5;
    this.npuLatency = 24.2;     // ms

    // Threat States
    this.fcwThreat = 'safe';    // 'safe' | 'caution' | 'danger'
    this.leftBsd = false;
    this.rightBsd = false;
    this.ttc = 3.8;             // Time to collision in seconds

    // Hardware Bridge States
    this.cameraMode = 'front';  // 'front' | 'rear'
    this.hudFlipV = true;       // Optical flip vertical
    this.hudMirrorH = true;     // Optical mirror horizontal
    this.radarSweepAngle = 0;   // Radians

    // Audio SFX state
    this.audioCtx = null;
    this.audioEnabled = false;
    this.engineOsc = null;
    this.engineGain = null;

    // Continuous Autonomous Sequence Director
    this.autoLoopEnabled = true;
    this.autoLoopDuration = 32.0; // seconds for full cycle
    this.autoLoopTime = 0.0;      // current elapsed in cycle
    this.currentScenario = 'cruise';
    this.userOverrideTimer = null;

    // Internal timing
    this.lastTime = performance.now();

    // Radar targets list
    this.radarTargets = [
      { id: 1, angle: -0.05, dist: 38, speedDiff: 0, type: 'car', label: '前車等速巡航' },
      { id: 2, angle: 0.45, dist: 42, speedDiff: -2.0, type: 'car', label: '右前車輛' }
    ];

    this.init();
  }

  init() {
    this.initCanvases();
    this.bindControls();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    // Trip time clock ticker
    setInterval(() => {
      this.tripTimeSeconds++;
      this.tripDistance += (this.speed / 3600);
      this.updateTripClock();
    }, 1000);
  }

  /* ==========================================================================
     Autonomous Cinematic Loop Director (自動循環演繹核心)
     ========================================================================== */
  updateAutoSequence(dt) {
    if (!this.autoLoopEnabled) return;

    this.autoLoopTime = (this.autoLoopTime + dt) % this.autoLoopDuration;
    const progress = (this.autoLoopTime / this.autoLoopDuration) * 100;

    // Update progress bar in UI
    document.querySelectorAll('.auto-progress-fill').forEach(el => {
      el.style.width = `${progress.toFixed(1)}%`;
    });

    const t = this.autoLoopTime;

    // Phase 1: 0.0s - 7.5s [Highway Cruising]
    if (t < 7.5) {
      if (this.currentScenario !== 'cruise') this.applyScenario('cruise');
      const phaseRatio = t / 7.5;
      this.targetSpeed = 75 + phaseRatio * 23; // Smooth accel 75 -> 98 km/h
      this.targetTilt = Math.sin(t * 1.2) * 2.5; // gentle highway wander
      this.radarTargets = [
        { id: 1, angle: -0.05, dist: Math.max(28, 38 - t * 0.8), speedDiff: 0, type: 'car', label: '前車等速巡航' },
        { id: 2, angle: 0.42, dist: 40 + t * 0.5, speedDiff: -2.0, type: 'car', label: '右前方車輛' }
      ];
    }
    // Phase 2: 7.5s - 15.5s [Mountain Twist Leaning]
    else if (t < 15.5) {
      if (this.currentScenario !== 'twist') this.applyScenario('twist');
      const twistT = t - 7.5;
      this.targetSpeed = 70 + Math.sin(twistT * 1.5) * 8; // 68 - 82 km/h in turns
      // Smooth sinusoidal cornering (-32° to +28°)
      this.targetTilt = Math.sin(twistT * 0.9) * 32.0;
      this.radarTargets = [
        { id: 1, angle: (this.targetTilt / 45) * 0.35, dist: 22, speedDiff: -1.0, type: 'moto', label: '前向彎道車流' }
      ];
    }
    // Phase 3: 15.5s - 23.0s [Urban Blindspot Threat Alert]
    else if (t < 23.0) {
      if (this.currentScenario !== 'blindspot') this.applyScenario('blindspot');
      const bsdT = t - 15.5;
      this.targetSpeed = 62.0;
      this.targetTilt = 0.0;
      // Rear vehicle rapidly approaches left blindspot
      const approachDist = Math.max(3.2, 16.0 - bsdT * 2.2);
      this.leftBsd = approachDist < 9.0;
      this.radarTargets = [
        { id: 1, angle: -0.08, dist: 24, speedDiff: 0, type: 'car', label: '前車正常跟隨' },
        { id: 2, angle: -2.35, dist: approachDist, speedDiff: 16.5, type: 'moto', label: '左後極速逼近' }
      ];
    }
    // Phase 4: 23.0s - 29.0s [Emergency Collision Braking]
    else if (t < 29.0) {
      if (this.currentScenario !== 'emergency') this.applyScenario('emergency');
      const emgT = t - 23.0;
      // Rapid deceleration 70 -> 0 km/h
      this.targetSpeed = Math.max(0, 70 - emgT * 24);
      this.targetTilt = 0.0;
      this.fcwThreat = 'danger';
      const cutinDist = Math.max(4.5, 14.0 - emgT * 2.8);
      this.radarTargets = [
        { id: 1, angle: 0.0, dist: cutinDist, speedDiff: -38.0, type: 'truck', label: '前車急煞障礙物' }
      ];
    }
    // Phase 5: 29.0s - 32.0s [Standstill Recovery & Ready]
    else {
      this.targetSpeed = 0.0;
      this.targetTilt = 0.0;
      this.fcwThreat = 'safe';
      this.leftBsd = false;
      this.rightBsd = false;
      this.radarTargets = [
        { id: 1, angle: 0.0, dist: 12.0, speedDiff: 0, type: 'car', label: '起步待命中' }
      ];
    }
  }

  applyScenario(name) {
    this.currentScenario = name;
    document.querySelectorAll('[data-scenario]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scenario === name);
    });

    const scenarioNames = {
      cruise: '公路巡航 (CRUISE)',
      twist: '山道壓車 (LEAN TWIST)',
      blindspot: '盲區預警 (BLINDSPOT)',
      emergency: '緊急制動 (EMERGENCY)'
    };
    document.querySelectorAll('.current-scenario-label').forEach(el => {
      el.textContent = scenarioNames[name] || name.toUpperCase();
    });

    if (name === 'blindspot' || name === 'emergency') {
      this.playHazardAlarm();
    } else {
      this.playBeep(880, 0.06);
    }
  }

  toggleAutoLoop() {
    this.autoLoopEnabled = !this.autoLoopEnabled;
    document.querySelectorAll('[data-action="toggle-auto"]').forEach(btn => {
      btn.classList.toggle('active', this.autoLoopEnabled);
      const text = btn.querySelector('.auto-text');
      if (text) text.textContent = this.autoLoopEnabled ? '自動循環中' : '循環暫停';
    });
    this.playBeep(1200, 0.06);
  }

  /* ==========================================================================
     Web Audio API Synthesizer
     ========================================================================== */
  initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      this.engineOsc = this.audioCtx.createOscillator();
      this.engineGain = this.audioCtx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, this.audioCtx.currentTime);
      this.engineGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.audioCtx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.audioCtx.destination);
      this.engineOsc.start();
      this.audioEnabled = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  toggleAudio() {
    if (!this.audioCtx) {
      this.initAudio();
      return true;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
      this.audioEnabled = true;
    } else if (this.audioEnabled) {
      this.audioGainSilence();
      this.audioEnabled = false;
    } else {
      this.audioEnabled = true;
    }
    return this.audioEnabled;
  }

  audioGainSilence() {
    if (this.engineGain && this.audioCtx) {
      this.engineGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
    }
  }

  playBeep(freq = 1100, duration = 0.08, type = 'sine') {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {}
  }

  playHazardAlarm() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      this.playBeep(1760, 0.12, 'square');
      setTimeout(() => this.playBeep(1320, 0.14, 'square'), 120);
    } catch (err) {}
  }

  updateEnginePitch() {
    if (!this.audioEnabled || !this.engineOsc || !this.audioCtx) return;
    const targetFreq = 38 + (this.speed * 1.5);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.1);
    const targetVolume = Math.min(0.035, 0.003 + (this.speed / 160) * 0.03);
    this.engineGain.gain.setTargetAtTime(targetVolume, this.audioCtx.currentTime, 0.1);
  }

  /* ==========================================================================
     Controls & Overrides
     ========================================================================== */
  pauseAutoForManual() {
    this.autoLoopEnabled = false;
    document.querySelectorAll('[data-action="toggle-auto"]').forEach(btn => {
      btn.classList.remove('active');
      const text = btn.querySelector('.auto-text');
      if (text) text.textContent = '手動模式';
    });
    if (this.userOverrideTimer) clearTimeout(this.userOverrideTimer);
    // Smoothly resume auto-loop after 12 seconds of inactivity
    this.userOverrideTimer = setTimeout(() => {
      this.autoLoopEnabled = true;
      document.querySelectorAll('[data-action="toggle-auto"]').forEach(btn => {
        btn.classList.add('active');
        const text = btn.querySelector('.auto-text');
        if (text) text.textContent = '自動循環中';
      });
    }, 12000);
  }

  throttleUp() {
    this.initAudio();
    this.pauseAutoForManual();
    this.targetSpeed = Math.min(160, this.targetSpeed + 15);
    this.playBeep(980, 0.06);
  }

  brakeDown() {
    this.initAudio();
    this.pauseAutoForManual();
    this.targetSpeed = Math.max(0, this.targetSpeed - 20);
    this.playBeep(440, 0.08);
  }

  leanLeft() {
    this.initAudio();
    this.pauseAutoForManual();
    this.targetTilt = Math.max(-42, this.targetTilt - 15);
    this.playBeep(650, 0.05);
  }

  leanRight() {
    this.initAudio();
    this.pauseAutoForManual();
    this.targetTilt = Math.min(42, this.targetTilt + 15);
    this.playBeep(650, 0.05);
  }

  resetLean() {
    this.pauseAutoForManual();
    this.targetTilt = 0;
  }

  toggleCameraMode() {
    this.cameraMode = this.cameraMode === 'front' ? 'rear' : 'front';
    this.playBeep(1200, 0.05);
    document.querySelectorAll('.camera-mode-label').forEach(el => {
      el.textContent = this.cameraMode === 'front' ? 'FRONT 160° FCW' : 'REAR 160° BSD';
    });
  }

  toggleHudFlipV() {
    this.hudFlipV = !this.hudFlipV;
    this.playBeep(800, 0.04);
    this.updateHudScreenClass();
  }

  toggleHudMirrorH() {
    this.hudMirrorH = !this.hudMirrorH;
    this.playBeep(800, 0.04);
    this.updateHudScreenClass();
  }

  updateHudScreenClass() {
    document.querySelectorAll('.hud-combiner-screen').forEach(el => {
      el.classList.toggle('hud-flipped-v', this.hudFlipV);
      el.classList.toggle('hud-mirrored-h', this.hudMirrorH);
    });
  }

  bindControls() {
    // Auto Loop Toggle Button
    document.querySelectorAll('[data-action="toggle-auto"]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleAutoLoop());
    });

    // Throttle & Brake
    document.querySelectorAll('[data-action="accel"]').forEach(btn => {
      btn.addEventListener('click', () => this.throttleUp());
    });
    document.querySelectorAll('[data-action="brake"]').forEach(btn => {
      btn.addEventListener('click', () => this.brakeDown());
    });

    // Lean controls
    document.querySelectorAll('[data-action="lean-left"]').forEach(btn => {
      btn.addEventListener('click', () => this.leanLeft());
    });
    document.querySelectorAll('[data-action="lean-right"]').forEach(btn => {
      btn.addEventListener('click', () => this.leanRight());
    });
    document.querySelectorAll('[data-action="lean-center"]').forEach(btn => {
      btn.addEventListener('click', () => this.resetLean());
    });

    // Scenarios jump
    document.querySelectorAll('[data-scenario]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.pauseAutoForManual();
        const sc = btn.dataset.scenario;
        const jumpTime = { cruise: 1.0, twist: 9.0, blindspot: 17.0, emergency: 24.0 };
        this.autoLoopTime = jumpTime[sc] || 0.0;
        this.applyScenario(sc);
      });
    });

    // HUD Optical Flip Toggles
    document.querySelectorAll('[data-action="hud-flip-v"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleHudFlipV();
        btn.classList.toggle('active', this.hudFlipV);
      });
    });
    document.querySelectorAll('[data-action="hud-mirror-h"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleHudMirrorH();
        btn.classList.toggle('active', this.hudMirrorH);
      });
    });

    // Camera Mode toggle
    document.querySelectorAll('[data-action="toggle-cam"]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleCameraMode());
    });

    // Audio SFX toggle
    document.querySelectorAll('[data-action="toggle-sound"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const enabled = this.toggleAudio();
        btn.classList.toggle('active', enabled);
      });
    });
  }

  /* ==========================================================================
     Canvas Setup & Main Render Loop
     ========================================================================== */
  initCanvases() {
    this.camCanvases = document.querySelectorAll('.camera-canvas');
    this.radarCanvases = document.querySelectorAll('.radar-canvas');
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Advance Autonomous Sequence
    this.updateAutoSequence(dt);

    // Physics Kinematics Smoothing
    this.speed += (this.targetSpeed - this.speed) * Math.min(1, dt * 2.8);
    this.tilt += (this.targetTilt - this.tilt) * Math.min(1, dt * 4.2);

    if (Math.abs(this.tilt) > this.maxTilt) {
      this.maxTilt = Math.abs(this.tilt);
    }

    // Radar sweep rotation (approx 20 RPM)
    this.radarSweepAngle = (this.radarSweepAngle + dt * 3.8) % (Math.PI * 2);

    // Dynamic TTC computation
    if (this.currentScenario === 'emergency') {
      this.ttc = Math.max(0.4, (this.ttc - dt * 1.2));
    } else if (this.speed > 5) {
      this.ttc = (35 / (this.speed * 0.277)).toFixed(1);
    } else {
      this.ttc = 9.9;
    }

    // Render Displays
    this.updateEnginePitch();
    this.renderTelemetryUI();
    this.renderCameraStreams();
    this.renderRadars();

    requestAnimationFrame(this.loop);
  }

  /* ==========================================================================
     DOM UI Text Updates
     ========================================================================== */
  renderTelemetryUI() {
    const speedInt = Math.round(this.speed);
    const tiltDeg = Math.round(this.tilt);

    // Speed numbers
    document.querySelectorAll('.val-speed').forEach(el => el.textContent = speedInt);
    document.querySelectorAll('.val-tilt').forEach(el => el.textContent = `${tiltDeg > 0 ? '+' : ''}${tiltDeg}°`);
    document.querySelectorAll('.val-max-tilt').forEach(el => el.textContent = `${Math.round(this.maxTilt)}°`);
    document.querySelectorAll('.val-ttc').forEach(el => el.textContent = `${this.ttc}s`);

    // Speed meter fill bar
    const speedPct = Math.min(100, (this.speed / 160) * 100);
    document.querySelectorAll('.speed-bar-fill').forEach(el => el.style.width = `${speedPct}%`);

    // Bike roll visualizer
    document.querySelectorAll('.bike-lean-graphic').forEach(el => {
      el.style.transform = `rotate(${tiltDeg}deg)`;
    });

    // Threat Badges
    document.querySelectorAll('.fcw-status-badge').forEach(el => {
      el.className = 'fcw-status-badge badge-pill ' + 
        (this.fcwThreat === 'danger' ? 'badge-crimson' : this.fcwThreat === 'caution' ? 'badge-amber' : 'badge-emerald');
      el.textContent = this.fcwThreat === 'danger' ? 'FCW 碰撞警報' : this.fcwThreat === 'caution' ? '距離接近' : '車距安全';
    });

    // Blind spot indicator boxes
    document.querySelectorAll('.bsm-left').forEach(el => {
      el.classList.toggle('danger', this.leftBsd);
      el.classList.toggle('safe', !this.leftBsd);
      const text = el.querySelector('.bsm-text');
      if (text) text.textContent = this.leftBsd ? '左後逼近' : '左後淨空';
    });

    document.querySelectorAll('.bsm-right').forEach(el => {
      el.classList.toggle('danger', this.rightBsd);
      el.classList.toggle('safe', !this.rightBsd);
      const text = el.querySelector('.bsm-text');
      if (text) text.textContent = this.rightBsd ? '右後逼近' : '右後淨空';
    });
  }

  updateTripClock() {
    const mins = Math.floor(this.tripTimeSeconds / 60);
    const secs = this.tripTimeSeconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.querySelectorAll('.val-trip-time').forEach(el => el.textContent = timeStr);
    document.querySelectorAll('.val-trip-dist').forEach(el => el.textContent = `${this.tripDistance.toFixed(1)} km`);
  }

  /* ==========================================================================
     Synthesized YOLO Camera Stream (60 FPS Procedural Canvas)
     ========================================================================== */
  renderCameraStreams() {
    this.camCanvases.forEach(canvas => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width = canvas.clientWidth || 480;
      const h = canvas.height = canvas.clientHeight || 270;

      // Horizon
      const horizonY = h * 0.44;
      const gradSky = ctx.createLinearGradient(0, 0, 0, horizonY);
      gradSky.addColorStop(0, '#030712');
      gradSky.addColorStop(1, '#08132b');
      ctx.fillStyle = gradSky;
      ctx.fillRect(0, 0, w, horizonY);

      // Road Surface
      const gradRoad = ctx.createLinearGradient(0, horizonY, 0, h);
      gradRoad.addColorStop(0, '#0a0f1d');
      gradRoad.addColorStop(1, '#02050e');
      ctx.fillStyle = gradRoad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Lane Lines with Dynamic Lean Horizon Tilt
      const tiltOffset = (this.tilt / 45) * (w * 0.16);
      const centerX = (w * 0.5) + tiltOffset;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 10]);

      // Center dashed line
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(w * 0.5 + tiltOffset * 1.5, h);
      ctx.stroke();

      // Left solid lane line
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(centerX - 42, horizonY);
      ctx.lineTo(w * 0.08, h);
      ctx.stroke();

      // Right solid lane line
      ctx.beginPath();
      ctx.moveTo(centerX + 42, horizonY);
      ctx.lineTo(w * 0.92, h);
      ctx.stroke();
      ctx.restore();

      // Draw Synthesized Target Vehicles with YOLO Bounding Boxes
      this.radarTargets.forEach((target) => {
        let boxX, boxY, boxW, boxH, label, color;

        if (this.cameraMode === 'front' && target.angle > -1.5 && target.angle < 1.5) {
          const scale = Math.max(0.15, Math.min(1.4, (45 - target.dist) / 32));
          boxW = 100 * scale;
          boxH = 75 * scale;
          boxX = centerX + (target.angle * 140 * scale) - (boxW / 2);
          boxY = horizonY + (scale * (h - horizonY) * 0.65);

          color = target.dist < 10 ? '#ff0055' : target.dist < 20 ? '#ffb703' : '#00ff9d';
          label = `${target.label} [${Math.round(target.dist)}m] TTC:${(target.dist / Math.max(1, this.speed * 0.28)).toFixed(1)}s`;

          this.drawYoloBox(ctx, boxX, boxY, boxW, boxH, label, color);
        } else if (this.cameraMode === 'rear' && (target.angle < -1.5 || target.angle > 1.5)) {
          const scale = Math.max(0.2, Math.min(1.5, (30 - target.dist) / 20));
          boxW = 110 * scale;
          boxH = 80 * scale;
          boxX = (target.angle < 0 ? w * 0.22 : w * 0.78) - (boxW / 2);
          boxY = horizonY + (scale * (h - horizonY) * 0.55);

          color = target.dist < 8 ? '#ff0055' : '#ffb703';
          label = `後方逼近 [${Math.round(target.dist)}m] +${Math.round(target.speedDiff * 3.6)}km/h`;

          this.drawYoloBox(ctx, boxX, boxY, boxW, boxH, label, color);
        }
      });

      // Camera HUD Watermark
      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`CAM: ${this.cameraMode.toUpperCase()} | 160° FOV | NPU: ${this.npuLatency}ms`, 10, h - 12);
    });
  }

  drawYoloBox(ctx, x, y, w, h, text, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = 'rgba(6, 11, 25, 0.88)';
    ctx.fillRect(x, y - 18, Math.max(80, ctx.measureText(text).width + 12), 18);
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y - 18, Math.max(80, ctx.measureText(text).width + 12), 18);

    ctx.fillStyle = color;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(text, x + 6, y - 5);
    ctx.restore();
  }

  /* ==========================================================================
     24GHz mmWave Radar Polar Sweep Canvas
     ========================================================================== */
  renderRadars() {
    this.radarCanvases.forEach(canvas => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = canvas.width = canvas.height = canvas.clientWidth || 240;
      const cx = size / 2;
      const cy = size / 2;
      const r = (size / 2) - 10;

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#030814';
      ctx.fill();

      // Range Rings (5m, 10m, 20m, 35m)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.font = '8px "JetBrains Mono"';
        ctx.fillText(`${(ratio * 35).toFixed(0)}m`, cx + 4, cy - (r * ratio) + 9);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();

      // Sweeping Beam
      ctx.save();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.02)');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, this.radarSweepAngle - 0.4, this.radarSweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(this.radarSweepAngle) * r, cy + Math.sin(this.radarSweepAngle) * r);
      ctx.stroke();
      ctx.restore();

      // Radar Target Blips
      this.radarTargets.forEach(target => {
        const distRatio = Math.min(1, target.dist / 35);
        const rad = target.angle - Math.PI / 2;
        const tx = cx + Math.cos(rad) * (r * distRatio);
        const ty = cy + Math.sin(rad) * (r * distRatio);

        const blipColor = target.dist < 8 ? '#ff0055' : target.dist < 18 ? '#ffb703' : '#00ff9d';

        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fillStyle = blipColor;
        ctx.shadowColor = blipColor;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '8px "JetBrains Mono"';
        ctx.fillText(`${target.dist.toFixed(1)}m`, tx + 7, ty + 3);
        ctx.restore();
      });

      // Center Rider Icon
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// Instantiate Simulation Engine on load
document.addEventListener('DOMContentLoaded', () => {
  window.visorSim = new VisorSimEngine();
});
