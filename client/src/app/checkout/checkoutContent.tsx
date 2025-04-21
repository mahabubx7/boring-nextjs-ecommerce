"use client";

import { paymentAction } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { GameAPI } from "@/helpers/apis/game";
import { toast } from "@/hooks/use-toast";
import { getAxiosInstance } from "@/lib/axios";
import { useAddressStore } from "@/store/useAddressStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CartItem, useCartStore } from "@/store/useCartStore";
import { Coupon, useCouponStore } from "@/store/useCouponStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useProductStore } from "@/store/useProductStore";
import { API_ROUTES } from "@/utils/api";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function CheckoutContent() {
  const { addresses, fetchAddresses } = useAddressStore();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState<
    (CartItem & { product: any })[]
  >([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponAppliedError, setCouponAppliedError] = useState("");
  const [rank, setRank] = useState<number>(-1);
  const [suggests, setSuggests] = useState<string[]>([]);
  const { items, fetchCart, clearCart } = useCartStore();
  const { getProductById } = useProductStore();
  const { fetchCoupons, couponList } = useCouponStore();
  const {
    // createPayPalOrder,
    // capturePayPalOrder,
    // createFinalOrder,
    isPaymentProcessing,
  } = useOrderStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const gAx = getAxiosInstance(API_ROUTES.GAME);
  const gAPI = new GameAPI(gAx);

  const suggestCouponForRank = (rank: number) => {
    if (rank <= 0) return null;
    else if (rank <= 5) return "top5hacker";
    else if (rank <= 10) return "top10hacker";

    return null;
  };

  useEffect(() => {
    fetchCoupons();
    fetchAddresses();
    fetchCart();

    async function fetchAdditionalData() {
      const sRes = await gAPI.fetchSeasonCode();
      console.info("sRes: ", sRes);
      if (sRes && "season" in sRes) {
        const seasonCode = sRes.season;
        const res = await gAPI.getUserRank(seasonCode);
        console.info("ress: ", res);
        if (res && "rank" in res) {
          setRank(res.rank);
          await checkIfAvailablePrizeCoupon(res.rank);
        }
      }

      async function checkIfAvailablePrizeCoupon(rank: number) {
        const code = suggestCouponForRank(rank) as string;
        const vc = await gAx.post(
          API_ROUTES.COUPON + "/validate-coupon?code=" + code
        );
        if (vc.status === 200) {
          setSuggests((prev) => {
            if (prev.includes(code)) return prev;
            else return [...prev, code];
          });
        }
      }
    }

    fetchAdditionalData().catch(console.error);
  }, [fetchAddresses, fetchCart, fetchCoupons]);

  useEffect(() => {
    const findDefaultAddress = addresses.find((address) => address.isDefault);

    if (findDefaultAddress) {
      setSelectedAddress(findDefaultAddress.id);
    }
  }, [addresses]);

  useEffect(() => {
    const fetchIndividualProductDetails = async () => {
      const itemsWithDetails = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...item, product };
        })
      );

      setCartItemsWithDetails(itemsWithDetails);
    };

    fetchIndividualProductDetails();
  }, [items, getProductById]);

  function handleApplyCoupon() {
    const getCurrentCoupon = couponList.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase()
    );
    console.info("couponList: ", couponList);

    if (!getCurrentCoupon) {
      setCouponAppliedError("Invalied Coupon code");
      setAppliedCoupon(null);
      return;
    }

    const now = new Date();

    if (
      getCurrentCoupon &&
      !["top5hacker", "top10hacker"].includes(
        getCurrentCoupon.code.toLowerCase()
      ) &&
      (now < new Date(getCurrentCoupon.startDate) ||
        now > new Date(getCurrentCoupon.endDate))
    ) {
      setCouponAppliedError(
        "Coupon is not valid in this time or expired coupon"
      );
      setAppliedCoupon(null);
      return;
    }

    if (
      getCurrentCoupon &&
      !["top5hacker", "top10hacker"].includes(
        getCurrentCoupon.code.toLowerCase()
      ) &&
      getCurrentCoupon.usageCount >= getCurrentCoupon.usageLimit
    ) {
      setCouponAppliedError(
        "Coupon has reached its usage limit! Please try a diff coupon"
      );
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(getCurrentCoupon!);
    setCouponAppliedError("");
  }

  const handlePrePaymentFlow = async () => {
    const result = await paymentAction(checkoutEmail);
    if (!result.success) {
      toast({
        title: result.error,
        variant: "destructive",
      });

      return;
    }

    setShowPaymentFlow(true);
  };

  const handleFinalOrderCreation = async (data: any) => {
    if (!user) {
      toast({
        title: "User not authenticated",
      });

      return;
    }
    try {
      const orderData = {
        userId: user?.id,
        addressId: selectedAddress,
        items: cartItemsWithDetails.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productCategory: item.product.category,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.product.price,
        })),
        couponId: appliedCoupon?.id,
        total,
        paymentMethod: "CREDIT_CARD" as const,
        paymentStatus: "COMPLETED" as const,
        paymentId: data.id,
      };

      // const createFinalOrderResponse = await createFinalOrder(orderData);
      const createFinalOrderResponse = await Promise.resolve(true);

      if (createFinalOrderResponse) {
        await clearCart();
        router.push("/account");
      } else {
        toast({
          title: "There is some error while processing final order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "There is some error while processing final order",
        variant: "destructive",
      });
    }
  };

  const subTotal = cartItemsWithDetails.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  const discountAmount = appliedCoupon
    ? (subTotal * appliedCoupon.discountPercent) / 100
    : 0;

  const total = subTotal - discountAmount;

  if (isPaymentProcessing) {
    return (
      <Skeleton className="w-full h-[600px] rounded-xl">
        <div className="h-full flex justify-center items-center">
          <h1 className="text-3xl font-bold">
            Processing payment...Please wait!
          </h1>
        </div>
      </Skeleton>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery</h2>
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start spce-x-2">
                    <Checkbox
                      id={address.id}
                      checked={selectedAddress === address.id}
                      onCheckedChange={() => setSelectedAddress(address.id)}
                    />
                    <Label htmlFor={address.id} className="flex-grow ml-3">
                      <div>
                        <span className="font-medium">{address.name}</span>
                        {address.isDefault && (
                          <span className="ml-2 text-sm text-green-600">
                            (Default)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        {address.address}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.city}, {address.country}, {address.postalCode}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.phone}
                      </div>
                    </Label>
                  </div>
                ))}
                <Button onClick={() => router.push("/account")}>
                  Add a new Address
                </Button>
              </div>
            </Card>
            <Card className="p-6">
              {showPaymentFlow ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Payment</h3>
                  <p className="mb-3">
                    All transactions are secure and encrypted
                  </p>
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "black",
                      shape: "rect",
                      label: "pay",
                    }}
                    fundingSource="card"
                    createOrder={async () => {
                      // const orderId = await createPayPalOrder(
                      //   cartItemsWithDetails,
                      //   total
                      // );
                      const orderId = await Promise.resolve(
                        Math.random().toString(24)
                      );

                      if (orderId === null) {
                        throw new Error("Failed to create paypal order");
                      }

                      return orderId;
                    }}
                    onApprove={async (data, actions) => {
                      // const captureData = await capturePayPalOrder(
                      //   data.orderID
                      // );
                      const captureData = await Promise.resolve({
                        id: Math.random().toString(24),
                      });

                      if (captureData) {
                        await handleFinalOrderCreation(captureData);
                      } else {
                        alert("Failed to capture paypal order");
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Enter Email to get started
                  </h3>
                  <div className="gap-2 flex items-center">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full"
                      value={checkoutEmail}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setCheckoutEmail(event.target.value)
                      }
                    />
                    <Button onClick={handlePrePaymentFlow}>
                      Proceed to Buy
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
          {/* order summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2>Order summary</h2>
              {suggests.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold">Suggested Coupons</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {suggests.map((c) => (
                      <span
                        key={c}
                        className="bg-foreground text-background/80 font-semibold cursor-pointer rounded-md p-1.5 px-2.5 text-sm"
                        onClick={() => setCouponCode(c.toUpperCase())}
                      >
                        {c.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {cartItemsWithDetails.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative h-2- w-20 rounded-md overflow-hidden">
                      <img
                        src={item?.product?.images[0]}
                        alt={item?.product?.name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item?.product?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.color} / {item.size}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item?.product?.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <Input
                    placeholder="Enter a Discount code or Gift code"
                    onChange={(e) => setCouponCode(e.target.value)}
                    value={couponCode}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    className="w-full"
                    variant="outline"
                  >
                    Apply
                  </Button>
                  {couponAppliedError && (
                    <p className="text-sm text-red-600">{couponAppliedError}</p>
                  )}
                  {appliedCoupon && (
                    <>
                      <p className="text-sm text-green-600">
                        Coupon Applied Successfully!
                      </p>

                      <p className="italic bg-red-50 py-2.5 px-4 rounded-md">
                        {["top5hacker", "top10hackers"].includes(
                          appliedCoupon.code.toLowerCase()
                        ) && (
                          <span className="text-xs text-red-400">
                            <b>Note:</b> You can only use this coupon once in a
                            season. If you already used it for this current
                            season then this discount will be declined
                            automatically!
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subTotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({appliedCoupon.discountPercent})%</span>
                      <span>${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutContent;
