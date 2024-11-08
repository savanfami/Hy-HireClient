import React, { useEffect, useState } from 'react';
import { isBefore, startOfDay } from "date-fns";
import { ApplicationStatusBar } from './ApplicantionStatusBar';
import { IApplicantProfileProps } from '../../types/companyTypes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { DatePicker } from '../common/DateandTimePicker';
import { updateApplicationStatus } from '../../redux/action/companyAction';
import { useSocket } from '../../context/socketContext';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { RescheduleStatus } from '../../types/jobTypes';

export const ApplicantHiringProgress: React.FC<IApplicantProfileProps> = ({ userId }) => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()
  const { applicantDetails } = useSelector((state: RootState) => state?.job)
  const applicantData = applicantDetails.find((data) => data.userDetails._id === userId)
  const [interviewDate, setInterviewDate] = useState<Date | null>(null);
  const [interviewTime, setInterviewTime] = useState<string>('');
  const dispatch: AppDispatch = useDispatch()
  const [roomId, setRoomId] = useState<string>('')
  const { createRoom, socket } = useSocket()
  const { user: { data } } = useSelector((state: RootState) => state?.user)
  const id = data?._id
  const handleStatusChange = async (applicationId: string, status: string) => {
    const nextStage = getNextStage(status)
    if (nextStage === 'shortlisted' && (interviewDate === null || interviewTime === '')) {
      setError('Please select an interview date and time before proceeding');
      return;
    }
    if (nextStage === 'interview' && roomId === '') {
      setError('Please create  link before proceeding')
      return;
    }
    setError(null)
    try {
      const payload = {
        applicationId,
        hiringStatus: nextStage,
        interviewDate: nextStage === 'shortlisted' ? interviewDate : undefined,
        interviewTime: nextStage === 'shortlisted' ? interviewTime : undefined,
        roomId: roomId !== '' ? roomId : undefined
      }
      await dispatch(updateApplicationStatus(payload)).unwrap()
    } catch (error: any) {
      console.error('error updating status', error)
    }
  }

  useEffect(() => {
    if (applicantData && applicantData?.schedule.roomId) {
      setRoomId(applicantData.schedule.roomId)
    }
  }, [])

  const handleDateChange = (date: Date | null) => {
    const today = startOfDay(new Date());
    if (date && isBefore(startOfDay(date), today)) {
      setError('You cannot select a past date.');
      setInterviewDate(null);
    } else {
      setError(null);
      setInterviewDate(date);
    }
  };

  const handleTimeChange = (time: string) => {
    setInterviewTime(time);
  };

  const getNextStage = (currentStatus: string) => {
    const stages = ['in-review', 'shortlisted', 'interview', 'hired']
    const currentIndex = stages.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      return currentStatus
    }
    return stages[currentIndex + 1]
  }

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
        .then(() => {
          console.log('copied')
        })
        .catch((err) => {
          console.log('failed to copy text', err)
        })
    }
  }

  if (socket?.connected) {
    socket.on('room-created', (roomId) => {
      setRoomId(`localhost:5173/call/${roomId}`)
    })
  }


  const handleCreateLink = () => {
    createRoom(id)
  }


  const handleJoinMeeting = () => {
    if (roomId) {
      const roomIdMatch = roomId.match(/\/call\/(.+)$/)
      const room = roomIdMatch ? roomIdMatch[1] : roomId;
      navigate(`/call/${room}`);
    };
  }
  return (
    <div className="flex flex-col w-full max-w-2xl max-md:max-w-full">
      <ApplicationStatusBar currentStatus={applicantData?.hiringStatus} />
      <div className='flex gap-5 mt-5'>
        {applicantData?.hiringStatus === 'shortlisted' &&
          <>
            <input
              value={roomId}
              type="text"
              readOnly
              onClick={handleCopyRoomId}
              className='w-full p-1 rounded-md bg-neutral-50 border border-gray-400 cursor-pointer'
              title="Click to copy Room ID"
            />
            <button onClick={handleCreateLink} className='bg-blue-600  text-white p-2 w-32 rounded-md whitespace-nowrap '>Create Link</button>
          </>
        }
        {/* {applicantData.} */}
        {/* {
          applicantData?.hiringStatus === 'interview' &&
          <>
            <button
              onClick={() => window.open(roomId, "_blank")}
              className="bg-blue-500 text-white p-2 w-32 rounded-md whitespace-nowrap"
            >
              Start Call
            </button>          </>
        } */}
        {applicantData?.hiringStatus === 'interview' &&
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Meeting Room</p>
              <button
                onClick={handleJoinMeeting}
                className={` text-blue-600 font-medium 
                         'hover:text-blue-800 cursor-pointer'
                       
                    }`}
              >
                Start Meeting

              </button>
            </div>

          </div>
        }
      </div>
      <div className="flex flex-col mt-5 max-w-full w-[538px]">

        <div className="flex flex-wrap gap-10 justify-between items-start mt-2 w-full">

          <div className="flex flex-col items-start text-base min-w-[240px] w-[267px]">
            {applicantData?.hiringStatus === 'shortlisted' &&
              <div>
                {error && <p className="text-red-600 text-sm mt-2 mb-2">{error}</p>}
              </div>
            }
            {applicantData?.schedule?.reschedule?.status === RescheduleStatus.Requested ? (
              <div>
                <p className='p-2   bg-maincolr text-white border border-1px-solid rounded-md font-medium mb-2'>Reschedule Requested</p>
              </div>
            ) : (
              <button onClick={() => handleStatusChange(applicantData?._id ?? '', applicantData?.hiringStatus ?? 'in-review')} className="p-2 rounded-md  font-semibold leading-relaxed text-center bg-blue-500 text-white">
                Move to next stage
              </button>
            )}
            {applicantData?.hiringStatus !== 'hired' &&
              <>
                <button onClick={() => handleStatusChange(applicantData?._id ?? '', 'rejected')} className="p-1 rounded-md w-40  mt-5 font-semibold leading-relaxed text-center bg-red-600 text-white">
                  Reject Application
                </button>
              </>
            }
            <div className="flex flex-col mt-5 leading-relaxed w-[218px]  ">
              <div className="flex flex-col">
                <div className="text-base text-slate-500 mt-2">Interview Status</div>
                <div className="gap-2 mt-2 self-start px-2.5 py-1.5 text-md border-maincolr border text-maincolr font-semibold bg-gray-100 rounded-md">
                  {applicantData?.hiringStatus}
                </div>
              </div>
            </div>
            {applicantData?.hiringStatus === 'in-review' &&
              <div className="flex flex-col mt-6 leading-relaxed">
                <div className="text-slate-500">Interview Date</div>
                <div className="font-medium text-slate-800 ">
                  <DatePicker date={interviewDate} time={interviewTime} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />
                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>
              </div>
            }
          </div>
        </div>
      </div>

    </div>
  );
};





