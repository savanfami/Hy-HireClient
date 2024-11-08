import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Briefcase,

  CalendarCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import { DashboardData } from '../../types/userTypes';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);




export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalApplications: 0,
    interviewsScheduled: 0,
    savedJobsCount: 0,
    applicationStatusDistribution: [],
    monthlyApplications: [],
    jobTypeApplications: [],
    todayInterviews: []
  });

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(`${URL}/job/user-dashboard`, config);
      setDashboardData(data);
      console.log(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response);
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const applicationStatusChartData = useMemo(() => ({
    labels: dashboardData.applicationStatusDistribution.map(item => item.status),
    datasets: [{
      data: dashboardData.applicationStatusDistribution.map(item => item.count),
      backgroundColor: [
        'rgba(0, 82, 159, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(11, 161, 6, 0.8)',
        'rgba(246, 184, 27, 0.87)',
        'rgba(18, 228, 160, 0.87)'
      ],
      borderWidth: 1
    }]
  }), [dashboardData.applicationStatusDistribution]);

  const monthlyApplicationChartData = useMemo(() => ({
    labels: dashboardData.monthlyApplications.map(item => item.month),
    datasets: [{
      label: 'Applications',
      data: dashboardData.monthlyApplications.map(item => item.applications),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }), [dashboardData.monthlyApplications]);

  const jobTypeChartData = useMemo(() => {
    const backgroundColors = [
      'rgba(0, 123, 255, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)'
    ];

    return {
      labels: dashboardData.jobTypeApplications.map(item => item.type),
      datasets: [{
        label: 'Applications by Job Type',
        data: dashboardData.jobTypeApplications.map(item => item.applications),
        backgroundColor: dashboardData.jobTypeApplications.map((_, index) => backgroundColors[index % backgroundColors.length]),
        borderWidth: 1
      }]
    };
  }, [dashboardData.jobTypeApplications]);

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: 'Application Status Distribution'
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Monthly Application Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Applications by Job Type'
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">Total Applications</h3>
            <p className="text-2xl font-bold text-blue-600">
              {dashboardData.totalApplications}
            </p>
          </div>
          <Briefcase className="text-blue-500" />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">Interviews Scheduled</h3>
            <p className="text-2xl font-bold text-green-600">
              {dashboardData.interviewsScheduled}
            </p>
          </div>
          <CalendarCheck className="text-green-500" />
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">Saved Jobs</h3>
            <p className="text-2xl font-bold text-purple-600">
              {dashboardData.savedJobsCount}
            </p>
          </div>
          <TrendingUp className="text-purple-500" />
        </div>

        {dashboardData.applicationStatusDistribution.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4 md:col-span-2 lg:col-span-1">
            <Pie
              data={applicationStatusChartData}
              options={pieChartOptions}
            />
          </div>
        )}

        {dashboardData.monthlyApplications.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4">
            <Line
              data={monthlyApplicationChartData}
              options={lineChartOptions}
            />
          </div>
        )}

        {dashboardData.jobTypeApplications.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4">
            <Bar
              data={jobTypeChartData}
              options={barChartOptions}
            />
          </div>
        )}
      </div>
      {dashboardData.todayInterviews.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 md:col-span-3">
          <div className="flex items-center mb-4">
            <Clock className="mr-2 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-700">Today's Interviews</h2>
          </div>


          <div className="flex justify-between items-center font-semibold text-gray-500 border-b pb-2 mb-2">
            <span className="flex-1 text-left">Job Role</span>
            <span className="flex-1 text-center">Company Name</span>
            <span className="flex-1 text-right">Time</span>
          </div>

          {dashboardData.todayInterviews.map((interview, index) => (
            <div
              key={index}
              className="py-4 flex justify-between items-center border-b last:border-b-0"
            >
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">{interview.jobTitle}</p>
              </div>

              <div className="flex-1 text-center">
                <p className="text-sm text-gray-600 font-medium">{interview.companyName}</p>
              </div>

              <div className="flex-1 text-right flex items-center justify-end">
                <Clock className="mr-2 text-gray-500" size={16} />
                <span className="text-sm font-medium text-gray-700">
                  {interview.interviewTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};