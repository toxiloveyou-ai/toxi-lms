import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

/**
 * TOXI VOICE ENGINE - Multi-Model Architecture
 * Hỗ trợ: Azure (Neural), OpenAI (TTS/Whisper), Groq (Free Whisper OS), Gemini 1.5 Flash (STT), Web Speech (Fallback)
 */

type VoiceProvider = 'azure' | 'openai' | 'groq' | 'gemini' | 'web';
export type ChineseVoiceRole = 'male' | 'female';

const getCurrentProvider = (): VoiceProvider => {
  // Ưu tiên Groq cho STT (Whisper Free) để tối ưu chi phí và tốc độ
  if (import.meta.env.VITE_GROQ_API_KEY && import.meta.env.VITE_GROQ_API_KEY !== 'YOUR_GROQ_KEY_HERE') return 'groq';
  if (import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'YOUR_OPENAI_KEY_HERE') return 'openai';
  if (import.meta.env.VITE_GEMINI_API_KEY) return 'gemini';
  if (import.meta.env.VITE_AZURE_SPEECH_KEY && import.meta.env.VITE_AZURE_SPEECH_KEY !== 'YOUR_AZURE_KEY_HERE') return 'azure';
  return 'web';
};

/**
 * 1. TEXT-TO-SPEECH (TTS)
 */
export const speak = async (text: string): Promise<void> => {
  if (!text) return;
  const azureKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (azureKey && azureKey !== 'YOUR_AZURE_KEY_HERE') {
    return speakAzure(text);
  } else if (openaiKey && openaiKey !== 'YOUR_OPENAI_KEY_HERE') {
    const cleanText = text.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
    return speakOpenAI(cleanText);
  } else {
    return speakWeb(text);
  }
};

/**
 * 2. SPEECH-TO-TEXT (STT) - Hỗ trợ Groq Whisper (Free)
 */
export const listen = async (): Promise<string> => {
  const provider = getCurrentProvider();
  
  if (provider === 'groq') {
    return listenGroq();
  } else if (provider === 'openai') {
    return listenOpenAI();
  } else if (provider === 'azure') {
    return listenAzure();
  } else {
    return listenWeb();
  }
};

// --- AZURE IMPLEMENTATION ---
const speakAzure = async (text: string): Promise<void> => {
  const key = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION;
  
  if (!key || key === 'YOUR_AZURE_KEY_HERE') {
    return speakWeb(text);
  }

  const config = SpeechSDK.SpeechConfig.fromSubscription(key, region);
  const voice = { lang: 'zh-CN', voice: 'zh-CN-XiaoxiaoNeural', rate: '0.9' };
  
  const parts = text.split(/(\[.*?\]|\(.*?\))/g).filter(p => p.trim() !== "");
  let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voice.lang}">`;
  for (const part of parts) {
    if (part.startsWith('[') && part.endsWith(']')) {
      ssml += `<voice name="vi-VN-HoaiMyNeural"><prosody rate="1.0">${part.slice(1, -1)}</prosody></voice>`;
    } else if (!part.startsWith('(')) {
      ssml += `<voice name="${voice.voice}"><prosody rate="${voice.rate}">${part}</prosody></voice>`;
    }
  }
  ssml += `</speak>`;

  return new Promise((resolve) => {
    const synthesizer = new SpeechSDK.SpeechSynthesizer(config);
    synthesizer.speakSsmlAsync(ssml, () => { synthesizer.close(); resolve(); }, () => { synthesizer.close(); resolve(); });
  });
};

const listenAzure = (): Promise<string> => {
  const key = import.meta.env.VITE_AZURE_SPEECH_KEY;
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION;
  const config = SpeechSDK.SpeechConfig.fromSubscription(key, region);
  config.speechRecognitionLanguage = "zh-CN";
  
  return new Promise((resolve, reject) => {
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(config, audioConfig);
    recognizer.recognizeOnceAsync(result => {
      resolve(result.text);
      recognizer.close();
    }, err => { recognizer.close(); reject(err); });
  });
};

// --- OPENAI IMPLEMENTATION ---
const speakOpenAI = async (text: string, role: ChineseVoiceRole = 'female'): Promise<void> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: 'tts-1', 
      voice: role === 'female' ? 'nova' : 'onyx', // Nova cho nữ, Onyx cho nam
      input: text 
    })
  });
  const blob = await response.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  return new Promise((resolve) => { audio.onended = () => resolve(); audio.play(); });
};

const listenOpenAI = async (): Promise<string> => {
  return recordAndTranscribe('https://api.openai.com/v1/audio/transcriptions', import.meta.env.VITE_OPENAI_API_KEY, 'whisper-1');
};

// --- GROQ IMPLEMENTATION (Free Open Source Whisper) ---
const listenGroq = async (): Promise<string> => {
  return recordAndTranscribe('https://api.groq.com/openai/v1/audio/transcriptions', import.meta.env.VITE_GROQ_API_KEY, 'whisper-large-v3');
};

/**
 * Helper ghi âm và gửi đến API Transcription (Chuẩn OpenAI)
 */
const recordAndTranscribe = async (url: string, apiKey: string, model: string): Promise<string> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', model);
      formData.append('language', 'zh');

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: formData
        });
        const data = await response.json();
        resolve(data.text || "");
      } catch (err) {
        reject(err);
      } finally {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    mediaRecorder.start();
    // Tự động dừng sau 6s để tối ưu trải nghiệm voice chat
    setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 6000); 
  });
};

// --- WEB SPEECH FALLBACK ---
const speakWeb = async (text: string, role: ChineseVoiceRole = 'female'): Promise<void> => {
  window.speechSynthesis.cancel();
  const cleanText = text.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    
    // Tìm giọng đọc phù hợp trong trình duyệt
    const voices = window.speechSynthesis.getVoices();
    const chineseVoices = voices.filter(v => v.lang.includes('zh'));
    
    if (chineseVoices.length > 0) {
      // Logic đơn giản: thường giọng nam có tên chứa 'Male', 'David', 'Danny'...
      const maleKeywords = ['male', 'man', 'boy', 'david', 'kangkang', 'danny'];
      const targetVoice = role === 'male' 
        ? chineseVoices.find(v => maleKeywords.some(key => v.name.toLowerCase().includes(key))) || chineseVoices[0]
        : chineseVoices.find(v => !maleKeywords.some(key => v.name.toLowerCase().includes(key))) || chineseVoices[0];
        
      if (targetVoice) utterance.voice = targetVoice;
    }

    utterance.onend = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

const listenWeb = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return reject("Not supported");
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.onresult = (event: any) => resolve(event.results[0][0].transcript);
    recognition.onerror = (e: any) => reject(e.error);
    recognition.start();
  });
};
