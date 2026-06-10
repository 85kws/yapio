// Modül bileşen kayıt defteri. Her batch'te yeni modüller eklenir.
// CUSTOMER: müşteri (runtime) görünümü. MANAGE: satıcı yönetim görünümü.
import BookingCustomer from './customer/Booking';
import BookingManage from './manage/Booking';

export const CUSTOMER = {
  booking: BookingCustomer,
};

export const MANAGE = {
  booking: BookingManage,
};

export const hasCustomer = (m) => !!CUSTOMER[m];
export const hasManage = (m) => !!MANAGE[m];
