import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { teamsRouter } from './routes/teams';
import { playersRouter } from './routes/players';
import { groupsRouter } from './routes/groups';
import { matchesRouter } from './routes/matches';
import { goalsRouter } from './routes/goals';
import { standingsRouter } from './routes/standings';
import { announcementsRouter } from './routes/announcements';
import { exportRouter } from './routes/export';
import { drawRouter } from './routes/draw';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/standings', standingsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/export', exportRouter);
app.use('/api/draw', drawRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 