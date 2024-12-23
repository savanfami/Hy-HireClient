import  { useEffect } from "react"
import { HomePageBannerSection } from './HomePageBannerSection';
// import { HomePagePopularJobSection } from './HomePageFeaturedJobSection';
import { HomePageCategorySection } from './HomePageCategorySection';
import { HomePageHyHireWork } from './HomePageHyHireWork';
import { HomePagefeaturedJobs } from './HomePagefeaturedJobs';
import { HomePageFooterImage } from './HomePageFooterImage';
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getAllData } from "../../redux/action/commonAction";
import { fetchSavedJobs } from "../../redux/action/userActions";


export const Homepage = () => {
  const dispatch: AppDispatch = useDispatch()

  const fetchAllData = async () => {
    await dispatch(getAllData()).unwrap()
  }

  const fetchSavedJob = async () => {
    await dispatch(fetchSavedJobs()).unwrap()
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    fetchSavedJob()
  }, [])   

  return (
    <div className="overflow-x-hidden">
      <HomePageBannerSection />
      {/* <HomePagePopularJobSection /> */}
      <HomePageCategorySection />
      <HomePageHyHireWork />
      <HomePagefeaturedJobs />
      <HomePageFooterImage />
    </div>

  );
};

