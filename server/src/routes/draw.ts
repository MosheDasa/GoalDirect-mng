import express from 'express';

const router = express.Router();

// Get draw status
router.get('/', (req, res) => {
  try {
    // TODO: Implement draw logic
    res.json({ message: 'Draw functionality to be implemented' });
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני ההגרלה' });
  }
});

export { router as drawRouter }; 