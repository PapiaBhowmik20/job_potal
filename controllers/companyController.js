import { verifyToken } from "../helper/authHelper.js";
import Company from "../models/companyModel.js";

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
 