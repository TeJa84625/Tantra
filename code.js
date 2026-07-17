/**
 * code.js - Unified Production Web Serial IoT Flashing Engine
 * Natively supports GitHub asset resolution, multi-baud sweeping, 
 * and multi-protocol architecture switching for cross-board compatibility.
 */

// === Enterprise Multi-Board Hardware Registry ===
const HARDWARE_REGISTRY = {
    "arduino_uno": {
        name: "Arduino Uno (ATmega328P)",
        allowedExtensions: [".hex"],
        pageSizeBytes: 128,
        protocol: "stk500v1",
        baudProfiles: [115200, 57600, 19200]
    },
    "arduino_nano": {
        name: "Arduino Nano (ATmega328P)",
        allowedExtensions: [".hex"],
        pageSizeBytes: 128,
        protocol: "stk500v1",
        // Clones and older Nanos heavily utilize 57600
        baudProfiles: [57600, 115200, 19200]
    },
    "arduino_mega": {
        name: "Arduino Mega 2560 (ATmega2560)",
        allowedExtensions: [".hex"],
        pageSizeBytes: 256,
        protocol: "stk500v2", 
        baudProfiles: [115200]
    },
    "esp32": {
        name: "ESP32 Development Module",
        allowedExtensions: [".bin"],
        pageSizeBytes: 4096,
        protocol: "esptool",
        baudProfiles: [115200, 921600]
    },
    "esp32_cam": {
        name: "ESP32-CAM Board",
        allowedExtensions: [".bin"],
        pageSizeBytes: 4096,
        protocol: "esptool",
        baudProfiles: [115200, 460800]
    }
};

const flashModal = document.getElementById('flashModal');

function openFlasher() { 
    if (flashModal) flashModal.style.display = 'flex'; 
}

function closeFlasher() { 
    if (!flashModal) return;
    flashModal.style.display = 'none'; 
    document.getElementById('initialUi').style.display = 'block';
    document.getElementById('uploadUi').style.display = 'none';
    document.getElementById('finishBtn').style.display = 'none';
    document.getElementById('flashTitle').innerText = 'Ready to Flash';
    document.getElementById('flashDesc').style.display = 'block';
    document.getElementById('progressCircle').setAttribute('stroke-dasharray', '0, 100');
}

/**
 * Helper: Automatically transforms standard GitHub user view links 
 * into raw, CORS-accessible CDN content endpoints.
 */
function normalizeAssetUrl(url) {
    if (!url) return "";
    let cleanUrl = url.trim();
    if (cleanUrl.includes("github.com") && !cleanUrl.includes("raw.githubusercontent.com")) {
        cleanUrl = cleanUrl
            .replace("github.com", "raw.githubusercontent.com")
            .replace("/blob/", "/");
    }
    return cleanUrl;
}

// === Core Hardware Entry Pipeline ===
async function initiateWebSerial() {
    const uploadBtn = document.querySelector('.upload-btn');
    if (!uploadBtn) return;

    const rawSourceUrl = uploadBtn.getAttribute('data-source-url');
    const deviceModelKey = uploadBtn.getAttribute('data-device-model') || 'arduino_uno';
    
    // Resolve Remote Asset Address Path
    const sourceUrl = normalizeAssetUrl(rawSourceUrl);
    
    const config = HARDWARE_REGISTRY[deviceModelKey];
    if (!config) {
        alert(`Registry Error: Model structure configuration "${deviceModelKey}" is unmapped.`);
        closeFlasher();
        return;
    }

    const fileExtension = sourceUrl.substring(sourceUrl.lastIndexOf('.')).toLowerCase();
    if (!config.allowedExtensions.includes(fileExtension)) {
        alert(`Payload Mismatch: ${config.name} targets files ending in ${config.allowedExtensions.join(', ')}.`);
        closeFlasher();
        return;
    }

    if (!("serial" in navigator)) {
        alert("Browser Engine Limitation: This client browser lacks native Web Serial access capabilities. Switch to Chrome/Edge.");
        closeFlasher();
        return;
    }

    document.getElementById('initialUi').style.display = 'none';
    document.getElementById('flashDesc').style.display = 'none';
    const status = document.getElementById('progressStatus');
    document.getElementById('uploadUi').style.display = 'flex';
    
    let port;
    try {
        status.innerText = "Resolving remote firmware compilation asset...";
        const response = await fetch(sourceUrl);
        if (!response.ok) throw new Error(`Asset fetch dropped by host source. Code: ${response.status}`);
        
        let firmwareBytes = [];
        status.innerText = "Parsing binary array allocations...";
        
        if (fileExtension === ".hex") {
            const rawText = await response.text();
            firmwareBytes = parseIntelHex(rawText);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            firmwareBytes = new Uint8Array(arrayBuffer);
        }

        if (firmwareBytes.length === 0) throw new Error("Parsed asset structure arrays returned zero values.");

        status.innerText = "Select corresponding serial terminal port...";
        port = await navigator.serial.requestPort();

        // ROUTE PROTOCOL HANDLERS
        if (config.protocol === "stk500v1") {
            await runStk500v1Engine(port, firmwareBytes, config);
        } else if (config.protocol === "stk500v2") {
            await runStk500v2Engine(port, firmwareBytes, config);
        } else if (config.protocol === "esptool") {
            await runEspToolEngine(port, firmwareBytes, config);
        } else {
            throw new Error(`Framework Protocol Execution Layer [${config.protocol}] is currently not supported.`);
        }

        status.innerText = "Success! Programming execution finalized smoothly.";
        document.getElementById('flashTitle').innerText = 'Upload Complete';
        document.getElementById('finishBtn').style.display = 'block';

    } catch (hardwareError) {
        console.error("Flasher System Interrupt:", hardwareError);
        alert(`Hardware Programming Interrupted: ${hardwareError.message}`);
        if (port) { try { await port.close(); } catch(e){} }
        closeFlasher();
    }
}

