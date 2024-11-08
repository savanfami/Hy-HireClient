import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/socketContext';
import moment from 'moment';
// import {useSocket} from '../../context/socketContext'
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_AUDIO_URL as string;

interface IChatMessagePayload {
    recieverName: string;
    recieverImage: string;
    chatId?: string;
}



export const ChatMessageSection: React.FC<IChatMessagePayload> = ({
    recieverImage,
    recieverName,
    chatId
}) => {
    const [isSender, setIsSender] = useState<boolean>(false);
    // const [socket, setSocket] = useState<Socket>();
    const [message, setMessage] = useState<string>('');
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const [datas, setData] = useState<any>([])
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingError, setRecordingError] = useState<string>('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const state = useSelector((state: RootState) => state?.user)
    const userId = state?.user?.data?._id
   console.log(isSender)

    const { socket, joinRoom, sendMessage: emitMessage } = useSocket();
    const lastMessage = datas[datas.length - 1]
  
    useEffect(() => {
        if (!chatId) return;
        joinRoom(chatId);
        if (socket) {
            socket.on('receiveMessage', (receivedMessage) => {
                setData((prevData: any) => [...prevData, receivedMessage]);
            });
        }
        
        
        if (socket) {
            socket.on('updatedMessageStatus', () => {
                setData((prevData: any) =>
                    prevData.map((message: any) => ({
                        ...message,
                        isRead: true    
                    }))
                );
            }); 
            console.log(datas.length)
        }
    

    



        return () => {
            if (socket) {
                socket.off('receiveMessage');
                socket.emit('leaveRoom',chatId)
            }
        };
    }, [socket, chatId, joinRoom]);




   

    // if (socket) {
    //     console.log('Socket connected, setting up event listeners.');
        
    //     socket.on('updatedMessage', (chatId) => {
    //         // Use useEffect to monitor state changes
    //         setData((prevData: any[]) => {
    //             const newData = prevData.map((message) => {
    //                 if (message.chatId === chatId && !message.isRead) {
    //                     return {
    //                         ...message,
    //                         isRead: true
    //                     };
    //                 }
    //                 return message;
    //             });
                
    //             // Log inside the state updater function to see the new state
    //             console.log('New data to be set:', newData);
    //             return newData;
    //         });
    //     });
    // }



    

    const handleEmojiSelect = (emoji: any) => {
        setMessage((prev) => prev + emoji.emoji);
        setShowEmojiPicker(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        setRecordingError('');
    };

    const sendMessage = async (message: string, audio: string) => {
        try {
            const { data } = await axios.post(
                `${URL}/job/messages`,
                {
                    chatId,
                    message,
                    audio: audio
                },
                config
            );
 

            const chatSocketPayload = {
                _id:data._id,
                senderId: userId,
                message: message,
                audio: audio,
                isAudio: !!audio,
                chatId: data.chatId,
                createdAt: data.createdAt,
                updatedAt:data.updatedAt
            };

            //here we are  Emitting via socket 
            if (socket && socket.connected) {
                console.log('emotted')
                emitMessage(chatSocketPayload);;
            } else {
                console.log('Socket not connected - message will not be sent in real-time');
            }

            // setData((prevData: any) => [...prevData, newMessage]);
            setMessage('');
            setIsSender(true);
        } catch (error) {
            console.error('Error sending message:', error);
            setRecordingError('Failed to send message. Please try again.');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isRecording) {
            handleAction();
        }
    };

    const cleanupRecording = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        setIsRecording(false);
    }, []);

    const startRecording = async () => {
        try {
            setRecordingError('');
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(200);
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            setRecordingError('Failed to start recording. Please check your microphone permissions.');
            cleanupRecording();
        }
    };

    const stopRecording = async () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            return;
        }

        try {
            const recordingEndedPromise = new Promise((resolve) => {
                if (mediaRecorderRef.current) {
                    mediaRecorderRef.current.onstop = () => resolve(true);
                }
            });
            mediaRecorderRef.current.stop();
            await recordingEndedPromise;
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm', lastModified: Date.now() });
            const formData = new FormData();
            formData.append('file', audioFile);
            formData.append('upload_preset', 'hy-hire');
            formData.append('resource_type', 'video');

            console.log('Uploading to Cloudinary...');
            const cloudinaryResponse = await axios.post(CLOUDINARY_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return cloudinaryResponse.data.secure_url;
        } catch (error: any) {
            console.error('Error processing recording:', error);
            const errorMessage = error.response?.data?.error?.message || 'Failed to process recording. Please try again.';
            setRecordingError(errorMessage);
            console.error('Detailed error:', error.response?.data || error.message);
            return null;
        } finally {
            cleanupRecording();
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [datas]);

    useEffect(() => {
        return () => {
            cleanupRecording();
        };
    }, [cleanupRecording]);

    const handleAction = async () => {
        let audioUrl: string | null = null;

        if (isRecording) {
            audioUrl = await stopRecording();
        } else {
            if (message.trim()) {
                await sendMessage(message.trim(), '');
                return;
            } else {
                startRecording();
                return;
            }
        }

        if (audioUrl) {
            await sendMessage('', audioUrl);
        }
    };

    const fetchMessages = async (chatId: string) => {
        try {
            const { data } = await axios.get(`${URL}/job/messages`, {
                params: { chatId },
                ...config
            });
            console.log(data)
            if (data) {
                setData(data)
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        fetchMessages(chatId as string)
    }, [chatId,userId])

    return (
        <div className="flex flex-col h-[580px] ">
            <div className="flex items-center p-3   border-gray-200">
                <img
                    src={recieverImage}
                    className="h-12 w-12 rounded-full object-cover"
                    alt="Profile"
                />
                <div className="ml-3">
                    <p className="font-semibold">{recieverName}</p>
                    {/* <p className="text-gray-500 text-sm">Hey, how are you?</p> */}
                </div>
            </div>

            {/* <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                {datas.map((data: any, index: number) => {
                    console.log(data)
                    const isSender = data.senderId === userId;
                    const time = moment(data.createdAt).format('HH:mm');

                    return (
                        <ChatBubble isAudio={data.isAudio} time={time}  key={index} isSender={isSender} audio={data?.audio} messages={data.message} />
                    );
                })}
                <div ref={messagesEndRef} />
            </div> */}
              <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
      {datas.map((data: {
          isRead: boolean; senderId: any; createdAt: moment.MomentInput; isAudio: boolean; audio: string | undefined; message: string | number; 
}, index: any ) => {
        const isSender = data.senderId === userId;
        const time = moment(data.createdAt).format('HH:mm');
        const currentDate = moment(data.createdAt).startOf('day');
        const previousDate = index > 0 ? moment(datas[index - 1].createdAt).startOf('day') : null;
        const showDateDivider = !previousDate || !currentDate.isSame(previousDate, 'day');
        let dateLabel;
        if (currentDate.isSame(moment(), 'day')) {
          dateLabel = "Today";
        } else if (currentDate.isSame(moment().subtract(1, 'day'), 'day')) {
          dateLabel = "Yesterday";
        } else if (currentDate.isAfter(moment().subtract(1, 'week'), 'day')) {
          dateLabel = currentDate.format('dddd');
        } else {
          dateLabel = currentDate.format('MMMM D, YYYY'); 
        }

        return (
          <div key={index}>
            {showDateDivider && (
              <div className="flex justify-center items-center my-2 text-gray-500   rounded-lg text-sm mx-auto px-4 py-1">
              {dateLabel}
            </div>
            )}
            
            <ChatBubble 
              isAudio={data.isAudio} 
              time={time} 
              isSender={isSender} 
              audio={data?.audio} 
              messages={data.message} 
              isRead={data.isRead}
              senderId={lastMessage.senderId}
            />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
      
 
    </div>

            {recordingError && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                    <p className="text-red-500 text-sm">{recordingError}</p>
                </div>
            )}

            <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none"
                        placeholder={isRecording ? "Recording..." : "Type something..."}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        value={message}
                        disabled={isRecording}
                    />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => !isRecording && setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2 rounded-full hover:bg-gray-100 ${isRecording ? 'opacity-50' : ''}`}
                        >
                            <InsertEmoticonIcon className="text-gray-600" />
                        </button>
                        <button
                            onClick={handleAction}
                            className={`p-2 rounded-full ${isRecording
                                ? 'bg-red-500 animate-pulse'
                                : message.trim()
                                    ? 'bg-maincolr'
                                    : 'bg-maincolr'
                                }`}
                        >
                            {message.trim() ? (
                                <SendIcon className="text-white" />
                            ) : (
                                <MicIcon className="text-white" />
                            )}
                        </button>
                    </div>
                </div>
                {showEmojiPicker && !isRecording && (
                    <div className="absolute bottom-20 right-7 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiSelect} />
                    </div>
                )}
            </div>
        </div>
    );
};
