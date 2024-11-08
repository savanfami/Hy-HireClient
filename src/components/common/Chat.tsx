import moment from 'moment';
import React from 'react';
import { FaMicrophone } from 'react-icons/fa'; 
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface IChatPayload {
  name: string;
  icon: string;
  onClick?: () => void;
  isSelected?: boolean;
  lastMessage?: string;
  isOnline?: boolean;
  lastMessageSender?: string;
  lastActive?: Date | string;
  unreadCount?: number;
}

export const Chat: React.FC<IChatPayload> = ({
  name,
  icon,
  onClick,
  isSelected,
  lastMessage,
  isOnline,
  lastActive,
  lastMessageSender,
  unreadCount
}) => {
  const isAudioMessage = lastMessage?.includes('res.cloudinary');
  const state = useSelector((state: RootState) => state?.user)
  const userId = state?.user?.data?._id
  console.log(userId)
  console.log(unreadCount)
  let statusText = '';
  let statusColor = '';

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  console.log(lastMessageSender)
  const displayUnreadCount = (lastMessageSender !== userId) ? (unreadCount ?? 0) : 0; 
 console.log(displayUnreadCount)
  if (isOnline) {
    statusText = 'Active Now';
    statusColor = 'text-green-600 font-normal';
  } else if (!lastActive || new Date(lastActive) < oneWeekAgo) {
    statusText = 'Offline';
    statusColor = 'text-gray-500 font-normal';
  } else {
    const lastActiveTime = moment(lastActive);
    statusText = `Last seen: ${lastActiveTime.fromNow()}`;
    statusColor = 'text-gray-500 font-normal';
  }

  return (
    <div
      onClick={onClick}
      className={`p-2 flex items-center border border-gray-200 cursor-pointer ${isSelected ? 'bg-gray-200' : ''
        }`}
    >
      <img
        src={icon}
        className="h-16 w-16 p-3 rounded-full"
        alt="Profile"
      />
      <div className="ml-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{name}</p>

          <span className={`text-sm mr-4 flex items-center ${statusColor}`}>
            <span style={{ display: 'inline-block', fontSize: '40px', color: isOnline ? '#4caf50' : '#d5cdcd' }}>•</span>
            <span className={`ml-1`}>
              {statusText}
            </span>
          </span>
          {displayUnreadCount > 0 && (
            <p className="bg-green-600 h-5 w-5 text-white rounded-full flex items-center justify-center text-xs">
              {displayUnreadCount}
            </p>
          )}
        </div>
        {isAudioMessage ? (
          <div className="flex items-center text-gray-500 text-sm">
            <FaMicrophone className="mr-2" />
            <span>Audio message</span>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{lastMessage}</p>
        )}
      </div>
    </div>
  );
};
