// ==========================================
// DOM Elements
// ==========================================
const setupView = document.getElementById('setup-view');
const terminalView = document.getElementById('terminal-view');
const btnConnect = document.getElementById('btn-connect');

const hwDeviceName = document.getElementById('hw-device-name');
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const btnSend = document.getElementById('btn-send');

const baudSelector = document.getElementById('baud-selector');
const btnDownloadLog = document.getElementById('btn-download-log');
const btnClearLog = document.getElementById('btn-clear-log');
const btnDisconnect = document.getElementById('btn-disconnect');
const toggleTimestamp = document.getElementById('toggle-timestamp');
const toggleAutoscroll = document.getElementById('toggle-autoscroll');

const modalOverlay = document.getElementById('modal-overlay');
const btnCancelDisconnect = document.getElementById('btn-cancel-disconnect');
const btnSkipLog = document.getElementById('btn-skip-log');
const btnSaveLog = document.getElementById('btn-save-log');

// Tools Menu UI
const btnTools = document.getElementById('btn-tools');
const toolsMenu = document.getElementById('tools-menu');
const btnToolRadar = document.getElementById('btn-tool-radar');

// ==========================================
// State Variables
// ==========================================
let port = null;
let reader = null;
let keepReading = true;
let sessionLog = "";

// Enhanced Hardware DB using both VID and PID
// Enhanced Hardware DB using both VID and PID + Default Baud Rates
const HARDWARE_DB = {
    "4292": { "60000": "CP2102 UART", "default": "CP210x (ESP32)", "defaultBaud": 115200 },
    "6790": { "29987": "CH340G UART", "default": "CH340 (ESP8266)", "defaultBaud": 115200 },
    "1027": { "24577": "FT232R USB", "default": "FTDI Bridge", "defaultBaud": 9600 },
    "9025": { "67": "Arduino Uno", "32822": "Arduino Nano", "default": "Arduino Device", "defaultBaud": 9600 }
};

// ==========================================
// Basic UI & Terminal Functions
// ==========================================
if(btnTools && toolsMenu) {
    btnTools.addEventListener('click', () => {
        toolsMenu.style.display = toolsMenu.style.display === 'none' ? 'block' : 'none';
    });
}

toggleTimestamp.addEventListener('change', (e) => {
    if (e.target.checked) terminalOutput.classList.remove('hide-timestamps');
    else terminalOutput.classList.add('hide-timestamps');
});

btnClearLog.addEventListener('click', () => {
    terminalOutput.innerHTML = '';
    sessionLog = `--- Buffer Cleared: ${new Date().toLocaleString()} ---\n`;
    printToTerminal("Buffer cleared.", 'sys');
});

baudSelector.addEventListener('change', async () => {
    if (port) {
        printToTerminal(`Reconfiguring port to ${baudSelector.value} baud...`, 'sys');
        keepReading = false;
        if (reader) await reader.cancel();
        await port.close();
        try {
            await port.open({ baudRate: parseInt(baudSelector.value) });
            keepReading = true;
            printToTerminal(`Port established at ${baudSelector.value} baud.`, 'sys');
            readSerialData();
        } catch (err) {
            printToTerminal(`Failed to open port: ${err.message}`, 'sys');
        }
    }
});

function getTimeStamp() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

