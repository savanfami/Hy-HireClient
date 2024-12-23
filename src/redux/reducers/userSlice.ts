import { createSlice } from "@reduxjs/toolkit";
import { errorPayload, userReducer } from "../../types/Alltypes";
import { fetchSavedJobs, getAllCompany, getUserData, googleSignup, login, logOut, signupUser, updateProfile, verifyOtp } from "../action/userActions";
import { getCompanyDataByCategory, sendRequest, updateCompany, updateSocialLinks } from "../action/companyAction";
import { getCompany } from "../action/companyAction";


const initialState: userReducer = {
    loading: false,
    user: null,
    err: false,
    role: null,
    CompanydataFetched: false,
    dataFetched: false,
    companyData: {
        totalCompanies: 0,
        totalPages: 0,        
        companies: []      
    },
    savedJobs:[]
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.err = false;
            state.user = null;
            state.savedJobs=[]
        },
        removeExperience: (state, { payload }) => {
            const output = state.user.data.experiences
            const filteredItems = output.filter((_: any, index: number) => index !== payload)
            state.user.data.experiences = filteredItems
            return state
        },
        removeEducations: (state, { payload }) => {
            const output = state.user.data.education
            const filteredItems = output.filter((_: any, index: number) => index !== payload)
            state.user.data.education = filteredItems
            return state
        },
        removeCertificates: (state, { payload }) => {
            const output = state.user.data.certificates
            const filteredItems = output.filter((_: any, index: number) => index !== payload)
            state.user.data.certificates = filteredItems
            return state
        },
        removeResumes: (state, { payload }) => {
            const output = state.user.data.resumes
            const filteredItems = output.filter((_: any, index: number) => index !== payload)
            state.user.data.resumes = filteredItems
            return state
        }


    },
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                (state.loading = true),
                    (state.err = false),
                    state.role = null,
                    (state.user = null);
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false,
                    state.err = false,
                    state.role = action.payload.role,
                    state.user = action.payload.data
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.err = (action.payload as errorPayload).message;
                } else {
                    state.err = action.error.message || "unknown error occured";
                }
                state.role = null,
                    state.user = null;
            })
            .addCase(verifyOtp.pending, (state) => {
                (state.loading = true), (state.err = false), (state.role = null);
            })
            .addCase(verifyOtp.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.user = payload;
                state.err = false;
                state.role = payload?.data.role as "user" | "company" | "admin";
            })
            .addCase(verifyOtp.rejected, (state, { payload }) => {
                (state.loading = false),
                    (state.err = (payload as errorPayload).message || "error occured"),
                    (state.role = null);
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
            })
            .addCase(login.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.user = payload;
                state.err = false;
                state.role = payload?.data.role as 'user' | 'company' | 'admin'
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.role = null
                if (action.payload) {
                    state.err = (action.payload as errorPayload).message
                } else {
                    state.err = action.error.message || "An unknown error occured";
                }
            })
            .addCase(googleSignup.pending, (state) => {
                state.loading = true,
                    state.err = false,
                    state.role = null,
                    state.user = null;
            })
            .addCase(googleSignup.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.user = payload;
                state.err = false;
                state.role = payload?.data.role as 'user' | 'company' | 'admin'
            })
            .addCase(googleSignup.rejected, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.err = (action.payload as errorPayload).message;
                } else {
                    state.err = action.error.message || "unknown error occured";
                }
                state.role = null,
                    state.user = null;
            })
            .addCase(logOut.pending, (state) => {
                state.loading = true
                state.role = null
            })
            .addCase(logOut.fulfilled, (state) => {
                state.loading = false,
                    state.user = null,
                    state.role = null,
                    state.err = false
                state.dataFetched = false
                state.CompanydataFetched = false
            })
            .addCase(logOut.rejected, (state, action) => {
                if (action.payload) {
                    state.err = (action.payload as errorPayload).message
                    state.loading = false;
                } else {
                    state.err = action.error.message || "unknown error occured"
                    state.loading = false;
                }
            })
            .addCase(updateCompany.pending, (state) => {
                state.loading = true;
                state.err = false;
            })
            .addCase(updateCompany.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.err = false;
                state.user = payload;
            })
            .addCase(updateCompany.rejected, (state) => {
                state.loading = false;
                state.err = false;
                state.user = null;
            })
            .addCase(getCompany.pending, (state) => {
                state.loading = true;
                state.err = false
            })
            .addCase(getCompany.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.err = false;
                state.user = payload
            })
            .addCase(getCompany.rejected, (state) => {
                state.loading = false;
                state.err = false;
                state.user = null
            })
            .addCase(updateSocialLinks.pending, (state) => {
                state.loading = true;
                state.err = false;
            })
            .addCase(updateSocialLinks.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.err = false;
                state.user = payload;
            })
            .addCase(updateSocialLinks.rejected, (state) => {
                state.loading = false;
                state.err = false;
                state.user = null;
            })
            .addCase(sendRequest.pending, (state) => {
                state.loading = true;
                state.err = false;
            })
            .addCase(sendRequest.fulfilled, (state) => {
                state.loading = false;
                state.err = false;
            })
            .addCase(sendRequest.rejected, (state) => {
                state.loading = false;
                state.err = false;
                state.user = null;
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.err = false;
            })
            .addCase(updateProfile.fulfilled, (state, { payload }) => {
                console.log(payload)
                state.loading = false;
                state.err = false;
                state.user = payload
            })
            .addCase(updateProfile.rejected, (state) => {
                state.loading = false;
                state.err = true
                state.user = null
            })
            .addCase(getUserData.pending, (state) => {
                state.loading = true;
                state.err = false;
                state.dataFetched = false
            })
            .addCase(getUserData.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.err = false;
                state.user = payload;
                state.dataFetched = true
            })
            .addCase(getUserData.rejected, (state, { payload }) => {
                state.loading = false;
                state.err = payload as string;
                state.user = null
                state.dataFetched = false
            })
            .addCase(getAllCompany.pending, (state) => {
                state.loading = true;
                state.err = false
                state.CompanydataFetched = false
            })
            .addCase(getAllCompany.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.err = false;
                state.companyData = payload
                state.CompanydataFetched = true
            })
            .addCase(getAllCompany.rejected, (state, { payload }) => {
                state.loading = false;
                state.err = payload as string;
                state.CompanydataFetched = false;
                state.companyData = {
                    totalCompanies: 0, 
                    totalPages: 0,
                    companies: [], 
                };
            })
            .addCase(getCompanyDataByCategory.pending,(state)=>{
                state.loading = true;
                state.err = false
            })
            .addCase(getCompanyDataByCategory.fulfilled,(state,{payload})=>{
                state.loading=false;
                state.companyData={
                    companies:payload?.data
                } as any
            })
            .addCase(getCompanyDataByCategory.rejected,(state,{payload})=>{
                state.loading=false
                state.err=payload as string
                state.companyData.companies=[]
            })
            .addCase(fetchSavedJobs.pending,(state)=>{
               state.loading=true;
               state.err=false;
            })
            .addCase(fetchSavedJobs.fulfilled,(state,{payload})=>{
                state.loading=false 
                state.err=false
                state.savedJobs=payload.data
            })
            .addCase(fetchSavedJobs.rejected,(state,{payload})=>{
                state.loading=false
                state.err = (payload as errorPayload).message
            })
    },

});

export const { removeExperience, removeEducations, removeResumes, resetState ,removeCertificates} = userSlice.actions;

export default userSlice.reducer;

