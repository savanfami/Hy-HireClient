import { useEffect, useState } from 'react';
import { Calendar, Clock, Building2, Briefcase } from 'lucide-react';
import { Button } from "../../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import axios from 'axios';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import { IgetUserInteviewSchedules } from '../../types/userTypes';
import { formateDatetoThree } from '../../utils/common/formatDate';
import { CustomButton } from '../../components/common/Button';
import { InfinitySpin } from 'react-loader-spinner';

interface RescheduleData {
    interviewId: string;
    reason: string;
}

const ScheduledInterviews = () => {
    const [data, setData] = useState<IgetUserInteviewSchedules[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading,setLoading]=useState<boolean>(true)
    const [selectedInterview, setSelectedInterview] = useState<string>('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get<IgetUserInteviewSchedules[]>(`${URL}/job/schedules`, config);
            setLoading(false)
            if (data) {
                setData(data);
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(error.response);
            } else {
                console.error(error);
            }
        }finally{
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRescheduleClick = (id: string) => {
        setSelectedInterview(id);
        setIsModalOpen(true);
        setError('');
        setReason('');
    };

    const validateReason = (text: string) => {
        return text.trim().length > 0;
    };

    const handleSubmit = async () => {
        if (!validateReason(reason)) {
            setError('Please provide a valid reason for rescheduling');
            return;
        }

        setIsSubmitting(true);
        try {
            const rescheduleData: RescheduleData = {
                interviewId: selectedInterview,
                reason: reason.trim()
            };

            const { data } = await axios.post(`${URL}/job/reschedule`, rescheduleData, config)
            console.log(data)
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Failed to reschedule interview');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);

        }
    };

    return (
        <>
        {loading ? (
          <div className="flex justify-center items-center h-screen">
          <InfinitySpin
            width="200"
            color="#4fa94d"
          />
        </div>
        ):(
            <>
            {data.length > 0 ? (
                <div className="p-0">
                    <div className="flex items-center justify-center mb-6 underline text-maincolr">
                        <h2 className="text-2xl font-bold text-maincolr">Scheduled Interviews</h2>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Company Name
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Job Role
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Time
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((interview) => (
                                    <TableRow key={interview._id}>
                                        <TableCell className="font-medium">{interview.companyDetails.name}</TableCell>
                                        <TableCell>{interview.jobDetails.jobTitle}</TableCell>
                                        <TableCell>{formateDatetoThree(interview.schedule.interviewDate)}</TableCell>
                                        <TableCell>{interview.schedule.interviewTime}</TableCell>
                                        <TableCell>
                                            {interview?.reschedule.status==='pending' ? (
                                                <CustomButton
                                                    text='Reschedule/cancel'
                                                    onClick={() => handleRescheduleClick(interview._id)}
                                                />
                                            ) : interview?.reschedule.status === 'requested' ? (
                                                <span className='p-2 bg-blue-500 rounded-md   text-white '>Request Submitted</span>
                                            ) : interview?.reschedule.status === 'approved' ? (
                                                <span className='p-2 bg-green-600 rounded-md text-white'>Request approved</span>
                                            ) : interview?.reschedule.status === 'rejected' ? (
                                                <span className='p-2 bg-red-500 rounded-md text-white'>Request rejected</span>
                                            ) : null
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="sm:max-w-[425px] bg-white">
                            <DialogHeader>
                                <DialogTitle>Reschedule Interview</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason for Rescheduling</Label>
                                    <Textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Please provide a reason "
                                        className={error ? 'border-red-500' : ''}
                                    />
                                    {error && (
                                        <p className="text-sm text-red-500">{error}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <div className='flex items-center justify-center'>
                    <img className='h-[550px]'
                        src="https://img.freepik.com/premium-vector/business-illustration_954303-549.jpg?ga=GA1.1.857803910.1725824513&semt=ais_hybrid"
                        alt=""
                    />
                </div>
            )}
            </>
        )}
        </>
    );
};

export default ScheduledInterviews;