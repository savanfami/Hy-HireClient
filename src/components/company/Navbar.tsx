import { Link } from "react-router-dom";
import {  useSelector } from "react-redux";
import {  RootState } from "../../redux/store";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
export const Navbar = () => {

  const navigate = useNavigate()
  const { user: { data } } = useSelector((state: RootState) => state.user)
  
  return (
    <>
      <ToastContainer position='top-center' />
      <div className="flex justify-between items-center w-full md:py-2  md:px-8 shadow-sm ">
        <div className="">
          <div>
            {data?.name && (
                <Link to='/company/dashboard'>
              <div className="flex items-center">
                <img
                  className="w-10 h-10 rounded-xl  p-1 mr-2"
                  src={data.icon ? data.icon : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBg9zkf0PWdFupdiDjLIkF1rWzE_oC76dNaQ&s"}
                  alt="company image"
                />
                <h1 className="text-maincolr font-gg font-bold text-md md:text-xl">{data.name}</h1>

                {/* <KeyboardArrowDownIcon className="text-gray-500" /> */}
              </div>
                </Link>
            )}
          </div>
        </div>
        <div className="flex md:gap-8">
          <button onClick={() => {
            if (data.profileCompleted && data.approvalStatus === 'Approved') {
              navigate('jobpost')
            } else if (data.profileCompleted && data.approvalStatus === 'Pending') {
              toast.info('you can only post job after verification is completed')
            } else if (data.profileCompleted && data.approvalStatus === 'Rejected') {
              toast.error('cannot post job...verification rejected!!!')
            } else if (data.profileCompleted === false) {
              toast.info('please completed your profile ')
            }
          }} className='md:p-2 p-1  border border-gray rounded-md text-white  bg-maincolr md:text-md font-serif'>
            <span className="md:font-bold md:text-xl "> + </span> Post a Job
          </button>
          <div></div>
          <div className="flex items-center">
            {/* <Link to='/notifications'>
              <img
                loading="lazy"
                src="https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
                className="object-contain w-8 h-7"
              />
            </Link> */}
          </div>
        </div>
      </div>
    </>
  );
}