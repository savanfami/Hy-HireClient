import  { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { getCompany } from '../../redux/action/companyAction';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Briefcase, Users, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import { DashboardStatistics } from '../../types/companyTypes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const dispatch: AppDispatch = useDispatch();
  const [dashboardData, setDashboardData] = useState<DashboardStatistics>({
    jobsStatistics: { totalJobs: 0, expiredJobs: 0 },
    applicantsStatistics: {
      totalApplicants: 0,
      todayInterviews: [],
      applicationsByStatus: [],
      monthlyApplications: [],
    },
  });

  const fetchData = async () => {
    try {
      await dispatch(getCompany()).unwrap();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get(`${URL}/job/company-dashboard`, config);
      console.log(data)
      setDashboardData(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.message);
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchDashboardData();
  }, [dispatch]);

  // Prepare data for charts and cards
  const monthlyApplicationsData = {
    labels: dashboardData?.applicantsStatistics.monthlyApplications.map((item) => item.month) || [],
    datasets: [
      {
        label: 'Applications',
        data: dashboardData?.applicantsStatistics.monthlyApplications.map((item) => item.count) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };



  const todayInterviews = dashboardData?.applicantsStatistics.todayInterviews || [];

  const statCards = [
    {
      title: "Total Jobs",
      value: dashboardData?.jobsStatistics.totalJobs || "0",
      icon: Briefcase,
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50",
      textColor: "text-indigo-500",
    },
    {
      title: "Expired Jobs",
      value: dashboardData?.jobsStatistics.expiredJobs || "0",
      icon: Clock,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-500",
    },
    {
      title: "Total Applicants",
      value: dashboardData?.applicantsStatistics.totalApplicants || "0",
      icon: Users,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-500",
    },
    {
      title: "Today's Interviews",
      value: todayInterviews.length || "0",
      icon: Calendar,
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },

  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter',
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodySpacing: 4,
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 14,
          weight: 700,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const allStatuses = ['in-review', 'shortlisted', 'interview', 'hired', 'rejected'];

  const statusCountMap: Record<string, number> = {};
  dashboardData?.applicantsStatistics?.applicationsByStatus.forEach(status => {
    statusCountMap[status._id] = status.count;
  });

  const completeStatusData = allStatuses.map(status => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    count: statusCountMap[status] || 0
  }));

  const statusColors: {
    'In review': string;
    Shortlisted: string;
    Interview: string;
    Hired: string;
    Rejected: string;
  } = {
    'In review': 'rgba(249, 184, 19, 0.8)',
    Shortlisted: 'rgba(0, 82, 159, 0.8)',
    Interview: 'rgba(19, 219, 147, 0.8)',
    Hired: 'rgba(11, 161, 6, 0.8)',
    Rejected: 'rgba(239, 68, 68, 0.8)',
  };

  const chartData = {
    labels: completeStatusData.map(item => item.status),
    datasets: [
      {
        label: 'Applications by Status',
        data: completeStatusData.map(item => item.count),
        backgroundColor: completeStatusData.map(item =>
          statusColors[item.status as keyof typeof statusColors] || 'rgba(200, 200, 200, 0.8)'
        ),
        borderRadius: 8,
      },
    ],
  };


  return (
    <div className="p-6  min-h-screen">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.lightColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <h3 className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Monthly Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Line data={monthlyApplicationsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-none">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Today's Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            <div className="py-2 flex items-center justify-between text-gray-500 font-semibold text-sm">
              <div className="w-1/3">Name</div>
              <div className="w-1/3 text-center">Job Role</div>
              <div className="w-1/3 text-right">Time</div>
            </div>

            {todayInterviews
              .filter(interview => interview.status === 'confirmed' || interview.status === 'pending') 
              .map((interview, index) => (
                <div key={index} className="py-4 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-1/3">
                    <p className="font-medium text-gray-800">{interview.candidateName}</p>
                  </div>

                  <div className="w-1/3 text-center">
                    <p className=" text-gray-800 font-medium">{interview.jobTitle}</p>
                  </div>

                  <div className="w-1/3 text-right px-4 py-2 rounded-full text-sm font-medium text-indigo-600">
                    {interview.interviewTime}
                  </div>
                </div>
              ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
