import { AxiosRequestConfig } from "axios";
import { FormikValues } from "formik";
import { ReactNode } from "react";
import {  IPaginatedCompaniesResponse } from "./userTypes";

export interface formValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type userReducer = {
  loading: boolean;
  err: boolean | string
  role: "user" | "admin" | "company" | null | string
  user: null | any;
  dataFetched?:boolean
  companyData:IPaginatedCompaniesResponse
  CompanydataFetched:boolean;
  savedJobs:any
};





export type erroPayload = {
  message: string;
};


export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type commonRequest = {
  method: HTTPMethod;
  route: string;
  body?: any;
  config: AxiosRequestConfig

}

export type errorPayload = {
  message: string
  statusCode?:number
}



export type verifyOtpPayload = {
  otp: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'company' | 'admin'
}

export type verifyOtpResponse = {
  name(arg0: string, name: any): unknown;
  role: 'user' | 'company' | 'admin'
  success: boolean;
  message: string
  data: UserDetails
}

export type UserDetails = {
  name: string;
  email: string;
  role: 'user' | 'company' | 'admin'
}

export type verifyOtpError = {
  message: string
}


export type loginResponse = {
  data: UserDetails;
  role: 'user' | 'company' | 'admin'

}


export interface loginPayload extends FormikValues {
  email: string;
  password: string
}


export interface Children {
  children: ReactNode;
}


export interface GoogleCredential {
  credentials: any;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleSignupData extends GoogleCredential {
  role: string;
}

export interface GoogleSignupResponse {
  data?: any;
  email: string;
  password?: string;
  name: string;
  role: string;
  message: string
}

export interface GoogleSignupAction {
  (userData: GoogleSignupData): Promise<GoogleSignupResponse>;
}


export interface FormDatas {
  message?: string
  name: string;
  website: string;
  location: string;
  foundedDate: string;
  sector: string;
  subIndustry: string;
  companyDescription: string;
  profileCompleted?:boolean
}

export interface SocialLinks{
  message?: string;
  instagram:string;
  facebook:string;
  linkedin:string;
  twitter:string
}


