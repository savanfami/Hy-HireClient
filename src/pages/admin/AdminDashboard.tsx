import React, { useEffect, useState } from 'react';
import { Users, Building, Briefcase, UserCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { URL } from '../../common/axiosInstance';
import { config } from '../../common/configurations';
import axios from 'axios';
import { DashboardStats } from '../../types/Admin';

// Register ChartJS components
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

const AdminDashboard:React.FC = () => {





const [stats, setStats] = useState<DashboardStats>({
  totalJobs:0,
  totalHired:0,
  totalCompanies:0,
  totalUsers:0,
  monthlyData:[]
});


  const stat = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: <Users className="h-8 w-8 text-white" />,
      color: 'bg-blue-500'
    },
    { 
      title: 'Total Companies', 
      value: stats.totalCompanies, 
      icon: <Building className="h-8 w-8 text-white" />,
      color: 'bg-green-500'
    },
    { 
      title: 'Total Jobs', 
      value: stats.totalJobs, 
      icon: <Briefcase className="h-8 w-8 text-white" />,
      color: 'bg-purple-500'
    },
    { 
      title: 'Total Hired', 
      value: stats.totalHired, 
      icon: <UserCheck className="h-8 w-8 text-white" />,
      color: 'bg-orange-500'
    }
  ];

 
  const lineChartData = {
    labels: stats.monthlyData.map(item => item.name),
    datasets: [
      {
        label: 'Users',
        data: stats.monthlyData.map(item => item.users),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        tension: 0.4,
      },
      {
        label: 'Companies',
        data: stats.monthlyData.map(item => item.companies),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        tension: 0.4,
      },
      {
        label: 'Jobs',
        data: stats.monthlyData.map(item => item.jobs),
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF6',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartData = {
    labels: stats.monthlyData.map(item => item.name),
    datasets: [
      {
        label: 'Jobs Posted',
        data: stats.monthlyData.map(item => item.jobs),
        backgroundColor: '#8B5CF6',
      },
      {
        label: 'Candidates Hired',
        data: stats.monthlyData.map(item => item.hired),
        backgroundColor: '#F97316',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const fetchData=async()=>{
    try {
      const {data}=await axios.get(`${URL}/job/admin-dashboard`,config)
       setStats(data)
       console.log(data)
    } catch (error:unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data?.message)
      } else {
        console.error(error)
      }
    }
  }

  useEffect(()=>{
      fetchData()
  },[])

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stat.map((stat, index) => (
          <Card key={index} className="border-none shadow-lg">
            <CardContent className={`${stat.color} rounded-lg p-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                  <p className="text-white text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Monthly Growth</h2>
            <div className="h-80">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Hiring Statistics</h2>
            <div className="h-80">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;