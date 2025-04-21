import { randomBytes } from "node:crypto";

export type SSLCommercezPaymentGatewayConfig = {
  storeId: string;
  storePassword: string;
  isLive?: boolean;
};

export class SSLCommercezPaymentGateway {
  /*
    |================================================================
    | SSLCommercez Payment Gateway
    | @note: Finally doing it myself after watching horrible
    |        node.js / typescript or js based libraries or 
    |        npm packages.
    | @runtime: Node.js runtime friendly (recommended Node.js v18+)
    |================================================================
    */

  private storeId: string;
  private storePassword: string;
  private isLive: boolean;
  private baseUrl: string;
  private initUrl: string;
  private validationUrl: string;
  private trxUrl: string; // uses for refund and transaction validations

  constructor(config: SSLCommercezPaymentGatewayConfig) {
    /*------------------------------------*
     * Constructor
     *-------------------------------------*/

    this.storeId = config.storeId;
    this.storePassword = config.storePassword;
    this.isLive = config.isLive || false;

    /// dependent on config values
    this.baseUrl = `https://${
      this.isLive ? "securepay" : "sandbox"
    }.sslcommerz.com`;

    this.initUrl = this.baseUrl + "/gwprocess/v4/api.php";

    this.validationUrl =
      this.baseUrl + "/validator/api/validationserverAPI.php?";

    this.trxUrl =
      this.baseUrl + "/validator/api/merchantTransIDvalidationAPI.php?";
  }

  // :> Generates unique transaction ID
  static generateTrxId(
    len: number = 8,
    encoding: "hex" | "base64" | "base64url" = "hex",
    prefix: string = "TRX_",
    transform: {
      toUppercase?: boolean;
      toLowercase?: boolean;
    } = {}
  ): string {
    const timestamp = Date.now().toString(7);
    const trxId = prefix + randomBytes(len).toString(encoding) + timestamp;
    const { toUppercase, toLowercase } = transform;
    if (toUppercase) return trxId.toUpperCase();
    else if (toLowercase) return trxId.toLowerCase();
    else return trxId; // default
  }

  // :> Initiate payment
  async init(data: any, url: string | null = null, method: string = "POST") {
    const composeData = {
      ...data,
      store_id: this.storeId,
      store_passwd: this.storePassword,
    };

    try {
      return await this.httpCall(url || this.initUrl, method, composeData);
    } catch (error: any) {
      console.error("[SSLCommercez] Payment Gateway Error:", error);
      throw new Error(
        `[SSLCommercez] Payment Gateway Error: ${error.message || error}`
      );
    }
  }

  // :> Http request handler
  private async httpCall<T = any>(
    url: string,
    method: string = "POST",
    data: any = {},
    headers: any = {}
  ): Promise<T> {
    const response = await fetch(url, {
      method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      redirect: "follow",
      referrer: "no-referrer",
      ...(["POST", "PUT", "PATCH", "UPDATE"].includes(method)
        ? {
            body: JSON.stringify(data),
          }
        : {}),
      headers: {
        ...headers,
        "Content-Type": "application/www-form-urlencoded", // Sending data as form-urlencoded
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export type SSLCommercezCustomerData = {
  cus_name: string; // customer name
  cus_email: string; // customer email
  cus_phone: string; // customer phone

  cus_add1?: string; // customer address line 1
  cus_add2?: string; // customer address line 2
  cus_city?: string; // customer city
  cus_state?: string; // customer state
  cus_postcode?: string; // customer postcode
  cus_country?: string; // customer country

  cus_fax?: string; // customer fax
};

export type SSLCommercezShippingData = {
  shipping_method: "YES" | "NO" | "Courier" | "SSLCOMMERZ_LOGISTIC"; // shipping method

  num_of_item?: number; // No of product will be shipped. Example: 1 or 2 or etc
  weight_of_items?: number; // Weight of products will be shipped. Example: 0.5 or 2.00 or etc in kg
  logistic_pickup_id?: string; // logistic pickup id
  logistic_delivery_type?: string; // logistic delivery type

  ship_name?: string; // Shipping Address of your order. Not mandatory but useful if provided
  ship_add1?: string; // Additional Shipping Address of your order. Not mandatory but useful if provided
  ship_add2?: string;
  ship_area?: string; // Shipping Address of your order. Not mandatory but useful if provided
};

export type SSLCommercezProductData = {
  product_category: string;
};

export type SSLCommercezEMIData = {
  emi_option: number; // emi option
  emi_max_inst_option?: number; // max emi option
  emi_selected_inst?: number; // selected emi option
  emi_allow_only?: number; // allow only emi
};

export type SSLCommercezCurrency =
  | "BDT"
  | "USD"
  | "EUR"
  | "SGD"
  | "INR"
  | "MYR";
//// add more if SSLCommercez had the supports

export type SSLCommercezInitData = {
  total_amount: number; // decimal i.e. 10.0 to 500000.00
  currency: SSLCommercezCurrency; // available currencies
  tran_id: string; // unique transaction ID

  success_url: string; // success URL
  fail_url: string; // fail URL
  cancel_url: string; // cancel URL
  ipn_url?: string; // IPN URL

  multi_card_name?: SSLCommercezMultiCardNames; // multi card name options
  allowed_bin?: string; // allowed BIN
};

export type SSLCommercezInitDataWithEMI = SSLCommercezInitData &
  SSLCommercezEMIData;

type SSLCommercezMultiCardNames =
  | "brac_visa"
  | "dbbl_visa"
  | "city_visa"
  | "ebl_visa"
  | "sbl_visa"
  | "brac_master"
  | "dbbl_master"
  | "city_master"
  | "ebl_master"
  | "sbl_master"
  | "city_amex"
  | "qcash"
  | "dbbl_nexus"
  | "bankasia"
  | "abbank"
  | "ibbl"
  | "mtbl"
  | "bkash"
  | "dbblmobilebanking"
  | "city"
  | "upay"
  | "tapnpay"
  | "internetbank"
  | "mobilebank"
  | "othercard"
  | "visacard"
  | "mastercard"
  | "amexcard";
