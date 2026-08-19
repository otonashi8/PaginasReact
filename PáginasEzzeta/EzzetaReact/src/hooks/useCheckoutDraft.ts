import { checkoutDraftStorage } from '../storage';

export const CHECKOUT_DRAFT_CHANGED = 'maxeta:checkout-draft-changed';

export type CheckoutDraft = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  referencia?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  paymentMethod?: string;
};

export default function useCheckoutDraft() {
  const getDraft = (): CheckoutDraft => {
    try {
      return checkoutDraftStorage.getDraft();
    } catch {
      return {};
    }
  };

  const setDraft = (draft: CheckoutDraft) => {
    try {
      checkoutDraftStorage.setDraft(draft as any);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CHECKOUT_DRAFT_CHANGED));
      }
    } catch {
    }
  };

  const clearDraft = () => {
    try {
      checkoutDraftStorage.clearDraft();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(CHECKOUT_DRAFT_CHANGED));
      }
    } catch {
    }
  };

  return { getDraft, setDraft, clearDraft };
}