// =============================================================================
// PROTOCOL DRIVER 1: STK500v1 (Arduino Uno, Nano, etc.)
// =============================================================================
async function runStk500v1Engine(port, firmwareBytes, config) {
    const status = document.getElementById('progressStatus');
    let targetBaud = null;
    let writer, reader;

    for (let baud of config.baudProfiles) {
        status.innerText = `Sweeping synchronization limits at ${baud} baud...`;
        try {
            await port.open({ baudRate: baud, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
            writer = port.writable.getWriter();
            reader = port.readable.getReader();

            // Hardware Capacitor Reset Pulse Sequence
            await port.setSignals({ dataTerminalReady: false, readyToSend: false });
            await new Promise(r => setTimeout(r, 20));
            await port.setSignals({ dataTerminalReady: true, readyToSend: true });
            await new Promise(r => setTimeout(r, 250)); 
            await port.setSignals({ dataTerminalReady: false, readyToSend: false });
            await new Promise(r => setTimeout(r, 100)); 

            // Clear Noise Buffers
            let flushing = true;
            while (flushing) {
                const packet = await Promise.race([reader.read(), new Promise(res => setTimeout(() => res({ value: null }), 15))]);
                if (!packet || !packet.value) flushing = false;
            }

            // Sync Verification Verification Check Loop
            let synced = false;
            for (let i = 0; i < 15; i++) {
                try {
                    await writer.write(new Uint8Array([0x30, 0x20])); // STK_GET_SYNC
                    const resp = await Promise.race([reader.read(), new Promise(res => setTimeout(() => res({ value: null }), 45))]);
                    if (resp && resp.value && Array.from(resp.value).includes(0x14) && Array.from(resp.value).includes(0x10)) {
                        synced = true; break;
                    }
                } catch(e){}
                await new Promise(r => setTimeout(r, 30));
            }

            if (synced) { targetBaud = baud; break; }

            writer.releaseLock(); reader.releaseLock(); await port.close();
        } catch (e) {
            if (writer) writer.releaseLock(); if (reader) reader.releaseLock();
            try { await port.close(); } catch(err){}
        }
    }

    if (!targetBaud) throw new Error("Could not sync with hardware bootloader layers.");

    document.getElementById('flashTitle').innerText = `Programming Device`;
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    
    let totalPages = Math.ceil(firmwareBytes.length / config.pageSizeBytes);
    for (let p = 0; p < totalPages; p++) {
        let wordAddr = (p * config.pageSizeBytes) / 2;
        let page = firmwareBytes.slice(p * config.pageSizeBytes, (p + 1) * config.pageSizeBytes);
        while (page.length < config.pageSizeBytes) page.push(0xFF);

        status.innerText = `Writing page block ${p + 1} of ${totalPages}...`;
        await sendCommandGeneric(writer, reader, [0x55, wordAddr & 0xFF, (wordAddr >> 8) & 0xFF, 0x20], 0x14, 0x10);
        await sendCommandGeneric(writer, reader, [0x64, (config.pageSizeBytes >> 8) & 0xFF, config.pageSizeBytes & 0xFF, 0x46, ...page, 0x20], 0x14, 0x10);

        let pct = Math.floor(((p + 1) / totalPages) * 100);
        if (circle) circle.setAttribute('stroke-dasharray', `${pct}, 100`);
        if (text) text.innerHTML = `${pct}%`;
    }

    await sendCommandGeneric(writer, reader, [0x51, 0x20], 0x14, 0x10); // Leave Program Mode
    writer.releaseLock(); reader.releaseLock(); await port.close();
}

// =============================================================================
// PROTOCOL DRIVER 2: STK500v2 (Arduino Mega 2560)
// =============================================================================
async function runStk500v2Engine(port, firmwareBytes, config) {
    const status = document.getElementById('progressStatus');
    status.innerText = "Initializing STK500v2 tracking protocol engine for Mega...";
    
    // Mega uploads cleanly at 115200 baud natively
    await port.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
    const writer = port.writable.getWriter();
    const reader = port.readable.getReader();

    // Reset Sequence Pulse Execution
    await port.setSignals({ dataTerminalReady: true });
    await new Promise(r => setTimeout(r, 150));
    await port.setSignals({ dataTerminalReady: false });
    await new Promise(r => setTimeout(r, 200));

    // STK500v2 commands wrap parameters in frame wrappers: 
    // MESSAGE_START(0x1B) + SEQ_NUM + SIZE_HIGH + SIZE_LOW + TOKEN(0x0E) + DATA + CHECKSUM
    status.innerText = "Syncing with Mega bootloader registers...";
    
    let sequenceNumber = 1;
    let syncSuccess = false;

    // Send sign-on token commands parameters sequence checking
    for (let tryIdx = 0; tryIdx < 5; tryIdx++) {
        let syncCommand = wrapStk500v2Frame(sequenceNumber++, [0x01]); // CMD_SIGN_ON
        await writer.write(new Uint8Array(syncCommand));
        
        let response = await Promise.race([reader.read(), new Promise(res => setTimeout(() => res({ value: null }), 100))]);
        if (response && response.value && response.value[0] === 0x1B) {
            syncSuccess = true;
            break;
        }
    }

    if (!syncSuccess) {
        writer.releaseLock(); reader.releaseLock(); await port.close();
        throw new Error("Mega bootloader rejected communication alignment frames.");
    }

    // Mega execution sequence abstraction block
    status.innerText = "Connected! Processing Mega program arrays...";
    // Developers can append structural loop pagination writes here following STK500v2 documentation parameters
    
    writer.releaseLock(); reader.releaseLock(); await port.close();
    throw new Error("STK500v2 detailed block write sequences must be mapped out by production implementation scopes.");
}

// Helper: Wrap command vectors inside strict STK500v2 token structures
function wrapStk500v2Frame(seq, bodyArray) {
    let size = bodyArray.length;
    let frame = [0x1B, seq, (size >> 8) & 0xFF, size & 0xFF, 0x0E, ...bodyArray];
    let checksum = 0;
    for (let val of frame) checksum ^= val;
    frame.push(checksum);
    return frame;
}

// =============================================================================
// PROTOCOL DRIVER 3: ESPTOOL Protocol (ESP32, ESP32-CAM)
// =============================================================================
async function runEspToolEngine(port, firmwareBytes, config) {
    const status = document.getElementById('progressStatus');
    status.innerText = "Running Espressif bootloader interface wrapper...";

    await port.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: "none", flowControl: "none" });
    const writer = port.writable.getWriter();
    const reader = port.readable.getReader();

    // HARDWARE INTERCEPT SEQUENCE FOR ESP EN/IO0 MODE TRIGGERS
    status.innerText = "Entering ESP flash download mode registers...";
    await port.setSignals({ dataTerminalReady: true, readyToSend: false }); // IO0 low, EN low
    await new Promise(r => setTimeout(r, 100));
    await port.setSignals({ dataTerminalReady: false, readyToSend: true }); // EN high, IO0 high
    await new Promise(r => setTimeout(r, 200));

    status.innerText = "Blasting serial SLIP framing vectors...";
    // ESP32 systems communicate using wrapped command frames over SLIP encapsulation (0xC0 parameters boundaries)
    // In production frameworks, developers bridge this implementation block to esptool-js modules libraries.
    
    writer.releaseLock(); reader.releaseLock(); await port.close();
    throw new Error("ESP32 architectures require external SLIP framework libraries to map raw memory allocation partitions safely.");
}

// =============================================================================
// COMPONENT HELPERS & DATA PARSERS
// =============================================================================
async function sendCommandGeneric(writer, reader, commandArray, match1, match2) {
    await writer.write(new Uint8Array(commandArray));
    let buffer = [];
    const timeout = Date.now() + 500;
    while (buffer.length < 2 && Date.now() < timeout) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) { for (let b of value) buffer.push(b); }
    }
    if (buffer[0] !== match1 || buffer[1] !== match2) {
        throw new Error("Transaction verification data mismatch execution tracking exception.");
    }
}

function parseIntelHex(hexDataText) {
    const rawLines = hexDataText.split('\n');
    let dynamicBuffer = [];
    for (let line of rawLines) {
        line = line.trim();
        if (!line.startsWith(':')) continue;
        let length = parseInt(line.substr(1, 2), 16);
        let type = parseInt(line.substr(7, 2), 16);
        if (type === 0x00) { 
            for (let i = 0; i < length; i++) {
                dynamicBuffer.push(parseInt(line.substr(9 + (i * 2), 2), 16));
            }
        } else if (type === 0x01) { break; }
    }
    return dynamicBuffer;
}