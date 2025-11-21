
import React, { useEffect, useRef, useState } from 'react';
import { LiveClient, base64ToUint8Array, uint8ArrayToBase64 } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

interface LiveTutorProps {
    onBack: () => void;
}

// Helper to create PCM blob for sending
function createPcmData(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    const uint8 = new Uint8Array(int16.buffer);
    return uint8ArrayToBase64(uint8);
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}

const LiveTutor: React.FC<LiveTutorProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  const liveClientRef = useRef<LiveClient | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    try {
      setStatus('connecting');
      liveClientRef.current = new LiveClient();

      // Setup Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Get Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize Connection
      await liveClientRef.current.connect({
        onOpen: () => {
            setStatus('connected');
            setIsActive(true);
            startAudioProcessing();
        },
        onMessage: handleServerMessage,
        onClose: () => {
            setStatus('disconnected');
            setIsActive(false);
        },
        onError: (e) => {
            console.error(e);
            setStatus('disconnected');
        }
      });

    } catch (err) {
      console.error("Failed to start live session", err);
      setStatus('disconnected');
    }
  };

  const startAudioProcessing = () => {
     if (!inputContextRef.current || !streamRef.current || !liveClientRef.current) return;

     const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
     // 4096 buffer size for processing
     const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
     processorRef.current = processor;

     processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visualization
        let sum = 0;
        for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
        setVolume(Math.sqrt(sum/inputData.length) * 500); // Scale up

        const pcmBase64 = createPcmData(inputData);
        liveClientRef.current?.sendAudio(pcmBase64);
     };

     source.connect(processor);
     processor.connect(inputContextRef.current.destination);
  };

  const handleServerMessage = async (msg: LiveServerMessage) => {
     const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
     if (base64Audio && outputContextRef.current) {
        const ctx = outputContextRef.current;
        const bytes = base64ToUint8Array(base64Audio);
        const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        // Schedule playback
        const now = ctx.currentTime;
        const start = Math.max(now, nextStartTimeRef.current);
        source.start(start);
        nextStartTimeRef.current = start + buffer.duration;
     }
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    inputContextRef.current?.close();
    outputContextRef.current?.close();
    liveClientRef.current = null; // Effectively disconnects by dropping ref
    setIsActive(false);
    setStatus('disconnected');
    setVolume(0);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-indigo-50 to-white relative">
      <div className="absolute top-4 left-4">
        <button 
            onClick={() => { stopSession(); onBack(); }}
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 text-gray-500 transition z-20"
            title="Exit Session"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Oral Tutor</h2>
        <p className="text-gray-600">Practice your subjects with a real-time voice conversation.</p>
      </div>

      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
        {/* Visualizer Ring */}
        {isActive && (
             <div 
                className="absolute inset-0 rounded-full border-4 border-indigo-400 opacity-50 animate-ping"
                style={{ transform: `scale(${1 + Math.min(volume/50, 0.5)})` }}
             />
        )}
        
        <div className="z-10 text-6xl">
            {status === 'connecting' ? '⏳' : isActive ? '🎙️' : '🔇'}
        </div>
      </div>

      <div className="mt-8">
        {!isActive ? (
          <button
            onClick={startSession}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
          >
            End Session
          </button>
        )}
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        {status === 'connecting' ? 'Connecting to Gemini Live...' : 
         status === 'connected' ? 'Listening... speak clearly' : 
         'Click Start to begin'}
      </p>
    </div>
  );
};

export default LiveTutor;
