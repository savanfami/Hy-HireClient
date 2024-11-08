// import React, { useEffect, useRef, useState } from 'react';
// import Peer from 'simple-peer';

// const VideoCall = ({ socket, userId, remoteUserId }) => {
//     const [stream, setStream] = useState(null);
//     const [peer, setPeer] = useState(null);
//     const [isAudioMuted, setIsAudioMuted] = useState(false);
//     const [isVideoMuted, setIsVideoMuted] = useState(false);
//     const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ongoing, ended
    
//     const localVideoRef = useRef();
//     const remoteVideoRef = useRef();

//     // Initialize media stream
//     const initializeMedia = async () => {
//         try {
//             const mediaStream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true
//             });
//             setStream(mediaStream);
//             if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = mediaStream;
//             }
//             return mediaStream;
//         } catch (err) {
//             console.error('Error accessing media devices:', err);
//         }
//     };

//     // Initialize call as caller
//     const initiateCall = async () => {
//         const mediaStream = await initializeMedia();
//         if (!mediaStream) return;

//         const newPeer = new Peer({
//             initiator: true,
//             trickle: false,
//             stream: mediaStream,
//             config: {
//                 iceServers: [
//                     { urls: 'stun:stun.l.google.com:19302' },
//                     { urls: 'stun:stun1.l.google.com:19302' }
//                 ]
//             }
//         });

//         newPeer.on('signal', signalData => {
//             // Send call signal to the remote user
//             socket.emit('video-call-signal', {
//                 signal: signalData,
//                 from: userId,
//                 to: remoteUserId,
//                 type: 'offer'
//             });
//         });

//         newPeer.on('stream', remoteStream => {
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = remoteStream;
//             }
//             setCallStatus('ongoing');
//         });

//         setPeer(newPeer);
//         setCallStatus('calling');
//     };

//     // Handle incoming call
//     const handleIncomingCall = async (signal) => {
//         const mediaStream = await initializeMedia();
//         if (!mediaStream) return;

//         const newPeer = new Peer({
//             initiator: false,
//             trickle: false,
//             stream: mediaStream,
//             config: {
//                 iceServers: [
//                     { urls: 'stun:stun.l.google.com:19302' },
//                     { urls: 'stun:stun1.l.google.com:19302' }
//                 ]
//             }
//         });

//         newPeer.on('signal', signalData => {
//             socket.emit('video-call-signal', {
//                 signal: signalData,
//                 from: userId,
//                 to: remoteUserId,
//                 type: 'answer'
//             });
//         });

//         newPeer.on('stream', remoteStream => {
//             if (remoteVideoRef.current) {
//                 remoteVideoRef.current.srcObject = remoteStream;
//             }
//             setCallStatus('ongoing');
//         });

//         // Signal the peer with the received offer
//         newPeer.signal(signal);
//         setPeer(newPeer);
//     };

//     // Handle socket events for video call
//     useEffect(() => {
//         if (!socket) return;

//         // Handle incoming video call signal
//         socket.on('video-call-signal', async ({ signal, from, type }) => {
//             if (type === 'offer') {
//                 // Handle incoming call
//                 await handleIncomingCall(signal);
//             } else if (type === 'answer' && peer) {
//                 // Handle answer to our call
//                 peer.signal(signal);
//             }
//         });

//         // Handle call ended
//         socket.on('video-call-ended', () => {
//             endCall();
//         });

//         return () => {
//             socket.off('video-call-signal');
//             socket.off('video-call-ended');
//         };
//     }, [socket, peer]);

//     // Clean up when component unmounts
//     useEffect(() => {
//         return () => {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//             if (peer) {
//                 peer.destroy();
//             }
//         };
//     }, [stream, peer]);

//     // Toggle audio/video
//     const toggleAudio = () => {
//         if (stream) {
//             const audioTrack = stream.getAudioTracks()[0];
//             audioTrack.enabled = !audioTrack.enabled;
//             setIsAudioMuted(!audioTrack.enabled);
//         }
//     };

//     const toggleVideo = () => {
//         if (stream) {
//             const videoTrack = stream.getVideoTracks()[0];
//             videoTrack.enabled = !videoTrack.enabled;
//             setIsVideoMuted(!videoTrack.enabled);
//         }
//     };

//     // End call
//     const endCall = () => {
//         if (stream) {
//             stream.getTracks().forEach(track => track.stop());
//         }
//         if (peer) {
//             peer.destroy();
//         }
        
//         // Notify other user that call has ended
//         socket.emit('video-call-ended', {
//             from: userId,
//             to: remoteUserId
//         });
        
//         setCallStatus('ended');
//         setPeer(null);
//         setStream(null);
//     };

//     return (
//         <div className="flex flex-col items-center gap-4 p-4">
//             {/* Call status indicator */}
//             <div className="text-lg font-semibold mb-2">
//                 {callStatus === 'idle' && 'Ready to call'}
//                 {callStatus === 'calling' && 'Calling...'}
//                 {callStatus === 'ongoing' && 'Call in progress'}
//                 {callStatus === 'ended' && 'Call ended'}
//             </div>

//             {/* Video containers */}
//             <div className="flex gap-4">
//                 <div className="flex flex-col items-center">
//                     <video
//                         ref={localVideoRef}
//                         autoPlay
//                         playsInline
//                         muted
//                         className="w-64 h-48 bg-gray-200 rounded-lg object-cover"
//                     />
//                     <span className="mt-2">Your Video</span>
//                 </div>

//                 <div className="flex flex-col items-center">
//                     <video
//                         ref={remoteVideoRef}
//                         autoPlay
//                         playsInline
//                         className="w-64 h-48 bg-gray-200 rounded-lg object-cover"
//                     />
//                     <span className="mt-2">Remote Video</span>
//                 </div>
//             </div>

//             {/* Controls */}
//             <div className="flex gap-4 mt-4">
//                 {callStatus === 'idle' && (
//                     <button
//                         onClick={initiateCall}
//                         className="px-4 py-2 bg-green-500 text-white rounded-lg"
//                     >
//                         Start Call
//                     </button>
//                 )}

//                 {(callStatus === 'calling' || callStatus === 'ongoing') && (
//                     <>
//                         <button
//                             onClick={toggleAudio}
//                             className={`px-4 py-2 rounded-lg ${
//                                 isAudioMuted ? 'bg-red-500' : 'bg-green-500'
//                             } text-white`}
//                         >
//                             {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
//                         </button>
//                         <button
//                             onClick={toggleVideo}
//                             className={`px-4 py-2 rounded-lg ${
//                                 isVideoMuted ? 'bg-red-500' : 'bg-green-500'
//                             } text-white`}
//                         >
//                             {isVideoMuted ? 'Turn On Video' : 'Turn Off Video'}
//                         </button>
//                         <button
//                             onClick={endCall}
//                             className="px-4 py-2 bg-red-500 text-white rounded-lg"
//                         >
//                             End Call
//                         </button>
//                     </>
//                 )}

//                 {callStatus === 'ended' && (
//                     <button
//                         onClick={initiateCall}
//                         className="px-4 py-2 bg-green-500 text-white rounded-lg"
//                     >
//                         Start New Call
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VideoCall;