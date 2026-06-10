// Modül bileşen kayıt defteri. Her batch'te yeni modüller eklenir.
// CUSTOMER: müşteri (runtime) görünümü. MANAGE: satıcı yönetim görünümü.
import BookingCustomer from './customer/Booking';
import BookingManage from './manage/Booking';
import CatalogCustomer from './customer/Catalog';
import CatalogManage from './manage/Catalog';
import OrderingCustomer from './customer/Ordering';
import OrderingManage from './manage/Ordering';
import CampaignsCustomer from './customer/Campaigns';
import CampaignsManage from './manage/Campaigns';
import LoyaltyCustomer from './customer/Loyalty';
import LoyaltyManage from './manage/Loyalty';

export const CUSTOMER = {
  booking: BookingCustomer,
  catalog: CatalogCustomer,
  ordering: OrderingCustomer,
  campaigns: CampaignsCustomer,
  loyalty: LoyaltyCustomer,
};

export const MANAGE = {
  booking: BookingManage,
  catalog: CatalogManage,
  ordering: OrderingManage,
  campaigns: CampaignsManage,
  loyalty: LoyaltyManage,
};

export const hasCustomer = (m) => !!CUSTOMER[m];
export const hasManage = (m) => !!MANAGE[m];
