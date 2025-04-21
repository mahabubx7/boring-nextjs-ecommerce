import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { GoogleAuthProvider } from "../lib/auth";
import { prisma } from "../server";

type GoogleOAuthState = {
  client_redirect_uri: string;
  expiry: Date;
};

type GoogleOAuthUserData = {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  expiry: Date;
};

// in-memory store for OAuth states mapping
const oauthStates: Map<string, GoogleOAuthState> = new Map();
const oauthUserStates: Map<string, GoogleOAuthUserData> = new Map();

function removeExpiredStores(store: Map<string, Record<string, any>>) {
  const now = new Date();
  store.forEach((state, key) => {
    if (state.expiry < now) {
      oauthStates.delete(key);
    }
  });
}

function generateToken(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "60m" }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

async function setTokens(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 60 * 60 * 1000 * 24, // 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 60 * 60 * 1000 * 24 * 7, // 7 days
  });

  return res;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email exists!",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const extractCurrentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !extractCurrentUser ||
      !(await bcrypt.compare(password, extractCurrentUser.password))
    ) {
      res.status(401).json({
        success: false,
        error: "Invalied credentials",
      });

      return;
    }

    //check if the user authProvider is credentials or not
    if (extractCurrentUser.authProvider !== "CREDENTIALS") {
      res.status(401).json({
        success: false,
        error: "Invalid channel of authentication for this user. Try others.",
      });
      return;
    }

    //create our access and refreshtoken
    const { accessToken, refreshToken } = generateToken(
      extractCurrentUser.id,
      extractCurrentUser.email,
      extractCurrentUser.role
    );

    //set out tokens
    await setTokens(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successfully",
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: extractCurrentUser.id,
        name: extractCurrentUser.name,
        email: extractCurrentUser.email,
        role: extractCurrentUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const whoAmI = async (req: Request, res: Response): Promise<void> => {
  const accessToken =
    req.cookies.accessToken ||
    req.cookies.auth_token ||
    (req.headers["Authorization"] as string).split(" ")[1];

  if (!accessToken) {
    res.status(401).json({
      success: false,
      error: "Invalid access token",
    });
    return;
  }

  try {
    const decoded: any = jwt.verify(accessToken, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gameCoin: true,
        authProvider: true,
        gameSeasons: true,
        gameAchievements: true,
        avaterUrl: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid access token" });
  }

  return;
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = (req.cookies.refreshToken ||
    req.cookies.auth_rf_token ||
    req.headers["x-refresh-token"]) as string;
  if (!refreshToken || refreshToken.length === 0) {
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user.id,
      user.email,
      user.role
    );
    //set out tokens
    await setTokens(res, accessToken, newRefreshToken);
    res.status(200).json({
      success: true,
      message: "Refresh token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Refresh token error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "User logged out successfully",
  });
};

export const googleSignIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.query.redirect_uri) {
    res.status(400).json({
      success: false,
      error: "Missing the 'redirect_uri'",
    });

    return;
  }

  const google = new GoogleAuthProvider(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  const { url, state_key } = google.generateAuthUrl();
  console.info("Google Auth URL: ", url);
  // make & save oauth state
  const expiry = new Date().getTime() + 60 * 15 * 1000; // 15 minutes
  oauthStates.set(state_key, {
    client_redirect_uri: req.query.redirect_uri as string,
    expiry: new Date(expiry),
  });

  // redirect to google auth page
  res.redirect(url);
  return;
};

export const googleSignInCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).json({
      success: false,
      error: "Missing 'code' or 'state'",
    });

    return;
  }

  // check if state exists
  removeExpiredStores(oauthStates); // <-- remove expired states first
  const oauthState = oauthStates.get(state as string);
  if (!oauthState) {
    res.status(400).json({
      success: false,
      error: "Invalid state",
    });

    return;
  }

  // console.info("Google OAuth State: ", oauthState);

  // exchange code for token
  const google = new GoogleAuthProvider(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  const accessToken = await google.exchangeCodeForToken(code as string);

  // get user info
  const userInfo = await google.fetchUserInfo(accessToken);

  // check if user exists
  let user = await prisma.user.findUnique({
    where: { email: userInfo.email as string },
  });

  if (user && user.authProvider !== "GOOGLE") {
    res.status(400).json({
      success: false,
      error: "Invalid channel of authentication for this user. Try others.",
    });

    return;
  }

  if (!user) {
    // then create one
    user = await prisma.user.create({
      data: {
        name: (userInfo.name || userInfo.given_name) as string,
        email: userInfo.email as string,
        avaterUrl: userInfo.picture as string,
        password: "",
        role: "USER",
        authProvider: "GOOGLE",
      },
    });
  }

  // console.info("User => ", user);

  // create our access and refreshtoken
  const { accessToken: newAccessToken, refreshToken } = generateToken(
    user.id,
    user.email,
    user.role
  );

  // save user & token in map
  removeExpiredStores(oauthUserStates); // <-- remove expired states first
  const expiry = new Date().getTime() + 60 * 15 * 1000; // 10 minutes
  oauthUserStates.set(user.id, {
    user,
    tokens: {
      accessToken: newAccessToken,
      refreshToken,
    },
    expiry: new Date(expiry),
  });

  // redirect to client app
  const redirectUri = `${oauthState.client_redirect_uri}?success=true&ouid=${user.id}`;
  res.redirect(redirectUri);
  return;
};

export const getOAuthUserData = async (req: Request, res: Response) => {
  const userId = req.query.ouid as string;
  const oauthUserData = oauthUserStates.get(userId);

  if (!oauthUserData) {
    res.status(400).json({
      success: false,
      error: "Invalid or expired user data ID",
    });

    return;
  }

  // set the tokens & return response
  const { accessToken, refreshToken } = oauthUserData.tokens;
  await setTokens(res, accessToken, refreshToken);
  res.status(200).json({
    success: true,
    user: oauthUserData.user,
    tokens: oauthUserData.tokens,
  });
  return;
};
