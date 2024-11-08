import React, { useState } from 'react';
import axios from 'axios';
import { DatePicker } from '../common/DateandTimePicker';
import { isBefore, startOfDay } from 'date-fns';
import { InterviewSchedule } from '../../types/companyTypes';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import { formateDatetoThree } from '../../utils/common/formatDate';

interface InterviewScheduleData {
  interviewSchedules: InterviewSchedule;
  onUpdate: (updatedSchedule: InterviewSchedule) => void;
}

export const InterviewReschedule: React.FC<InterviewScheduleData> = ({ interviewSchedules ,onUpdate}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState<boolean>(false);

  const handleDateChange = (date: Date | null) => {
    const today = startOfDay(new Date());
    if (date && isBefore(startOfDay(date), today)) {
      setError('You cannot select a past date.');
      setSelectedDate(null);
    } else {
      setError(null);
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleDateTimeSubmit = async (status: string) => {
    try {
      let updatedSchedule: InterviewSchedule;
      let response;
      if (status === 'approved') {
        if (!selectedDate || !selectedTime) {
          setError('Please select a reschedule date and time before proceeding');
          return;
        }
        response = await axios.patch(`${URL}/job/updatereschedule`, {
          id: interviewSchedules._id,
          newDate: selectedDate,
          newTime: selectedTime,
          status: status,
        }, config);
        if (response.data) {
          updatedSchedule = {
            ...interviewSchedules,
            schedule: {
              ...interviewSchedules.schedule,
              interviewDate: selectedDate.toISOString(),
              interviewTime: selectedTime,
            },
            reschedule: {
              ...interviewSchedules.reschedule,
              status: 'approved',
            },
          };
          onUpdate(updatedSchedule);
        }
      } else if (status === 'rejected') {
        response = await axios.patch(`${URL}/job/updatereschedule`, {
          id: interviewSchedules._id,
          status: status,
        }, config);
        if (response.data) {
          updatedSchedule = {
            ...interviewSchedules,
            reschedule: {
              ...interviewSchedules.reschedule,
              status: 'rejected',
            },
          };
          onUpdate(updatedSchedule);
        }
      } else {
        return;
      }
    } catch (error) {
      console.error('Error updating interview schedule:', error);
    }
  };



  return (
    <div className="p-8 mt-5 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-4 text-gray-500">RESCHEDULE </h1>
      <p className="mb-4 bg-slate-50 font text-gray-500 font-medium  ">REASON: <span className='bg-slate-50 font text-blue-500'>{interviewSchedules.reschedule?.reason}</span></p>

      {showDateTimePicker ? (
        <div className="space-y-4">
          <DatePicker
            date={selectedDate}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            time={selectedTime}
            label="date picker"
          />

          {error && <p className="text-red-600 text-sm mt-2 mb-2">{error}</p>}
          <button
            onClick={() => handleDateTimeSubmit('approved')}
            className="bg-maincolr text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
        </div>
      ) : (
        interviewSchedules.reschedule.status === 'requested' && (
          <button
            onClick={() => setShowDateTimePicker(true)}
            className="bg-maincolr text-white font-bold py-2 px-4 rounded mb-4"
          >
            Select new date and time
          </button>
        )
      )}

      <br />
      {interviewSchedules.reschedule.status === 'requested' ? (

        <button onClick={() => handleDateTimeSubmit('rejected')} className="bg-maincolr w-40 text-white rounded font-bold py-2 px-4 ">
          Decline Request
        </button>
      ) : interviewSchedules.reschedule.status === 'approved' ? (
        <div className="bg-green-100 p-4 rounded-lg text-green-600">
          <p className="font-semibold">Request Approved</p>
          <p>New Date: {formateDatetoThree(interviewSchedules.schedule.interviewDate)}</p>
          <p>New Time: {interviewSchedules.schedule.interviewTime}</p>
        </div>
      ) : interviewSchedules.reschedule.status === 'rejected' ? (
        <div className="bg-red-100 p-4 rounded-lg text-red-600">
          <p className="font-semibold">Request Rejected</p>
        </div>
      ) : null
      }
    </div>
  );
};

export default InterviewReschedule;


