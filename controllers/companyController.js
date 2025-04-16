import { verifyToken } from "../helper/authHelper.js";
import Company from "../models/companyModel.js";
import Job from "../models/jobModel.js";
import Application from "../models/applicationModel.js";
import User from "../models/userModel.js";
import JobSeekerDetails from "../models/jobSeekerModel.js";
import Job_filter from "../models/JobFilterModel.js";

export const updateCompany = async (req, res) => {
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
      return res.status(401).json({message: "Unauthorized Token"});
    }
    const decode = verifyToken(token);
    if(!decode){
      return res.status(401).json({message: "Token Invalid"});
    }
    const company_id = decode.id;
    const { phone, location, website, industry, description,established_year} = req.body;
    const company = await Company.findOne({company_id});
    if(!company){
      return res.status(400).json({message: "Company not found"});
    }
    if(phone) company.phone = phone;
    if(location) company.location = location;
    if(website) company.website = website;
    if(industry) company.industry = industry;
    if(description) company.description = description;
    if(established_year) company.established_year = established_year;

    const updateCompany = await company.save();
    res.status(200).json({
      message: "Company updated Successfully",
      updateCompany,
    })
  }catch(error){
    console.error("Updated Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
    
  }
}


export const getCompanyJobs = async (req, res) => {
  try {
    // 1. Extract token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    // 2. Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // 3. Check if user is a company
    if (decoded.user_type !== 2) {
      return res.status(403).json({ message: "Forbidden: Only companies can view their jobs" });
    }

    // 4. Fetch jobs where companyId matches the token's user id
    const jobs = await Job.find({ companyId: decoded.id });

    return res.status(200).json({ jobs });

  } catch (error) {
    console.error("Get Company Jobs Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


export const getJobApplicants = async (req, res) => {
  try {
    // 1. Extract token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.user_type !== 2) {
      return res.status(403).json({ message: "Forbidden: Only companies can view applicants" });
    }

    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    // 2. Check if this job belongs to the company
    const job = await Job.findOne({ _id: jobId, companyId: decoded.id });
    if (!job) {
      return res.status(404).json({ message: "Job not found or access denied" });
    }

    // 3. Find all applications for this job and populate job seeker info
    const applications = await Application.find({ jobId })
      .populate({
        path: "jobSeekerId",
        populate: {
          path: "jobseeker_id",
          model: "User", // Get user-level info
          select: "name email phoneno"
        }
      });

    return res.status(200).json({ applicants: applications });

  } catch (error) {
    console.error("Get Job Applicants Error:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};


// controllers/jobFilterController.js



export const getAllJobsFilter = async (req, res) => {
    try {
        const jobs = await Job_filter.find(); // Fetch all, newest first
        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch jobs",
            error: error.message
        });
    }
};
