import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, AlertCircle, Clipboard } from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";
import { useSelector } from 'react-redux';
import { IApplicantProfileProps, InterviewSchedule } from '../../types/companyTypes';
import { RootState } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import { InfinitySpin } from 'react-loader-spinner';
import InterviewReschedule from './InterviewSchedule';
export const ApplicantInterviewSchedule: React.FC<IApplicantProfileProps> = ({ userId }) => {
  const { applicantDetails } = useSelector((state: RootState) => state?.job);
  const [loading, setLoading] = useState<boolean>(true)
  const [interviewSchedule, setInterviewSchedule] = useState<InterviewSchedule>({
    _id:'',
    schedule:{
      interviewDate: '',
      interviewTime: '',
      roomId: '',
      status: 'pending',
    },
    reschedule: {
      status: 'requested',
      reason: ''
    }
  });
  const navigate = useNavigate();
  const applicantData = applicantDetails.find((data) => data.userDetails._id === userId);
  const id = applicantData?._id;
  const fetchInterviewStatus = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${URL}/job/schedules/${id}`, config);
      console.log(data)
      if (data) {
        setInterviewSchedule(data)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchInterviewStatus();
    console.log('cllled')
  }, [interviewSchedule.reschedule.status]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleJoinMeeting = () => {
    if (interviewSchedule?.schedule.roomId) {
      const roomIdMatch = interviewSchedule?.schedule?.roomId.match(/\/call\/(.+)$/);
      const room = roomIdMatch ? roomIdMatch[1] : interviewSchedule.schedule.roomId;
      navigate(`/call/${room}`);
    }
  };

  const handleCopyLink = () => {
    if (interviewSchedule?.schedule.roomId) {
      navigator.clipboard.writeText(interviewSchedule.schedule.roomId).then(() => {
      }).catch(() => {
        console.log('failed to copy')
      });
    }
  };

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <InfinitySpin
        width="200"
        color="#4fa94d"
      />
    </div>
  ) : (
    <div className="p-6 max-w-4xl mx-auto">
      {interviewSchedule.schedule && interviewSchedule.schedule.interviewDate ? (
        <>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(interviewSchedule.schedule.interviewDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{interviewSchedule.schedule.interviewTime}</p>
                  </div>
                </div>
                {interviewSchedule && interviewSchedule.schedule.roomId &&
                  <div className="flex items-center space-x-3">
                    <Video className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Meeting Room</p>
                      <button
                        onClick={handleJoinMeeting}
                        className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer"
                      >
                        Start Call
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="ml-3 text-blue-600 hover:text-blue-800"
                      >
                        <Clipboard className="w-5 h-5 inline" />
                      </button>
                    </div>
                  </div>
                }
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${interviewSchedule.schedule.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {interviewSchedule.schedule.status.charAt(0).toUpperCase() +
                        interviewSchedule.schedule.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {interviewSchedule?.reschedule &&
            <>
              <InterviewReschedule interviewSchedules={interviewSchedule} />
            </>
          }
          <div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Interview Scheduled</h3>
          <p className="mt-2 text-gray-500">Click the Create Link Button In Hiring Progress Page to Schedule Interview </p>
        </div>
      )}
    </div>
  );
};

export default ApplicantInterviewSchedule;