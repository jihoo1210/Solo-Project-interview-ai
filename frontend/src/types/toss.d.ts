interface TossPaymentWidget {
  requestBillingKeyAuth(
    method: '카드',
    options: {
      scope: 'BILLING';
      customerEmail?: string;
      customerName?: string;
      successUrl: string;
      failUrl: string;
    }
  ): Promise<void>;
}

interface TossPaymentsInstance {
  payment(options: { customerKey: string }): TossPaymentWidget;
}

interface Window {
  TossPayments: (clientKey: string) => TossPaymentsInstance;
}
