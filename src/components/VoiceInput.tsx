import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { FoodType, Product } from '../types';

interface VoiceInputProps {
  onVoiceInput: (productInfo: Partial<Omit<Product, 'id'>>) => void;
}

// Fonction simulant une IA pour analyser le texte
function analyzeText(text: string): Partial<Omit<Product, 'id'>> {
  const words = text.toLowerCase().split(' ');
  const result: Partial<Omit<Product, 'id'>> = {};

  // Analyse du nom du produit (on prend les 3 premiers mots comme nom)
  result.name = words.slice(0, 3).join(' ');

  // Analyse du type d'aliment
  const foodTypes: FoodType[] = ['Poisson', 'Viande', 'Légumes', 'Fruits', 'Desserts', 'Autres'];
  result.type = foodTypes.find(type => words.includes(type.toLowerCase())) || 'Autres';

  // Analyse de la quantité
  const quantityIndex = words.findIndex(word => !isNaN(parseInt(word)));
  if (quantityIndex !== -1) {
    result.quantity = parseInt(words[quantityIndex]);
  }

  // Analyse du poids
  const weightIndex = words.findIndex(word => word.includes('g'));
  if (weightIndex !== -1) {
    result.weight = parseInt(words[weightIndex]);
  }

  // Analyse du tiroir
  const drawerIndex = words.findIndex(word => word.includes('tiroir'));
  if (drawerIndex !== -1 && drawerIndex < words.length - 1) {
    result.drawer = parseInt(words[drawerIndex + 1]);
  }

  return result;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        processTranscript(result);
        stopListening();
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [stopListening]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    } else {
      console.error('La reconnaissance vocale n\'est pas supportée par ce navigateur.');
    }
  }, []);

  const processTranscript = useCallback((text: string) => {
    try {
      const analyzedInfo = analyzeText(text);
      onVoiceInput(analyzedInfo);
    } catch (error) {
      console.error('Erreur lors du traitement de l\'entrée vocale:', error);
    }
  }, [onVoiceInput]);

  return (
    <div className="mb-4">
      <button
        onClick={startListening}
        className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center"
        disabled={isListening}
      >
        {isListening ? <MicOff /> : <Mic />}
        <span className="ml-2">Entrée vocale</span>
      </button>
      {isListening && <p className="text-gray-600 mt-2">Écoute en cours...</p>}
      {transcript && (
        <div className="mt-2">
          <h3 className="font-bold">Transcription :</h3>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;