# V.I.S.O.R. (Visor Intelligent Smart Operations & Reporting)

V.I.S.O.R. 是一款針對二輪載具設計的輔助系統。透過 Raspberry Pi 5 作為運算核心，結合 Pi Zero 抬頭顯示器（HUD）與行動裝置 App，提供騎士即時的環境偵測、行車數據同步以及緊急通報功能。

## 🚀 系統架構

本專案由三大模組組成：

1.  **V.I.S.O.R. Core (Raspberry Pi 5)**
    *   負責主程序運作 (`main_controller.py`)。
    *   搭載 YOLOv8 進行視覺物體偵測與車流分析。
    *   管理雙 CSI 相機 MJPEG 影像串流（Port 8000/8001）。
    *   提供 WebSocket 與 Bluetooth 雙通道連線伺服器。
2.  **V.I.S.O.R. HUD (Raspberry Pi Zero 2W / W)**
    *   負責 128x64 OLED 抬頭顯示輸出。
    *   實時顯示時速、導航提示、測速照相警示與系統心跳狀態。
    *   透過 UDP 協議與 Pi 5 保持心跳連線同步。
3.  **V.I.S.O.R. Mobile App (Cordova / React)**
    *   整合控制分頁 (`www/index_combine.html`)。
    *   提供即時影像預覽、Tactical 系統日誌、遠端配置同步以及騎乘數據統計。

## ✨ 核心功能

*   **雙鏡頭實時監控**：在 App 端直接查看來自 Pi 5 的前後鏡頭 MJPEG 串流。
*   **雙通道容錯機制**：系統自動於 Wi-Fi (WebSocket) 與 藍牙 (Serial Bluetooth) 之間切換指令發送，確保通訊零延遲。
*   **測速照相警示系統**：整合內建地圖資料庫與 GPS，實時回傳路段限速與測速點距離。
*   **E-SOS 緊急通報**：透過陀螺儀偵測嚴重傾斜（事故）時，自動透過 App 發送包含座標的求救簡訊。
*   **Tactical Log 戰術面板**：可開關的終端機介面，即時顯示底層通訊與硬體狀態。
*   **遠端電源管理**：可從 App 遠端執行 Pi 5 或 HUD (Pi Zero) 的安全關機程序。

## 🛠️ 環境需求

*   **Pi 5 / Pi Zero**: Raspberry Pi OS (64-bit), Python 3.9+, OpenCV, Ultralytics (YOLO)
*   **App**: Apache Cordova, React, Lucide Icons, Recharts, TailwindCSS
*   **通訊**: `bluetooth_server.py`, `websocket_server.py`, `udp_broadcaster.py`

## 📦 快速啟動

1.  **Pi 5 主機端**:
    ```bash
    python main_controller.py
    ```
2.  **HUD 顯示端**:
    ```bash
    python hud_client.py
    ```
3.  **App 端**:
    使用手機瀏覽器或 Cordova 容器開啟 `www/index_combine.html` 進行連線配對。

## ⚠️ 注意事項

*   請確保 Pi 5 與手機位於同一區域網路，或已完成藍牙配對。
*   MJPEG 串流需要手動重啟以釋放佔用的硬體連接埠（系統內建自動清理腳本）。

---
*Developed by Joe10897/Visor Team.*
