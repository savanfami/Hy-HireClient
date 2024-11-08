import  { useEffect, useState } from 'react'
import { Chat } from '../../components/common/Chat'
import { ChatMessageSection } from '../../components/common/ChatMessageSection'
import axios  from 'axios'
import { URL } from '../../common/axiosInstance'
import { config } from '../../common/configurations'
import { IgetChatResponse } from '../../types/userTypes'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { IUserStatusChange } from '../../types/Common'
import { useSocket } from '../../context/socketContext'
import { InfinitySpin } from 'react-loader-spinner'

export const Messages = () => {
  const [datas, setData] = useState<IgetChatResponse[]>([])
  const [selectedChat, setSelectedChat] = useState<IgetChatResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [onlineStatusMap, setOnlineStatusMap] = useState<any>([]);
  const { id } = useParams()
  const { socket, messageSeen } = useSocket();
  const state = useSelector((state: RootState) => state?.user)
  const userId = state?.user?.data?._id
  const fetchChat = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${URL}/job/chat`, config)
      setLoading(false)
      if (state.role === 'user') {
        setData(data)
      } else if (state.role === 'company') {
        const userChatData = data.map((chat: any) => ({
          _id: chat._id,
          recieverId: chat.senderId,
          lastMessage: chat.lastMessage,
          messageSender: chat.messageSender,
          unreadCount: chat.unreadCount,
          companyData: {
            _id: chat.companyData._id,
            name: chat.companyData.name,
            icon: chat.companyData.image,
          }
        }));
        setData(userChatData);
      }
      if (id) {
        const chat = data.find((chat: IgetChatResponse) => chat.companyData._id === id)
        if (chat) {
          setSelectedChat(chat)
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.message)
      } else {
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (!socket) return;
    socket.emit('getOnlineStatus');

    const handleUserStatus = (data: IUserStatusChange[]) => {
      setOnlineStatusMap(data);
    };

    const handleUnreadCountUpdated = ({ chatId, unreadCount, messageSender, lastMessage }: { chatId: string; unreadCount: number, messageSender: string, lastMessage: string }) => {
      setData((prevData) =>
        prevData.map((chat) =>
          chat._id === chatId ? { ...chat, unreadCount, messageSender: messageSender, lastMessage } : chat
        )
      );
    };

    const handleLastMessageUpdated = ({ chatId, lastMessage, messageSender }:{chatId:string,lastMessage:string,messageSender:string}) => {
      console.log(chatId,lastMessage,messageSender)
      setData((prevData) =>
        prevData.map((chat) =>
          chat._id === chatId ? { ...chat, lastMessage, messageSender:messageSender } : chat
        )
      );
    };

    socket.on("unreadCountUpdated", handleUnreadCountUpdated);
    socket.on('lastMessageUpdated',handleLastMessageUpdated)


  
   
  

    socket.on("userStatus", handleUserStatus);


    return () => {
      socket.off("userStatus", handleUserStatus);
      socket.off("unreadCountUpdated", handleUnreadCountUpdated);
      // socket.off('lastMessageUpdated',handleLastMessageUpdated)

    };
  }, [socket]);

useEffect(()=>{
  if(socket){
    socket.on('receiveMessage', (data:any) => {
      setData((prevData) =>
        prevData.map((chat) =>
          chat._id === data.chatId ? { ...chat, lastMessage:data.message} : chat
        )
      );
    });
  }

},[socket])


  const handleSelectedChat = (chat: IgetChatResponse) => {
    setSelectedChat(chat)
    messageSeen(chat._id, userId)

    setData((prevData) =>
      prevData.map((item) =>
        item._id === chat._id ? { ...item, unreadCount: 0 } : item
      ))
    // setData()
  }


  const getOnlineStatus = (userId: string) => {
    const userStatus = onlineStatusMap.find((status: { userId: string }) => status.userId === userId);
    return {
      isOnline: userStatus?.isOnline || false,
      lastActive: userStatus?.lastActive || '',
    };
  };

  const renderNoChatMessage = () => {
    if (state.role === 'user') {
      return <div>
        <div className='flex items-center justify-center'>
          <img src="https://img.freepik.com/premium-vector/email-marketing-email-newsletter-marketing_773186-468.jpg?ga=GA1.2.857803910.1725824513&semt=ais_hybrid" alt="message" />
        </div>
        <div className='flex justify-center'>

          <Link to='/companyListing'>
            <button className='font-bold  bg-blue-500  text-white rounded-lg p-2 shadow-lg'>START MESSAGING NOW</button>
          </Link>
        </div>
      </div>
    } else if (state.role === 'company') {
      return <div>
        <div className='flex items-center justify-center'>
          <img src="https://img.freepik.com/premium-vector/mail-envelope-with-document-cross-mark-icon-vector-illustration_115464-1090.jpg?ga=GA1.2.857803910.1725824513&semt=ais_hybrid" alt="no message found" />
        </div>
        <div className='flex justify-center'>

          <h1 className='font-bold  text-maincolr'>CURRENTLY YOU HAVE NO MESSAGES FROM THE JOB SEEKERS!!!</h1>
        </div>

      </div>;
    }
    return null;
  };


  useEffect(() => {
    fetchChat()
  }, [])

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <InfinitySpin width="200" color="#4fa94d" />
        </div>
      ) : (
        <>
          {datas.length === 0 ? (
            <div>
              {renderNoChatMessage()}
            </div>
          ) : (

            <div className='grid grid-cols-12 h-[580px]'>
              <div className='col-span-4 border border-gray-200 overflow-auto'>
                {datas?.map((x, index) => {
                  console.log(x)
                  const { isOnline, lastActive } = getOnlineStatus(x.recieverId);
                  return (
                    <Chat
                      key={index}
                      lastMessage={x?.lastMessage}
                      icon={x.companyData.icon}
                      onClick={() => handleSelectedChat(x)}
                      name={x.companyData.name}
                      isSelected={x._id === selectedChat?._id}
                      isOnline={isOnline}
                      lastActive={lastActive}
                      unreadCount={x.unreadCount}
                      lastMessageSender={x.messageSender}
                    />
                  );
                })}
              </div>
              <div className='col-span-8 border'>
                {selectedChat ? (
                  <ChatMessageSection chatId={selectedChat._id} recieverName={selectedChat.companyData.name} recieverImage={selectedChat.companyData.icon} />
                ) : (
                  <div className='flex items-center border justify-center h-full text-gray-500'>
                    <span className='border border-gray-200 bg-neutral-300 p-2 rounded-lg text-gray-500'>
                      Select a chat to start messaging
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}


