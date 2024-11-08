import { createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { URL } from "../../common/axiosInstance";
import { config } from "../../common/configurations";
import { FormDatas, SocialLinks } from "../../types/Alltypes";
import { handleAxiosError } from "../../utils/customError";
import { IUpdateApplicationStatusPayload, IUpdateApplicationStatusResponse } from "../../types/companyTypes";



export const updateCompany = createAsyncThunk<FormDatas, FormDatas>(
  "company/profile",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${URL}/company/overview`, userData, config);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data)
      }
    }
  }
);


export const getCompany = createAsyncThunk(
  'company/get-data',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${URL}/company`, { withCredentials: true })
      return data
    } catch (error) {
      console.log(error)
      return rejectWithValue(error)
    }
  }
)


export const updateSocialLinks = createAsyncThunk<SocialLinks, SocialLinks>(
  'company/update-social-Links',
  async (datas, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${URL}/company/social-links`, datas, config)
      return data
    } catch (error) {
      console.log(error)
      return rejectWithValue(error)
    }
  }
)


export const sendRequest = createAsyncThunk(
  'company/send-request',
  async (_, { rejectWithValue }) => {
    try {

      const data = await axios.post(`${URL}/company/company-request`, {}, config)
      console.log(data)
      return data

    } catch (error: any) {
      console.log(error)
      return rejectWithValue(error)
    }
  }
)



export const getCompanyDataByCategory = createAsyncThunk(
  'company/getcompanycategory-data',
  async (id:string, { rejectWithValue }) => {
    try {
      const {data}=await axios.get(`${URL}/company/getcompanydata/`,{
        params:{
            name:id
        }
    })
    return {data}
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)


export const updateApplicationStatus=createAsyncThunk<IUpdateApplicationStatusResponse,IUpdateApplicationStatusPayload>(
  'company/updatestatus',
  async(payload,{rejectWithValue})=>{
    try {
       const {data} = await axios.put(`${URL}/job/update-status`, payload,config)
       return data
    } catch (error) {
       return rejectWithValue(handleAxiosError(error))
    }
  }
)