function printToTerminal(text, type = 'rx') {
    const timestamp = getTimeStamp();
    sessionLog += `[${timestamp}] ${text.replace('\n', '')}\n`;

    const lineDiv = document.createElement('div');
    lineDiv.className = 'log-line';
    if (type === 'tx') lineDiv.classList.add('log-tx');
    if (type === 'sys') lineDiv.classList.add('log-sys');

    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.innerText = `[${timestamp}]`;

    const contentSpan = document.createElement('span');
    contentSpan.className = 'log-content';
    contentSpan.innerText = text;

    lineDiv.appendChild(timeSpan);
    lineDiv.appendChild(contentSpan);
    terminalOutput.appendChild(lineDiv);

    if (toggleAutoscroll && toggleAutoscroll.checked) {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

// ==========================================
// Connection Logic (Fixed Auto-Baud Detection)
// ==========================================
btnConnect.addEventListener('click', async () => {
    if (!('serial' in navigator)) {
        alert("Your browser does not support the Web Serial API. Please use Chrome, Edge, or Opera.");
        return;
    }

    try {
        // 1. Prompt user to select port first
        port = await navigator.serial.requestPort();
        
        // 2. Fetch device information right away
        const info = port.getInfo();
        
        // Start with whatever is currently selected in the UI dropdown
        let selectedBaud = parseInt(baudSelector.value);

        if (info.usbVendorId) {
            const vid = info.usbVendorId.toString();
            const pid = info.usbProductId ? info.usbProductId.toString() : null;
            let deviceName = `Device (VID: ${vid})`;
            
            if (HARDWARE_DB[vid]) {
                // Get the display name
                if (pid && HARDWARE_DB[vid][pid]) {
                    deviceName = HARDWARE_DB[vid][pid];
                } else if (HARDWARE_DB[vid]["default"]) {
                    deviceName = HARDWARE_DB[vid]["default"];
                }
                
                // FORCE THE BAUD RATE IF DETECTED IN THE DATABASE
                if (HARDWARE_DB[vid]["defaultBaud"]) {
                    const detectedBaud = HARDWARE_DB[vid]["defaultBaud"];
                    
                    // Update the actual DOM elements so they match the hardware
                    baudSelector.value = detectedBaud.toString();
                    
                    // Crucial fix: Update our opening variable to the newly detected baud
                    selectedBaud = detectedBaud; 
                }
            }
            hwDeviceName.innerText = deviceName;
        }

        // 3. Open the port using the updated selectedBaud variable
        await port.open({ baudRate: selectedBaud });

        // Reset terminal & UI state
        terminalOutput.innerHTML = '';
        isRadarActive = false;
        radarPromptShown = false;
        ignoreRadarPrompt = false;

        sessionLog = `--- Session Started: ${new Date().toLocaleString()} ---\n`;
        keepReading = true;

        setupView.classList.remove('active');
        terminalView.classList.add('active');
        document.querySelector('.navbar-tools').style.display = 'flex';

        // This will now correctly log "Port opened at 9600 baud" for your Arduino Uno!
        printToTerminal(`Port opened at ${selectedBaud} baud.`, 'sys');
        readSerialData();

    } catch (err) {
        console.warn("Connection cancelled or failed.", err);
    }
});

// ==========================================
// Read / Write Stream
// ==========================================
async function readSerialData() {
    let incomingBuffer = '';
    while (port && port.readable && keepReading) {
        reader = port.readable.getReader();
        const decoder = new TextDecoder();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    incomingBuffer += decoder.decode(value);
                    if (incomingBuffer.includes('\n')) {
                        const lines = incomingBuffer.split('\n');
                        incomingBuffer = lines.pop(); 
                        
                        lines.forEach(line => {
                            const cleanLine = line.replace(/[\r\n]+/g, '').trim();
                            if (cleanLine !== '') {
                                printToTerminal(cleanLine, 'rx');
                                if (typeof checkRadarSignal === 'function') {
                                    checkRadarSignal(cleanLine);
                                }
                            }
                        });
                    }
                }
            }
        } catch (error) {
            // If physical disconnect occurs during read
            if (keepReading) {
                printToTerminal(`Hardware disconnected unexpectedly!`, 'sys');
                triggerDisconnectError();
            }
        } finally {
            reader.releaseLock();
        }
    }
}

async function sendCommand() {
    const inputValue = terminalInput.value;
    if (!port || !port.writable || inputValue.trim() === '') return;

    const command = inputValue + '\n';
    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();

    await writer.write(encoder.encode(command));
    writer.releaseLock();

    printToTerminal(`> ${inputValue}`, 'tx');
    terminalInput.value = '';

    // NEW FIX: Sending a command resets the radar prompt.
    // If you retry with new parameters, it will ask again!
    ignoreRadarPrompt = false;
    radarPromptShown = false;
}

btnSend.addEventListener('click', sendCommand);
terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendCommand();
});

// ==========================================
// Log & Disconnect Management
// ==========================================

// Global Listener for physical USB cable unplug
navigator.serial.addEventListener('disconnect', (e) => {
    if (port) {
        triggerDisconnectError();
    }
});

function triggerDisconnectError() {
    if (!port || !keepReading) return;

    keepReading = false;
    const errorModal = document.getElementById('disconnect-error-modal');
    if (errorModal) errorModal.classList.add('active');
}

// On OK button, completely refresh the page to guarantee clean state
document.getElementById('btn-disconnect-ok')?.addEventListener('click', () => {
    window.location.reload(); 
});

function downloadLogFile() {
    if (!sessionLog || sessionLog.trim() === '') return;
    const blob = new Blob([sessionLog], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iot-log-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

btnDownloadLog.addEventListener('click', downloadLogFile);

btnDisconnect.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});
btnCancelDisconnect.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});
btnSaveLog.addEventListener('click', async () => {
    downloadLogFile();
    await executeDisconnect();
});
btnSkipLog.addEventListener('click', async () => {
    await executeDisconnect();
});

async function executeDisconnect() {
    // A manual disconnect clears everything and reloads the page to clear states completely
    window.location.reload(); 
}

// ==========================================
// Radar Visualization Engine
// ==========================================
let isRadarActive = false;
let radarPromptShown = false;
let ignoreRadarPrompt = false; 
let dynamicMaxRange = 100; 

