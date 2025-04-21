import axios from "axios";
import { randomBytes } from "node:crypto";
import qStr from "querystring";

/*
|=======================================================
| Auth.ts: 
|-------------------------------------------------------
| A custom library for authentication and authorization
| using OAuth services i.e. Google.
|=======================================================
*/

/*=== Google OAuth 2.0 ===*/
export class GoogleAuthProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  // constants
  private GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  private GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
  //   private GOOGLE_USER_INFO_URL =
  //     "https://www.googleapis.com/oauth2/v3/userinfo";
  private GOOGLE_USER_INFO_URL =
    "https://openidconnect.googleapis.com/v1/userinfo";
  private GOOGLE_SCOPES = "openid email profile";

  constructor(gid: string, gSecret: string, redirectUri: string) {
    this.clientId = gid;
    this.clientSecret = gSecret;
    this.redirectUri = redirectUri;
  }

  /// Generate state hash key
  private generateReqSessionId(len: number = 36) {
    return randomBytes(len).toString("base64url");
  }

  /// Generate the authorization URL
  public generateAuthUrl() {
    const state = this.generateReqSessionId();
    // const url = `${this.GOOGLE_AUTH_URL}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=email&access_type=offline&state=${state}`;
    const url = `${this.GOOGLE_AUTH_URL}?response_type=code&client_id=${
      this.clientId
    }&redirect_uri=${this.redirectUri}&scope=${encodeURIComponent(
      this.GOOGLE_SCOPES
    )}&access_type=offline&state=${state}`;

    return {
      url,
      state_key: state,
    };
  }

  /// Exchange the authorization code for an access token
  async exchangeCodeForToken(
    code: string,
    grant_type: string = "authorization_code"
  ) {
    try {
      const tokenResponse = await axios.post(
        this.GOOGLE_TOKEN_URL,
        qStr.stringify({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      return tokenResponse.data.access_token as string;
    } catch (err: any) {
      throw new Error(err.message || "Failed to exchange code for token");
    }
  }

  /// Fetch user information using the access token and scope
  async fetchUserInfo(accessToken: string, scope: string = this.GOOGLE_SCOPES) {
    try {
      const userInfoResponse = await axios.get(this.GOOGLE_USER_INFO_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          scope,
        },
      });
      console.log("User Info from GOOGLE: ", userInfoResponse.data);
      console.log("User req --> scope : ", scope, userInfoResponse.config);
      console.log("User res --> :", userInfoResponse.data);
      return userInfoResponse.data;
    } catch (err: any) {
      throw new Error(err.message || "Failed to fetch user info");
    }
  }
}
