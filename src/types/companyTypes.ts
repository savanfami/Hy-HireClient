import { IApplicantDetails } from "./jobTypes";


export type JobReducer = {
    loading: boolean,
    err: null | any,
    jobs:any
    applicantDetails:IApplicantDetails[]
}

export interface ICompanySearchParams{
    companyName:string;
    location:string;
    page:number;
    industry:string
}

export interface IApplicantProfileProps {
    userId: string; 
}

export interface IUpdateApplicationStatusPayload{
    applicationId: string;
    hiringStatus: string;
    interviewDate?: Date | null 
    interviewTime?: string 
    roomId?:string
}
export interface IUpdateApplicationStatusResponse{
    _id: string;
    hiringStatus: string;
}




export interface DashboardStatistics  {
    jobsStatistics: {
      totalJobs: number;
      expiredJobs: number;
    };
    applicantsStatistics: {
      totalApplicants: number;
      todayInterviews: {
        hiringStatus: string;
        candidateName:string;
        jobTitle: string;
        interviewDate: Date;
        interviewTime:string;
        status:string;
      }[];
      applicationsByStatus: {
        _id: string;
        count: number;
      }[];
      monthlyApplications: {
        month: string;
        year:number;
        count: number;
      }[];
    };
  };


  
  export interface InterviewSchedule {
    _id: string;
    schedule: {
      interviewDate: string;
      interviewTime: string;
      roomId: string;
      status: 'pending'|'confirmed';
    };
    reschedule: {
      reason: string;
      status: 'pending'|'requested' | 'approved' | 'rejected';
    };
  }



