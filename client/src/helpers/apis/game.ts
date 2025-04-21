import { getAxiosInstance } from "@/lib/axios";
import { gameCommons, games } from "@/utils/config";

export class GameAPI {
  constructor(private axiosInstance: ReturnType<typeof getAxiosInstance>) {}

  // Fetch Leaderboard data
  async getLeaderboard(season: string, page: number = 1, take: number = 10) {
    try {
      const response = await this.axiosInstance.get(
        gameCommons.getLeaderBoard,
        {
          params: { page, take, season },
        }
      );
      return response.data as LeaderboardApiReturn;
    } catch (error) {
      console.error("[getLeaderboard]", error);
      return { success: false };
    }
  }

  // Fetch User's Game Score (Total Game Coins)
  async getUserGameScore() {
    try {
      const response = await this.axiosInstance.get(gameCommons.getUserScore);
      return response.data as {
        success: boolean;
        score: number;
      };
    } catch (error) {
      console.error("[getUserGameScore]", error);
      return { success: false };
    }
  }

  // Fetch current season code
  async fetchSeasonCode() {
    try {
      const res = await this.axiosInstance(gameCommons.getCurrentSeason);
      return res.data as { season: string };
    } catch (err) {
      console.error("[fetchSeasonCode]", err);
      return { success: false };
    }
  }

  // Post guess & get result
  async guessChecker(values: number[], guess: number) {
    try {
      const response = await this.axiosInstance.post(
        games.guessGame.apis.guessChecker,
        {
          values,
          guess,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data as { success: boolean };
    } catch (error) {
      console.error("[guessChecker]", error);
      return { success: false };
    }
  }

  // Post add game coin
  async addGameCoin(coin: string, game: string = "guess_the_game") {
    try {
      const response = await this.axiosInstance.post(
        games.guessGame.apis.addScore,
        {
          coin,
          game,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data as { status: boolean };
    } catch (error) {
      console.error("[addGameCoin]", error);
      return { status: false };
    }
  }

  // Get User's Rank
  async getUserRank(season: string, game: string = "GUESS_THE_NUMBER") {
    try {
      const response = await this.axiosInstance.get(gameCommons.getUserRank, {
        params: { season, game },
      });
      return response.data as {
        rank: number;
        success: boolean;
      };
    } catch (error) {
      console.error("[getUserRank]", error);
      return { success: false };
    }
  }
}

export type LeaderboardApiReturn = {
  payload: {
    user: {
      name: string;
      email: string;
      gameCoin: number;
    };
  }[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
} | null;
