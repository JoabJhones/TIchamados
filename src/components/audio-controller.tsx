
'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';

// Base64 encoded WAV data for notification sounds
const NEW_TICKET_SOUND = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'; // Short "pop"
const NEW_MESSAGE_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(30).join('1234567890'); // Short "ding" like sound


export interface AudioControllerRef {
  playNewTicketSound: () => void;
  playNewMessageSound: () => void;
}

export const AudioController = forwardRef<AudioControllerRef, {}>((props, ref) => {
  const newTicketAudioRef = useRef<HTMLAudioElement>(null);
  const newMessageAudioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => ({
    playNewTicketSound: () => {
      newTicketAudioRef.current?.play().catch(e => console.error("Error playing sound:", e));
    },
    playNewMessageSound: () => {
      newMessageAudioRef.current?.play().catch(e => console.error("Error playing sound:", e));
    },
  }));

  return (
    <>
      <audio ref={newTicketAudioRef} src={NEW_TICKET_SOUND} preload="auto" />
      <audio ref={newMessageAudioRef} src={NEW_MESSAGE_SOUND} preload="auto" />
    </>
  );
});

AudioController.displayName = 'AudioController';
