"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createOrder,
  joinWaitlist,
  lookupOrders,
  createInquiry,
  subscribeEmail,
  cancelOrder,
  updateOrderItems,
} from "@/lib/api/storefront";

/**
 * TanStack Query mutations wrapping the storefront API layer.
 * UI components consume these — they never touch fetch directly.
 */
export const useJoinWaitlist = () => useMutation({ mutationFn: joinWaitlist });
export const useCreateOrder = () => useMutation({ mutationFn: createOrder });
export const useLookupOrders = () => useMutation({ mutationFn: lookupOrders });
export const useCreateInquiry = () => useMutation({ mutationFn: createInquiry });
export const useSubscribeEmail = () => useMutation({ mutationFn: subscribeEmail });
export const useCancelOrder = () => useMutation({ mutationFn: cancelOrder });
export const useUpdateOrderItems = () => useMutation({ mutationFn: updateOrderItems });
