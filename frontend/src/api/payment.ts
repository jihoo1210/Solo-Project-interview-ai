import apiClient from './client';
import type { PaymentPrepareResponse, BillingKeyIssueRequest, BillingKeyIssueResponse, SubscriptionCancelResponse, PaymentResponse } from '../types';

/**
 * 토스페이먼츠 클라이언트 키 조회
 */
export const getClientKey = async (): Promise<string> => {
  const response = await apiClient.get<{ success: boolean; data: string }>('/api/payments/client-key');
  return response.data.data;
};

/**
 * 결제 준비 (customerKey 생성)
 */
export const preparePayment = async (planType: string): Promise<PaymentPrepareResponse> => {
  const response = await apiClient.post<{ success: boolean; data: PaymentPrepareResponse }>('/api/payments/prepare', {
    planType,
  });
  return response.data.data;
};

/**
 * 빌링키 발급 및 첫 결제
 */
export const issueBillingKey = async (request: BillingKeyIssueRequest): Promise<BillingKeyIssueResponse> => {
  const response = await apiClient.post<{ success: boolean; data: BillingKeyIssueResponse }>('/api/payments/billing-key', request);
  return response.data.data;
};

/**
 * 구독 취소
 */
export const cancelSubscription = async (): Promise<SubscriptionCancelResponse> => {
  const response = await apiClient.delete<{ success: boolean; data: SubscriptionCancelResponse }>('/api/payments/subscription');
  return response.data.data;
};

/**
 * 결제 내역 조회
 */
export const getPaymentHistory = async (): Promise<PaymentResponse[]> => {
  const response = await apiClient.get<{ success: boolean; data: PaymentResponse[] }>('/api/payments');
  return response.data.data;
};

/**
 * 특정 결제 상세 조회
 */
export const getPayment = async (paymentId: number): Promise<PaymentResponse> => {
  const response = await apiClient.get<{ success: boolean; data: PaymentResponse }>(`/api/payments/${paymentId}`);
  return response.data.data;
};
