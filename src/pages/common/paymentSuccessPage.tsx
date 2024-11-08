import { useEffect } from "react";
import AOS from "aos";
import Animation from "../../assets/lottieFiles/Animation - 1729876441216.json";
import Lottie from "lottie-react";

import "aos/dist/aos.css";
import { Link } from "react-router-dom";

export const PaymentSuccessPage: React.FC = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-lg p-6 md:p-12">
          {/* Left Side - Text Content */}
          <div
            className="md:w-1/2 mb-8 md:mb-0"
            data-aos="fade-right"
            data-aos-offset="200"
            data-aos-easing="ease-in-sine"
            data-aos-duration="600"
          >
            <h2 className="text-3xl font-bold text-darkBlue mb-4">
              Welcome to HyHire Premium!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Congratulations on becoming a premium user. Now you can enjoy
              exclusive benefits like the ability to message companies directly 
              . Make the most out of your premium experience!!
            </p>
            <div className="flex space-x-2">
  <Link to="/">
    <button className="p-3 bg-blue-500 text-white rounded-md">
      Back to Home
    </button>
  </Link>
  <Link to="/companyListing">
    <button className="p-3 bg-blue-500 text-white rounded-md">
      Start Messaging
    </button>
  </Link>
</div>
          </div>

          {/* Right Side - Animation */}
          <div
            className="md:w-1/2 flex justify-center"
            data-aos="fade-left"
            data-aos-offset="200"
            data-aos-easing="ease-in-sine"
            data-aos-duration="600"
          >
            <Lottie
              animationData={Animation}
              style={{ width: 300, height: 300 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
