// import { randomBytes } from "node:crypto";
// import { SSLCommerzPayment } from "sslcommerz-lts";

// export type SSLCommercezConfig = {
//   storeId: string;
//   storePassword: string;
//   isLive?: boolean;
// };

// export class SSLCommercez {
//   protected storeId: string;
//   protected storePassword: string;
//   protected isLive: boolean;

//   constructor(config: SSLCommercezConfig) {
//     this.storeId = config.storeId;
//     this.storePassword = config.storePassword;
//     this.isLive = config.isLive || false;
//   }

//   // generate unique transaction id
//   static generateTrxId(): string {
//     return "TRX_" + randomBytes(8).toString("hex").toUpperCase();
//   }

//   // initiate sslcommerz lts module
//   public initateSslCommerz() {
//     return new SSLCommerzPayment({
//       store_id: this.storeId,
//       store_passwd: this.storePassword,
//       is_live: this.isLive,
//     });
//   }

//   // initiate payment
//   public initiatePayment(
//     data: SSLCommercezInitiateData,
//     // url: string = "",
//     // method: string = "POST",
//     sslcomz: SSLCommerzPayment = this.initateSslCommerz()
//   ) {
//     return sslcomz.init(data);
//   }

//   // compose data
//   public compose(
//     dtx: Omit<
//       SSLCommercezInitiateData,
//       | "tran_id"
//       | "currency"
//       | "success_url"
//       | "fail_url"
//       | "cancel_url"
//       | "ipn_url"
//     >
//   ) {
//     const serverDomain = process.env.API_DOMAIN_URL || "http://localhost:3000";

//     return {
//       ...dtx,
//       tran_id: SSLCommercez.generateTrxId(),
//       currency: "BDT",
//       success_url: serverDomain + "/api/payment/success",
//       fail_url: serverDomain + "/api/payment/fail",
//       cancel_url: serverDomain + "/api/payment/cancel",
//       ipn_url: serverDomain + "/api/payment/ipn",
//     } satisfies SSLCommercezInitiateData;
//   }
// //
//   //
// }

// export type SSLCommercezInitiateData = {
//   total_amount: number;
//   currency: string; // BDT as fixed for now
//   tran_id: string;

//   success_url: string;
//   fail_url: string;
//   cancel_url: string;
//   ipn_url: string;

//   shipping_method: string;

//   product_name: string;
//   product_category: string;
//   product_profile: string;

//   cus_name: string;
//   cus_email: string;
//   cus_add1: string;
//   cus_add2: string;
//   cus_city: string;
//   cus_state: string;
//   cus_postcode: string;
//   cus_country: string;
//   cus_phone: string;
//   cus_fax: string;

//   ship_name: string;
//   ship_add1: string;
//   ship_add2: string;
//   ship_city: string;
//   ship_state: string;
//   ship_postcode: number;
//   ship_country: string;
// };

export class SSLCommercezPaymentGateway {}
