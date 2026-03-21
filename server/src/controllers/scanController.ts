import { Request, Response } from 'express';
import Scan from '../models/Scan';
import Profile from '../models/Profile'; // 🚨 Profile model import karein
import mongoose from 'mongoose';

// 1. START SCAN (Updated with Profile Generation)
export const startScan = async (req: Request, res: Response) => {
    const { target, scanType } = req.body;
    if (!target) return res.status(400).json({ success: false, message: "Target required" });

    try {
        const leaksFound = Math.floor(Math.random() * 15);
        const activeProfilesCount = Math.floor(Math.random() * 8) + 2;
        let riskScore = 15 + (leaksFound * 5) + (activeProfilesCount * 2);
        if (riskScore > 100) riskScore = 98;

        const initialLogs = [
            { time: new Date().toLocaleTimeString(), type: 'OK', message: 'Handshake successful. Proxy tunnel active.' },
            { time: new Date().toLocaleTimeString(), type: 'INFO', message: `Initializing OSINT modules for: ${target}` },
            { time: new Date().toLocaleTimeString(), type: 'INFO', message: 'Scanning COMB databases and public repositories...' },
            { time: new Date().toLocaleTimeString(), type: 'WARN', message: 'Suspicious metadata detected in social nodes.' },
            { time: new Date().toLocaleTimeString(), type: 'INFO', message: 'Filtering digital footprints...' }
        ];

        const newScan = new Scan({
            target,
            scanType: scanType || 'Standard',
            riskScore,
            leaksFound,
            activeProfiles: activeProfilesCount,
            status: 'Processing',
            logs: initialLogs,
            performedBy: (req as any).user?.id || null 
        });

        await newScan.save();

        // 🚨 REALISM SIMULATION: 8 second delay logic
        setTimeout(async () => {
            // 1. Generate Fake Profiles for this target
            const platforms = ['Instagram', 'GitHub', 'LinkedIn', 'Twitter', 'Facebook', 'Reddit'];
            const mockProfiles = [];

            for (let i = 0; i < activeProfilesCount; i++) {
                const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
                mockProfiles.push({
                    scanId: newScan._id,
                    platform: randomPlatform,
                    username: target.split('@')[0] + (Math.floor(Math.random() * 99)),
                    url: `https://${randomPlatform.toLowerCase()}.com/${target.split('@')[0]}`,
                    status: Math.random() > 0.7 ? 'Private' : 'Found'
                });
            }

            // 2. Save profiles to database
            await Profile.insertMany(mockProfiles);

            // 3. Update Scan status and final log
            await Scan.findByIdAndUpdate(newScan._id, { 
                status: 'Completed',
                $push: { 
                    logs: { 
                        time: new Date().toLocaleTimeString(), 
                        type: 'OK', 
                        message: `Forensic data for ${activeProfilesCount} nodes stored in vault.` 
                    } 
                }
            });

            console.log(`Scan ${newScan._id} fully finalized with profiles.`);
        }, 8000); 

        res.status(201).json({ success: true, data: newScan });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Engine Error", error: error.message });
    }
};

// 2. GET SCAN DETAILS & PROFILES
export const getScanStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Handshake ID" });
        }

        const scan = await Scan.findById(id);
        if (!scan) return res.status(404).json({ success: false, message: "Scan not found" });

        // 🚨 Profiles bhi fetch karein jo is Scan se jude hain
        const profiles = await Profile.find({ scanId: id });

        res.status(200).json({ 
            success: true, 
            data: scan,
            profiles: profiles // Frontend results page par use karne ke liye
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Internal Vault Access Failure" });
    }
};

// 3. GET HISTORY (No changes)
export const getScanHistory = async (req: Request, res: Response) => {
    try {
        const scans = await Scan.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, count: scans.length, data: scans });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "History retrieval failed" });
    }
};

// 4. DELETE SCAN (Deletes linked profiles too)
export const deleteScan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }

        await Scan.findByIdAndDelete(id);
        // 🚨 Linked profiles ko bhi delete karein taaki DB saaf rahe
        await Profile.deleteMany({ scanId: id });

        res.status(200).json({ success: true, message: "All forensic data purged." });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Deletion failed" });
    }
};