import React from 'react';

export interface ChatBubbleProps {
  isSender: boolean;
  messages: string | number;
  audio?: string;
  isAudio: boolean;
  time: string
  isRead: boolean
  senderId: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ isSender, messages, audio, isAudio, time, isRead }) => {
  return (
    <div>
      <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`p-2 rounded-lg shadow-md max-w-xs ${isSender ? 'text-black bg-white' : 'bg-maincolr text-white'}`}
        >
          {isAudio && audio ? (

            <audio controls className="mt-2">
              <source src={audio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (

            <p className="text-sm">{messages}</p>
          )}
          <div className="flex items-center mt-1">
            <span className={`text-xs ${isSender ? 'text-gray-500' : 'text-white'}`}>{time}</span>
            {isSender && (
              <span className={`ml-1 ${isRead ? 'text-blue-600' : 'text-gray-400'}`}>
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
