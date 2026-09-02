export type ComprarFormValues = {
  fullName: string;
  email: string;
  phone: string;
  document: string;
  department: string;
  province: string;
  district: string;
  locationText: string;
  locationName?: string;
  postalCode: string;
  reference: string;
  paymentMethod: 'tarjeta' | 'yape';
  cardOwner: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  yapePhone: string;
};

export const DEFAULT_VALUES: Omit<ComprarFormValues, 'department' | 'province' | 'district'> & { department: string; province: string; district: string } = {
  fullName: '',
  email: '',
  phone: '',
  document: '',
  department: '',
  province: '',
  district: '',
  locationText: '',
  locationName: '',
  postalCode: '',
  reference: '',
  paymentMethod: 'tarjeta',
  cardOwner: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  yapePhone: '',
};
