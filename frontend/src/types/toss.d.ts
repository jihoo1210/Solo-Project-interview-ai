interface TossPaymentWidget {
  requestBillingAuth(options: {
    method: 'CARD';
    successUrl: string;
    failUrl: string;
    customerEmail?: string;
    customerName?: string;
  }): Promise<void>;
}

interface TossPaymentsInstance {
  payment(options: { customerKey: string }): TossPaymentWidget;
}

interface Window {
  TossPayments: (clientKey: string) => TossPaymentsInstance;
}
