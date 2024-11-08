
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../../redux/store'
import { Children } from '../../types/Alltypes'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { config } from '../../common/configurations'
import { URL } from '../../common/axiosInstance'
import { InfinitySpin } from 'react-loader-spinner'

export const UserPrivateRoute = ({ children }: Children) => {
  const state = useSelector((state: RootState) => state.user)

  if (state && state?.role === 'user' && state.user) {
    return children
  } else {
    return <Navigate to={'/'} />
  }

}



export const MessagePrivateRoute = ({ children }: Children) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const state = useSelector((state: RootState) => state.user)


  useEffect(() => {

    if (state.role === 'user') {
      checkSubscriptionStatus()
    }
  }, [state.role])


  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true)
      const {data} = await axios.get(`${URL}/user/subscription-status`, config);
      if(data){
        setIsSubscribed(data.data?.isSubscribed);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally { 
      setLoading(false)
    } 
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <InfinitySpin width="200" color="#4fa94d" />
    </div>
  }


  return isSubscribed ? children : <Navigate to="/" />;


}