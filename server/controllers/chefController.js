const { v4: uuidv4 } = require('uuid');
const express = require('express');
const chefService = require('../services/chefService');
const genericService = require('../services/genericService');
const mailManager = require('./emailHandler');

exports.getAllChefs = async () => {
    const result = await chefService.getAllChefs();
    if (result) {
        return result;
    } else {
        throw new Error('Failed to retrieve chefs');
    }
}
exports.getChef = async (chefId) => {
    const result = await chefService.getChef(chefId);
    if (result) {
        return result;
    } else {
        throw new Error('Failed to retrieve chef');
    }
}
exports.joinReq = async (chefId, imageURL, education, experienceYears, style, additionalInfo) => {
    try {
        if (!chefId || !education || !experienceYears || !style) {
            throw new Error("All fields are required: chefId, education, experienceYears, style");
        }

        if (isNaN(experienceYears) || experienceYears < 0) {
            throw new Error('Please enter a valid number of experience years');
        }
        const userData = await genericService.genericGetByColumnName('users', chefId, 'userId');
        const guid = uuidv4();
        mailManager.joinReq({
            guid,
            name: userData.userName,
            email: userData.email,
            imageURL,
            education,
            experienceYears,
            style,
            additionalInfo
        });
        const data = {
            guid,
            chef_id: chefId,
            name: userData.userName,
            imageURL: imageURL || null,
            email: userData.email,
            education: education || null,
            experience_years: experienceYears || null,
            style: style || null
        };
        const result = await genericService.genericPost("pendingChefRequests", data, "chef_id");
        return result;
    } catch (error) {
        throw new Error('There was an error submitting your application. Please try again.');
    }
}
exports.approveReq = async (guid) => {
    try {
        const request = await genericService.genericGetByColumnName('pendingChefRequests', guid, 'guid');
        if (!request) {
            throw new Error('Request not found');
        }
        const chefData = {
            chefId: request.chef_id,
            imageURL: request.imageURL,
            education: request.education,
            experienceYears: request.experience_years,
            style: request.style
        };
        const newChef = await chefService.addChef(chefData);
        if (newChef) {
            mailManager.approveReq({
                name: request.name,
                email: request.email
            });
            await genericService.genericDelete('pendingChefRequests', guid, 'guid');
            return (`
    <html>
      <head><title>Chef Approved</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <div style="max-width: 400px; margin: 0 auto; padding: 30px; border: 2px solid #4CAF50; border-radius: 10px; background: #f9f9f9;">
          <h1 style="color: #4CAF50;">✅ Success!</h1>
          <p>Chef has been approved successfully.</p>
          <button onclick="window.close()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Close
          </button>
        </div>
      </body>
    </html>
  `);
        } else {
            throw new Error('Failed to approve chef');
        }
    } catch (error) {
        throw new Error('There was an error approving the chef. Please try again.');
    }
}
exports.rejectReq = async (guid, reason = null) => {
    try {
        const request = await genericService.genericGetByColumnName('pendingChefRequests', guid, 'guid');
        console.log(request);
        
        if (!request) {
            throw new Error('Request not found');
        }


        try {
            await mailManager.rejectReq({
                name: request.name,
                email: request.email,
                reason: reason || 'No specific reason provided'
            });
        } catch (mailErr) {
            console.error("✉️ Failed to send rejection email:", mailErr);
            throw new Error("Failed to process rejection.");
        }

        await genericService.genericDelete('pendingChefRequests', guid, 'guid');
        return (`
    <html>
      <head><title>Chef Rejected</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <div style="max-width: 400px; margin: 0 auto; padding: 30px; border: 2px solid #f44336; border-radius: 10px; background: #f9f9f9;">
          <h1 style="color: #f44336;">❌ Rejected</h1>
          <p>Chef request has been rejected.</p>
          <button onclick="window.close()" style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Close
          </button>
        </div>
      </body>
    </html>
  `);
    } catch (error) {
        console.log(error);
        throw new Error('There was an error rejecting the chef request. Please try again.');
    }
}
exports.getFeaturedChefs = async () => {
    const result = await chefService.getFeaturedChefs();
    if (result) {
        return result;
    } else {
        throw new Error('Failed to retrieve chefs');
    }
}