const radarPromptModal = document.getElementById('radar-prompt-modal');
const radarViewModal = document.getElementById('radar-view-modal');
const radarCanvas = document.getElementById('radar-canvas');
const radarCtx = radarCanvas ? radarCanvas.getContext('2d') : null;
const radarStats = document.getElementById('radar-stats');

// Open via Tools menu
if(btnToolRadar && radarViewModal) {
    btnToolRadar.addEventListener('click', () => {
        toolsMenu.style.display = 'none'; // Close dropdown
        radarViewModal.classList.add('active');
        isRadarActive = true;
        radarCtx.fillStyle = '#000000';
        radarCtx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
    });
}

function checkRadarSignal(line) {
    if (!radarPromptModal || !radarViewModal || !radarCanvas) return;

    // NEW FORMAT: rador-180:200/20-83
    const match = line.match(/rador-(\d+):(\d+)\/(\d+)-(\d+)/i); 
    
    if (match) {
        const maxAngle = parseInt(match[1]);
        dynamicMaxRange = parseInt(match[2]); // Extracts '200' as sensor max limit
        const currentAngle = parseInt(match[3]);
        const distance = parseInt(match[4]);

        if (isRadarActive) {
            drawRadar(maxAngle, currentAngle, distance);
            if(radarStats) {
                radarStats.innerText = `Angle: ${currentAngle}° | Dist: ${distance} | Range: ${dynamicMaxRange}`;
            }
        } else if (!radarPromptShown && !ignoreRadarPrompt) {
            radarPromptShown = true;
            radarPromptModal.classList.add('active');
        }
    }
}

// Radar Event Listeners
if(radarPromptModal) {
    document.getElementById('btn-radar-cancel').addEventListener('click', () => {
        radarPromptModal.classList.remove('active');
        ignoreRadarPrompt = true; 
    });

    document.getElementById('btn-radar-yes').addEventListener('click', () => {
        radarPromptModal.classList.remove('active');
        radarViewModal.classList.add('active');
        isRadarActive = true;
        
        radarCtx.fillStyle = '#000000';
        radarCtx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
    });
}

if(radarViewModal) {
    document.getElementById('btn-close-radar').addEventListener('click', () => {
        radarViewModal.classList.remove('active');
        isRadarActive = false;
        ignoreRadarPrompt = true; 
    });
}

function drawRadar(maxAngle, angle, distance) {
    if (!radarCtx) return;

    const width = radarCanvas.width;
    const height = radarCanvas.height;
    const cx = width / 2;
    const cy = maxAngle <= 180 ? height - 10 : height / 2;
    const radius = Math.min(cx, cy) - 20;

    radarCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    radarCtx.fillRect(0, 0, width, height);

    radarCtx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    
    if (maxAngle <= 180) {
        radarCtx.arc(cx, cy, radius, Math.PI, 0);
        radarCtx.moveTo(cx - radius, cy);
        radarCtx.lineTo(cx + radius, cy);
        radarCtx.moveTo(cx - (radius * 0.5), cy);
        radarCtx.arc(cx, cy, radius * 0.5, Math.PI, 0);
    } else {
        radarCtx.arc(cx, cy, radius, 0, 2 * Math.PI); 
        radarCtx.moveTo(cx + (radius * 0.5), cy);
        radarCtx.arc(cx, cy, radius * 0.5, 0, 2 * Math.PI);
        radarCtx.moveTo(cx, cy - radius); radarCtx.lineTo(cx, cy + radius);
        radarCtx.moveTo(cx - radius, cy); radarCtx.lineTo(cx + radius, cy);
    }
    radarCtx.stroke();

    const angleRad = -angle * (Math.PI / 180);
    radarCtx.strokeStyle = '#00ff00';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cy);
    radarCtx.lineTo(cx + radius * Math.cos(angleRad), cy + radius * Math.sin(angleRad));
    radarCtx.stroke();

    // NEW: RED LINE INSTEAD OF DOT
    if (distance > 0 && distance <= dynamicMaxRange) {
        const distRatio = distance / dynamicMaxRange;
        
        // Coordinates where the object is detected
        const blipX = cx + (radius * distRatio) * Math.cos(angleRad);
        const blipY = cy + (radius * distRatio) * Math.sin(angleRad);

        // Coordinates at the very edge of the radar range
        const edgeX = cx + radius * Math.cos(angleRad);
        const edgeY = cy + radius * Math.sin(angleRad);

        // Draw the red line extending outward
        radarCtx.strokeStyle = 'red';
        radarCtx.lineWidth = 4;
        radarCtx.beginPath();
        radarCtx.moveTo(blipX, blipY);
        radarCtx.lineTo(edgeX, edgeY);
        radarCtx.stroke();
    }
}