import { useCallback, useEffect, useRef, useState } from 'react';
import { voiceApi } from '../api/voiceApi.js';

const MAX_RECORDING_SECONDS = 300;

export const formatVoiceTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export const useVoiceClone = (personalityId) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [reRecordMode, setReRecordMode] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioUrlRef = useRef(null);

  const clearErrorLater = useCallback(() => {
    window.setTimeout(() => setError(null), 5000);
  }, []);

  const revokeAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const resetRecordingState = useCallback(() => {
    revokeAudioUrl();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setSuccess(false);
    setReRecordMode(false);
  }, [revokeAudioUrl]);

  const fetchStatus = useCallback(async () => {
    if (!personalityId) return;
    try {
      const data = await voiceApi.getStatus(personalityId);
      if (data.success) {
        setVoiceStatus(data);
      }
    } catch {
      setError('Could not load voice status.');
      clearErrorLater();
    }
  }, [personalityId, clearErrorLater]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      revokeAudioUrl();
    },
    [revokeAudioUrl]
  );

  const stopTracks = () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    setError(null);
    setSuccess(false);
    revokeAudioUrl();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        revokeAudioUrl();
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudioBlob(blob);
        setAudioUrl(url);
        stopTracks();
      };

      recorder.start(250);
      setRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      stopTracks();
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Allow access and try again.');
      } else {
        setError('Could not access microphone. Check your device settings.');
      }
      clearErrorLater();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
  };

  const cloneVoice = async (voiceName = '') => {
    if (!audioBlob) {
      setError('Record a voice sample first.');
      clearErrorLater();
      return { success: false };
    }
    if (recordingTime < 30) {
      setError('Record at least 30 seconds before cloning.');
      clearErrorLater();
      return { success: false };
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const result = await voiceApi.cloneVoice(personalityId, audioBlob, voiceName, recordingTime);
    setUploading(false);

    if (result?.success) {
      setSuccess(true);
      resetRecordingState();
      await fetchStatus();
      return result;
    }

    setError(result?.error || 'Voice cloning failed.');
    clearErrorLater();
    return result;
  };

  const toggleVoice = async (enabled) => {
    const result = await voiceApi.toggleVoice(personalityId, enabled);
    if (result?.success) {
      setVoiceStatus((prev) => ({
        ...prev,
        voiceEnabled: result.voice_enabled
      }));
    } else {
      setError(result?.error || 'Could not update voice setting.');
      clearErrorLater();
    }
    return result;
  };

  const deleteVoice = async () => {
    const result = await voiceApi.deleteVoice(personalityId);
    if (result?.success) {
      resetRecordingState();
      await fetchStatus();
    } else {
      setError(result?.error || 'Could not delete voice.');
      clearErrorLater();
    }
    return result;
  };

  const playAudioBlob = (blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    audio.play().catch(() => URL.revokeObjectURL(url));
  };

  const beginReRecord = () => {
    setReRecordMode(true);
    resetRecordingState();
  };

  return {
    recording,
    audioBlob,
    audioUrl,
    recordingTime,
    uploading,
    voiceStatus,
    error,
    success,
    reRecordMode,
    setError,
    startRecording,
    stopRecording,
    cloneVoice,
    toggleVoice,
    deleteVoice,
    playAudioBlob,
    fetchStatus,
    resetRecordingState,
    beginReRecord,
    formatTime: formatVoiceTime
  };
};
