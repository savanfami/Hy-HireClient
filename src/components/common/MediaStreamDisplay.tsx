import React, { useRef, useEffect } from 'react';

interface MediaStreamDisplayProps {
  stream: MediaStream | null;
  profilePicture?: string; // Make it optional
  userName?: string; // Make it optional
}

const MediaStreamDisplay: React.FC<MediaStreamDisplayProps> = ({
  stream,
  profilePicture,
  userName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }

    // Cleanup when the component unmounts or stream changes
    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={userName}
            className="w-24 h-24 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center mb-2">
            <span className="text-white">No Image</span>
          </div>
        )}
        {userName && <p className="text-lg text-white">{userName}</p>}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <video
        className='bg-neutral-700 rounded-lg h-full'
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transform: "scaleX(-1)", // Mirror effect for video
        }}
      />
    </div>
  );
};

export default React.memo(MediaStreamDisplay);
