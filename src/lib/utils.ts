import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DodoPayments from 'dodopayments';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dodopayments = new DodoPayments({
  bearerToken: process.env['DODO_PAYMENTS_API_KEY'], // This is the default and can be omitted if env is named as DODO_PAYMENTS_API_KEY
  environment: 'test_mode', // defaults to 'live_mode'
});