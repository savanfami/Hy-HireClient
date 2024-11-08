import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MediaStreamDisplay from "./MediaStreamDisplay";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { IoVideocam, IoVideocamOff } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { useSelector } from "react-redux";
import Peer from "peerjs";
import { RootState } from "../../redux/store";
import { useSocket } from "../../context/socketContext";

export const VideoCall: React.FC = () => {
  const { socket } = useSocket();
  const myPeerRef = useRef<Peer | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [callEnded, setCallEnded] = useState(false);
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const state = useSelector((state: RootState) => state?.user)
  const currentUserId = state?.user?.data?._id
  const { roomId } = useParams()
  const firstName = state.user.data?.name;
  const currentUserName = firstName
  const profilePicture = state.user.data?.image || state.user.data.icon

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: isVideoOn,
          audio: true,
        });
        setStream(mediaStream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOn, isAudioOn]);

  useEffect(() => {
    if (!stream || !currentUserId) return; // Wait for the stream and currentUserId to be ready

    myPeerRef.current = new Peer(currentUserId);

    myPeerRef.current.on("open", (id) => {
      console.log("User joined the peer with id:", id);
      socket?.emit("join-call-room", { roomId, userId: currentUserId });
      console.log('emitted')
    });

    myPeerRef.current.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        addRemoteStream(call.peer, userVideoStream);
      });
    });

    socket?.on("user-joined-room", (userId: string) => {
      console.log('userid', userId)
      if (!remoteStreams[userId]) {
        const call = myPeerRef.current?.call(userId, stream);
        if (call) {
          call.on("stream", (userVideoStream) => {
            addRemoteStream(userId, userVideoStream);
          });

          call.on("close", () => {
            removeRemoteStream(userId);
          });
        }
      }
    });

    // Send your stream to every connected peer when a new user joins
    socket?.on("existing-users", (users: any) => {
      console.log('recieved here')
      users.forEach((userId: string) => {
        if (userId !== currentUserId && !remoteStreams[userId]) {
          const call = myPeerRef.current?.call(userId, stream);
          if (call) {
            call.on("stream", (userVideoStream) => {
              addRemoteStream(userId, userVideoStream);
            });

            call.on("close", () => {
              removeRemoteStream(userId);
            });
          }
        }
      });
    });


    socket?.on("user-disconnected", (userId: any) => {
      removeRemoteStream(userId);
    });

    return () => {
      myPeerRef.current?.destroy();
      socket?.off("user-joined-room");
      socket?.off("user-disconnected");
      socket?.off("existing-users");
    };
  }, [socket, roomId, currentUserId, stream]);

  const addRemoteStream = (userId: string, userVideoStream: MediaStream) => {
    setRemoteStreams((prevStreams) => ({
      ...prevStreams,
      [userId]: userVideoStream,
    }));
  };

  const removeRemoteStream = (userId: string) => {
    setRemoteStreams((prevStreams) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [userId]: _, ...rest } = prevStreams;
      return rest;
    });
  };


  const toggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioOn((prev) => !prev);
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const handleEndCall = () => {
    setCallEnded(true);
    myPeerRef.current?.destroy();
    socket?.emit("leave-room", { roomId, userId: currentUserId });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };

    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdownVisible]);

  const handleClickMoreOption = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleBack = () => {
    if (state && state.role === 'user') {
      navigate('/')
    } else if (state && state.role === 'company') {
      navigate(-1)
    }
  }

  return callEnded ? (
    <div className="h-screen flex flex-col justify-center items-center dark:bg-dark-bg">
      <h2 className="text-xl text-gray-700 dark:bg-dark-bg dark:text-gray-300">Call Ended</h2>
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        onClick={handleBack}
      >
        Back to Hy-hire
      </button>
    </div>
  ) : (
    <div className="dark:bg-dark-bg h-screen">
      <div className="h-[8%] dark:bg-neutral-800 bg-neutral-200 w-full flex justify-between items-center">
        <div className="h-10 ml-4 w-10 rounded-full hover:bg-neutral-300 dark:text-white dark:hover:bg-neutral-700 flex justify-center items-center">
          <IoArrowBack size={25} />
        </div>
        <div onClick={handleClickMoreOption} className="h-10 w-10 flex rounded-full hover:bg-neutral-300 dark:text-white dark:hover:bg-neutral-700 justify-center items-center mr-4">
          <MdMoreVert size={28} />
        </div>
        <div
          id="dropdownDots"
          ref={dropdownRef}
          className={`absolute right-0 mt-14 w-40  mr-14 bg-white divide-y divide-gray-100 rounded-lg  dark:bg-neutral-700 dark:divide-neutral-600 shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] ${isDropdownVisible ? "" : "hidden"
            }`}
          aria-labelledby="dropdownMenuIconButton"
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white"
              >
                Copy the call Link and share
              </a>

            </li>
          </ul>
        </div>
      </div>
      <div className="h-[83%] w-full">
        <div className="h-[65%] flex justify-center items-center">
          <div className="h-[90%] w-[90%] md:w-[80%] lg:w-[60%] dark:bg-neutral-800 rounded-xl flex flex-col justify-center items-center">
            {isVideoOn ? (
              <MediaStreamDisplay stream={stream} />
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={profilePicture || "/default-profile.png"}
                  alt={currentUserName}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <p className="text-lg mt-2 dark:text-white">{currentUserName}</p>
                {!isAudioOn && (
                  <FaMicrophoneSlash size={24} className="text-red-500 mt-2" />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="h-[35%] flex justify-center">
          <div className="h-[90%] w-[90%] md:w-[95%] dark:bg-neutral-800 rounded-xl bg-neutral-300 flex overflow-x-auto overflow-y-hidden p-3 scrollbar-custom">
            <div
              id="video-grid"
              className="flex space-x-3 justify-center items-center"
            >
              {Object.values(remoteStreams).map((remoteStream, index) => (
                <MediaStreamDisplay key={index} stream={remoteStream} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[9%] bg-neutral-200 dark:bg-neutral-800 p-2 w-full flex justify-center items-center">
        <div className="w-[200px] h-[60px] flex justify-around">
          <div
            onClick={toggleVideo}
            className={`h-11 w-11 rounded-full flex justify-center text-white items-center ${isVideoOn
                ? "bg-neutral-700 hover:bg-neutral-600"
                : "bg-red-600 hover:bg-red-500"
              }`}
          >
            {isVideoOn ? <IoVideocam size={22} /> : <IoVideocamOff size={22} />}
          </div>
          <div
            onClick={handleEndCall}
            className="h-11 w-11 bg-red-600 hover:bg-red-500 rounded-full flex justify-center items-center text-white"
          >
            <MdCallEnd size={25} />
          </div>
          <div
            onClick={toggleAudio}
            className={`h-11 w-11 rounded-full flex justify-center text-white items-center ${isAudioOn
                ? "bg-neutral-700 hover:bg-neutral-600"
                : "bg-red-600 hover:bg-red-500"
              }`}
          >
            {isAudioOn ? (
              <FaMicrophone size={22} />
            ) : (
              <FaMicrophoneSlash size={22} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

