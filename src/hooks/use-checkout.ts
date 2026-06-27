"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/store/cart";
import { getShippingFees } from "@/lib/api/storefront";
import { useCreateOrder } from "@/hooks/use-storefront-mutations";
import { isRemoteArea } from "@/lib/format";
import { checkoutSchema, fieldErrors } from "@/lib/validation/order";
import { ApiError } from "@/lib/api/client";

export type CheckoutForm = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_postcode: string;
  shipping_address1: string;
  shipping_address2: string;
  shipping_memo: string;
  depositor_name: string;
};

const EMPTY: CheckoutForm = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  shipping_postcode: "",
  shipping_address1: "",
  shipping_address2: "",
  shipping_memo: "",
  depositor_name: "",
};

/** Checkout business logic — keeps the form component purely presentational. */
export function useCheckout() {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState<CheckoutForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);
  const createOrder = useCreateOrder();

  const feesQuery = useQuery({
    queryKey: ["shipping-fees"],
    queryFn: getShippingFees,
    staleTime: 5 * 60 * 1000,
  });
  const fees = feesQuery.data ?? { default: 4000, remote: 7000 };

  const remote = useMemo(() => isRemoteArea(form.shipping_postcode), [form.shipping_postcode]);
  const shippingFee = remote ? fees.remote : fees.default;
  const total = subtotal + shippingFee;

  function setField(key: keyof CheckoutForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function submit() {
    const payload = {
      ...form,
      items: lines.map((l) => ({
        product_id: l.product_id,
        name: l.name,
        unit_price_krw: l.price_krw,
        quantity: l.quantity,
      })),
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    try {
      const res = await createOrder.mutateAsync(parsed.data);
      clear();
      setCompletedOrderNumber(res.order_number);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "주문 처리 중 오류가 발생했습니다.";
      setErrors((e) => ({ ...e, _form: message }));
    }
  }

  return {
    form,
    setField,
    errors,
    remote,
    fees,
    shippingFee,
    total,
    subtotal,
    submitting: createOrder.isPending,
    submit,
    completedOrderNumber,
  };
}
