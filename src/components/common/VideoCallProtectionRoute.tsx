import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { Navigate, useLocation } from "react-router-dom"
import { Children } from "../../types/Alltypes"

export const VideoCallProtectedRoute = ({ children }: Children) => {
    const state = useSelector((state: RootState) => state.user)
    const location = useLocation();
    if (state && state?.role === 'user' && state.user||state && state.role==='company' && state.user) {
      return children
    } else {
      return <Navigate state={{from:location.pathname}} to={'/login'} replace/>
    }
  
  }
  