import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Announcement } from '../types';
import { announcements } from '../data/announcements.json';

const router = express.Router();
const dataPath = path.join(__dirname, '../data/announcements.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all announcements
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.announcements);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני ההודעות' });
  }
});

// Get announcement by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const announcement = data.announcements.find((a: any) => a.id === req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'הודעה לא נמצאה' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני ההודעה' });
  }
});

// Create new announcement
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newAnnouncement = {
      id: uuidv4(),
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.announcements.push(newAnnouncement);
    writeData(data);
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת הודעה חדשה' });
  }
});

// Update announcement
router.put('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.announcements.findIndex((a: any) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'הודעה לא נמצאה' });
    }
    data.announcements[index] = {
      ...data.announcements[index],
      title: req.body.title,
      content: req.body.content,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.announcements[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון ההודעה' });
  }
});

// Delete announcement
router.delete('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.announcements.findIndex((a: any) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'הודעה לא נמצאה' });
    }
    data.announcements.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת ההודעה' });
  }
});

export { router as announcementsRouter }; 