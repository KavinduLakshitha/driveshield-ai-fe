import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const API_BASE_URL: string = 'YOUR_BACKEND_URL'; // Replace with your FastAPI backend URL

// Type definitions
interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface TranscriptionResult {
  text?: string;
  language?: string;
  error?: string;
  success: boolean;
}

interface VoiceCommandResult {
  message?: string;
  success: boolean;
  error?: string;
  [key: string]: any; // Allow additional properties from backend
}

interface VoiceInteractionResult {
  success: boolean;
  message?: string;
  error?: string;
  transcription?: string;
  detectedLanguage?: string;
  stopRecording?: () => Promise<VoiceInteractionStopResult>;
}

interface VoiceInteractionStopResult {
  success: boolean;
  error?: string;
  message?: string;
  transcription?: string;
  detectedLanguage?: string;
  [key: string]: any;
}

interface FormDataFile {
  uri: string;
  type: string;
  name: string;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private sound: Audio.Sound | null = null;

  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.sound = null;
  }

  // Initialize audio permissions and settings
  async initialize(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      return false;
    }
  }

  // Start recording voice
  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return false;
      }

      // Updated recording options using the correct constants
      const recordingOptions: Audio.RecordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      
      this.isRecording = true;
      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  // Stop recording and return audio data
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.isRecording || !this.recording) {
        console.warn('Not currently recording');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      this.recording = null;

      console.log('Recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  // Transcribe audio using backend API
  async transcribeAudio(audioUri: string, language: string = 'auto'): Promise<TranscriptionResult> {
    try {
      if (!audioUri) {
        throw new Error('No audio URI provided');
      }

      // Create FormData for file upload
      const formData = new FormData();
      const file: FormDataFile = {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav',
      };
      
      formData.append('audio_file', file as any);
      formData.append('language', language);

      const response = await fetch(`${API_BASE_URL}/api/speech/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          text: result.transcribed_text,
          language: result.language,
          success: true,
        };
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown transcription error',
        success: false,
      };
    }
  }

  // Process voice command using backend
  async processVoiceCommand(text: string, userLocation?: UserLocation | null): Promise<VoiceCommandResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voice/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          user_location: userLocation,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Voice command processing error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown processing error',
        success: false,
      };
    }
  }

  // Speak text using device TTS
  async speak(text: string, language: string = 'en'): Promise<boolean> {
    try {
      // Stop any ongoing speech
      await Speech.stop();

      const speechOptions: Speech.SpeechOptions = {
        language: language === 'si' ? 'si-LK' : 'en-US',
        pitch: 1.0,
        rate: 0.8,
      };

      await Speech.speak(text, speechOptions);
      return true;
    } catch (error) {
      console.error('Speech error:', error);
      return false;
    }
  }

  // Complete voice interaction flow
  async handleVoiceInteraction(
    userLocation?: UserLocation | null, 
    language: string = 'auto'
  ): Promise<VoiceInteractionResult> {
    try {
      // Start recording
      const recordingStarted = await this.startRecording();
      if (!recordingStarted) {
        return { error: 'Failed to start recording', success: false };
      }

      return {
        success: true,
        message: 'Recording started',
        stopRecording: async (): Promise<VoiceInteractionStopResult> => {
          // Stop recording
          const audioUri = await this.stopRecording();
          if (!audioUri) {
            return { error: 'Failed to stop recording', success: false };
          }

          // Transcribe audio
          const transcription = await this.transcribeAudio(audioUri, language);
          if (!transcription.success) {
            return {
              error: transcription.error,
              success: false,
            };
          }

          // Process command
          const commandResult = await this.processVoiceCommand(
            transcription.text!, 
            userLocation
          );

          // Speak response if available
          if (commandResult.message) {
            await this.speak(commandResult.message, transcription.language || 'en');
          }

          return {
            ...commandResult,
            transcription: transcription.text,
            detectedLanguage: transcription.language,
          };
        },
      };
    } catch (error) {
      console.error('Voice interaction error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown interaction error', 
        success: false 
      };
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      if (this.isRecording && this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.isRecording = false;
        this.recording = null;
      }

      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      await Speech.stop();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Getter methods for status checking
  get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  get hasActiveRecording(): boolean {
    return this.recording !== null;
  }
}

export default new VoiceService();