import { useCallback, useEffect, useRef, useState } from 'react';

/** Parse common retail scale output (CAS, Essae, generic RS232). */
export function parseScaleReading(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;

  // CAS: ST,GS,+   12.345kg  (ST = stable, US = unstable)
  const cas = trimmed.match(/^(ST|US),GS,([+-])\s*([\d.]+)\s*kg?/i);
  if (cas) {
    const w = parseFloat(cas[3]);
    if (!Number.isNaN(w) && w >= 0) {
      return {
        weight: w,
        stable: cas[1].toUpperCase() === 'ST',
        unit: 'KG',
        raw: trimmed,
      };
    }
  }

  // Essae / generic: "  12.345 kg" or "+12.345"
  const generic = trimmed.match(/([+-]?\d+\.?\d*)\s*(?:kg|kgs|g)?\b/i);
  if (generic) {
    let w = Math.abs(parseFloat(generic[1]));
    if (trimmed.toLowerCase().includes('g') && !trimmed.toLowerCase().includes('kg') && w > 50) {
      w = w / 1000;
    }
    if (!Number.isNaN(w) && w >= 0 && w < 10000) {
      return {
        weight: w,
        stable: !/^US/i.test(trimmed),
        unit: 'KG',
        raw: trimmed,
      };
    }
  }

  return null;
}

const formatWeight = (n) => {
  const v = Number(n);
  if (Number.isNaN(v) || v < 0) return '0.00';
  return v.toFixed(2);
};

/**
 * Live weight from USB serial scale (Web Serial), optional WS bridge, or manual entry.
 */
export function useScaleReader(options = {}) {
  const wsUrl = options.wsUrl ?? import.meta.env.VITE_SCALE_WS_URL ?? '';
  const baudRate = options.baudRate ?? 9600;

  const [weightDisplay, setWeightDisplay] = useState('0.00');
  const [weight, setWeight] = useState(0);
  const [stable, setStable] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState('manual');
  const [error, setError] = useState(null);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const wsRef = useRef(null);
  const bufferRef = useRef('');
  const manualRef = useRef(false);
  const lastStableRef = useRef({ value: 0, at: 0 });

  const applyReading = useCallback((parsed, sourceMode) => {
    if (!parsed || manualRef.current) return;
    const w = parsed.weight;
    setWeight(w);
    setWeightDisplay(formatWeight(w));
    setStable(parsed.stable);
    setMode(sourceMode);
    setConnected(true);
    setError(null);
    if (parsed.stable) {
      lastStableRef.current = { value: w, at: Date.now() };
    }
  }, []);

  const ingestChunk = useCallback(
    (chunk, sourceMode) => {
      bufferRef.current += chunk;
      const parts = bufferRef.current.split(/\r\n|\r|\n/);
      bufferRef.current = parts.pop() || '';

      for (const line of parts) {
        const parsed = parseScaleReading(line);
        if (parsed) applyReading(parsed, sourceMode);
      }

      if (bufferRef.current.length > 80) {
        const parsed = parseScaleReading(bufferRef.current);
        if (parsed) applyReading(parsed, sourceMode);
        bufferRef.current = bufferRef.current.slice(-40);
      }
    },
    [applyReading]
  );

  const readSerialLoop = useCallback(
    async (port) => {
      const reader = port.readable.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      try {
        while (port.readable) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) ingestChunk(decoder.decode(value, { stream: true }), 'serial');
        }
      } catch (err) {
        if (err?.name !== 'NetworkError') {
          setError(err?.message || 'Scale disconnected');
        }
      } finally {
        reader.releaseLock?.();
        readerRef.current = null;
      }
    },
    [ingestChunk]
  );

  const connectSerial = useCallback(async () => {
    if (!('serial' in navigator)) {
      setError('Browser serial not supported — use Chrome/Edge or set VITE_SCALE_WS_URL');
      return false;
    }
    try {
      manualRef.current = false;
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate, dataBits: 8, stopBits: 1, parity: 'none' });
      portRef.current = port;
      setConnected(true);
      setMode('serial');
      setError(null);
      readSerialLoop(port);
      return true;
    } catch (err) {
      if (err?.name !== 'NotFoundError') {
        setError(err?.message || 'Could not open scale port');
      }
      return false;
    }
  }, [baudRate, readSerialLoop]);

  const disconnect = useCallback(async () => {
    manualRef.current = false;
    try {
      await readerRef.current?.cancel?.();
    } catch {
      /* ignore */
    }
    try {
      await portRef.current?.close?.();
    } catch {
      /* ignore */
    }
    portRef.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setMode('manual');
    setStable(false);
  }, []);

  const setManualWeight = useCallback((value) => {
    manualRef.current = true;
    setMode('manual');
    const n = parseFloat(value);
    if (value === '' || Number.isNaN(n)) {
      setWeight(0);
      setWeightDisplay('0.00');
      setStable(false);
      return;
    }
    setWeight(n);
    setWeightDisplay(formatWeight(n));
    setStable(true);
  }, []);

  const useLiveWeight = useCallback(() => {
    manualRef.current = false;
    setMode(connected ? (portRef.current ? 'serial' : 'websocket') : 'manual');
  }, [connected]);

  const getBillingWeight = useCallback(() => {
    if (stable && weight > 0) return weight;
    if (lastStableRef.current.value > 0 && Date.now() - lastStableRef.current.at < 5000) {
      return lastStableRef.current.value;
    }
    return weight;
  }, [stable, weight]);

  useEffect(() => {
    if (!wsUrl) return undefined;
    manualRef.current = false;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setMode('websocket');
      setError(null);
    };
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.weight != null) {
          applyReading(
            {
              weight: parseFloat(data.weight),
              stable: data.stable !== false,
              unit: 'KG',
              raw: String(data.weight),
            },
            'websocket'
          );
          return;
        }
      } catch {
        /* plain text */
      }
      ingestChunk(String(evt.data), 'websocket');
    };
    ws.onerror = () => setError('Scale bridge connection failed');
    ws.onclose = () => {
      setConnected(false);
      if (mode === 'websocket') setMode('manual');
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl, applyReading, ingestChunk, mode]);

  useEffect(() => () => {
    disconnect();
  }, [disconnect]);

  return {
    weight,
    weightDisplay,
    stable,
    connected,
    mode,
    error,
    isSerialSupported: typeof navigator !== 'undefined' && 'serial' in navigator,
    connectSerial,
    disconnect,
    setManualWeight,
    useLiveWeight,
    getBillingWeight,
    formatWeight,
  };
}

export default useScaleReader;
