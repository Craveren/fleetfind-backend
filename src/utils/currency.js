import { VAT_RATE } from './constants';

const USD_TO_ZAR_RATE = 18.5;

export const convertToZAR = (usdAmount) => (usdAmount * USD_TO_ZAR_RATE).toFixed(2);

export const calculateVAT = (amount, rate = VAT_RATE) => (parseFloat(amount) * rate).toFixed(2);

export const addVAT = (amount, rate = VAT_RATE) => (parseFloat(amount) * (1 + rate)).toFixed(2);

export const formatZAR = (value, locale) => {
    const number = Number(value) || 0;
    try {
        return new Intl.NumberFormat(locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-ZA'), {
            style: 'currency',
            currency: 'ZAR',
            currencyDisplay: 'narrowSymbol',
            maximumFractionDigits: 2,
        }).format(number);
    } catch {
        // Fallback
        return `R${number.toFixed(2)}`;
    }
};