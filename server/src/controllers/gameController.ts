import { GameType } from "@prisma/client";
import { Request, Response } from "express";
import { isDate } from "util/types";
import { getCurrentWeekCode } from "../lib/week";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

/*
|--------------------------------------------------------------------------
| All the game related routes are here + requires Jwt authentication
|--------------------------------------------------------------------------
*/

// POST /api/game/guess
export const guessGameGuessANumber = async (req: Request, res: Response) => {
  // returns a random number between given values
  const { values, guess } = req.body as { values: number[]; guess: number }; // 4

  // check valid guess
  if (!Array.isArray(values) || values.length < 2 || !values.includes(guess)) {
    res.status(400).json({
      success: false,
      error: "Invalid guess",
    });

    return;
  }

  const randomIndex = Math.floor(Math.random() * values.length);
  const randomValue = values[randomIndex];

  res.status(200).json({
    success: guess === randomValue, // CORRECT / INCORRECT GUESS
  });

  return;
};

// POST /api/game/get-season?game=<str> i.e. guess_the_number
export const getCurrentSeason = async (req: Request, res: Response) => {
  // GAME: guess_the_number
  const game = (req.query.game as string) || "guess_the_number";
  const date = (req.query.date as string) || new Date();

  // make / get current code
  let code: string;
  if (isDate(new Date(date))) code = getCurrentWeekCode(new Date(date));
  else code = getCurrentWeekCode();

  res.json({ season: code });
  return;
};

// POST /api/game/add-coin?add_coin=<int>&game=<str>
export const gameAddCoin = async (req: AuthenticatedRequest, res: Response) => {
  const usr = req.user?.email;
  const week = getCurrentWeekCode();

  const { coin, game } = req.body as { coin: string; game: string };
  const _coin = parseInt(coin);
  if (!usr || isNaN(_coin) || !["guess_the_game"].includes(game)) {
    res.status(400).json({
      success: false,
      error: "Invalid values",
    });

    return;
  }

  // check if user exists
  const user = await prisma.user.findUnique({ where: { email: usr } });
  if (!user) {
    res.status(404).json({
      success: false,
      error: "User not found",
    });

    return;
  }

  try {
    // add coin to user, uses upsert
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          gameCoin: { increment: _coin },
        },
      }),
      prisma.gameSeason.upsert({
        where: { userId_week: { userId: user.id, week } },
        update: {
          score: { increment: _coin },
        },
        create: {
          userId: user.id,
          week,
          score: _coin,
        },
      }),
    ]);

    res.json({ status: true });
    return;
  } catch (err: unknown) {
    res
      .status(400)
      .json({ error: (err as Error).message || (err as Error).stack });
    return;
  }
};

// GET /api/game/guess/leaderboard?season=<str>&limit=<int>&page=<int>
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { season = getCurrentWeekCode(), limit = 10, page = 1 } = req.query;

    if (!season || typeof season !== "string") {
      res.status(400).json({ error: "Missing or invalid season parameter." });
      return;
    }

    const take = +Number(limit);
    const skip = (+Number(page) - 1) * take;

    const [leaderboard, totalCount] = await Promise.all([
      prisma.gameSeason.findMany({
        where: { week: season },
        orderBy: { score: "desc" },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              gameCoin: true,
              email: true,
            },
          },
        },
      }),

      prisma.gameSeason.count({
        where: { week: season },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json({
      payload: leaderboard,
      pagination: {
        total: totalCount,
        page: +Number(page),
        totalPages,
        limit: take,
      },
    });
    return;
  } catch (err) {
    //   console.error('[getLeaderboard]', err);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

// GET /api/game/get-score
export const getUserGameScore = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const id = req.user?.userId;
  const season = (req.query.season as string) || getCurrentWeekCode();
  const game = (req.query.game as string) || "guess_the_game";

  if (!id) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
    return;
  }

  // get user game score based on game and season
  const gameScore = await prisma.gameSeason.findFirst({
    where: {
      userId: user.id,
      week: season,
    },
  });

  if (!gameScore) {
    res.status(204).json({
      success: false,
      error: "Game score not found",
      details: {
        userId: user.id,
        week: season,
        game,
        season,
      },
    });
    return;
  }

  res.json({
    success: true,
    total: user.gameCoin,
    score: gameScore?.score,
  });
  return;
};

// GET /api/game/get-user-rank
export const getUserCurrentRank = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const id = req.user?.userId;
  const season = (req.query.season as string) || getCurrentWeekCode();
  const game = (req.query.game as GameType) || ("GUESS_THE_NUMBER" as GameType);

  if (!id) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
    return;
  }

  // get user game score based on game and season
  const gameScore = await prisma.gameSeason.findFirst({
    where: {
      userId: user.id,
      week: season,
    },
  });

  if (!gameScore) {
    res.status(204).json({
      success: false,
      error: "Game score not found",
      details: {
        userId: user.id,
        week: season,
        game,
        season,
      },
    });
    return;
  }

  // get rank of the user
  const rank = await prisma.gameSeason.count({
    where: {
      week: season,
      game,
      score: {
        gt: gameScore.score,
      },
    },
  });

  res.json({
    success: true,
    rank: rank + 1, // rank starts from 1
  });
  return;
};
