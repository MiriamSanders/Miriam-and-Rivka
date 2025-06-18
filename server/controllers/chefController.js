const { v4: uuidv4 } = require('uuid');
const express = require('express');
const chefService = require('../services/chefService');
const genericService = require('../services/genericService');
const mailManager = require('../middleware/aproveChef');



exports.getAllChefs = async (req, res) => {
    const result = await chefService.getAllChefs();
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Failed to retrieve chefs' });
    }
}
exports.getChef = async (req, res) => {
   const chefId = req.params.chefId;
    const result = await chefService.getChef(chefId);
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Failed to retrieve chefs' });
    }
}

exports.joinReq = async (req, res) => {
    const { chefId, imageURL, education, experienceYears, style, additionalInfo } = req.body;
    console.log(req.body);

    if (!chefId || !education || !experienceYears || !style) {
        return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    if (isNaN(experienceYears) || experienceYears < 0) {
        return res.status(400).json({ error: 'Please enter a valid number of experience years' });
    }

    try {
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
        res.status(200).json({ message: 'Your chef application has been submitted successfully!' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'There was an error submitting your application. Please try again.' });
    }
}
exports.approveReq = async (req, res) => {
    const guid = req.params.guid;
    try {
        const request = await genericService.genericGetByColumnName('pendingChefRequests', guid, 'guid');
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
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
            // In your routes


            res.send(`
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
            res.status(500).json({ error: 'Failed to approve chef' });
        }
    } catch (error) {
        console.error('Error approving chef:', error);
        res.status(500).json({ error: 'There was an error approving the chef. Please try again.' });
    }
}
exports.rejectReq = async (req, res) => {
    const guid = req.params.guid;
    try {
        const request = await genericService.genericGetByColumnName('pendingChefRequests', guid, 'guid');
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        mailManager.rejectReq({
            name: request.name,
            email: request.email,
            reason: req.body.reason || 'No specific reason provided'
        });

        await genericService.genericDelete('pendingChefRequests', guid, 'guid');
        res.send(`
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
        console.error('Error rejecting chef request:', error);
        res.status(500).json({ error: 'There was an error rejecting the chef request. Please try again.' });
    }
}
exports.getFeaturedChefs=async(req,res)=>{
    const result = await chefService.getFeaturedChefs();
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(500).json({ error: 'Failed to retrieve chefs' });
    } 
}