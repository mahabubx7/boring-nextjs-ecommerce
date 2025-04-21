import expres from "express";
import {
  gameAddCoin,
  getCurrentSeason,
  getLeaderboard,
  getUserCurrentRank,
  getUserGameScore,
  guessGameGuessANumber,
} from "../controllers/gameController";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = expres.Router();

router.get("/get-leaderboard", authenticateJwt, getLeaderboard);
router.get("/get-season", authenticateJwt, getCurrentSeason);
router.get("/get-score", authenticateJwt, getUserGameScore);
router.get("/get-user-rank", authenticateJwt, getUserCurrentRank);

router.post("/add-coin", authenticateJwt, gameAddCoin);
router.post("/guess", authenticateJwt, guessGameGuessANumber);

export default router;
