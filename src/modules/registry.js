// Modül bileşen kayıt defteri — 16 modülün tamamı bağlı.
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
import RecordsCustomer from './customer/Records';
import RecordsManage from './manage/Records';
import PlansCustomer from './customer/Plans';
import PlansManage from './manage/Plans';
import TrackerCustomer from './customer/Tracker';
import TrackerManage from './manage/Tracker';
import SubscriptionsCustomer from './customer/Subscriptions';
import SubscriptionsManage from './manage/Subscriptions';
import MessagingCustomer from './customer/Messaging';
import MessagingManage from './manage/Messaging';
import ReviewsCustomer from './customer/Reviews';
import ReviewsManage from './manage/Reviews';
import GalleryCustomer from './customer/Gallery';
import GalleryManage from './manage/Gallery';
import ProfileCustomer from './customer/Profile';
import ProfileManage from './manage/Profile';
import StaffCustomer from './customer/Staff';
import StaffManage from './manage/Staff';
import PaymentsCustomer from './customer/Payments';
import PaymentsManage from './manage/Payments';
import PushCustomer from './customer/Push';
import PushManage from './manage/Push';

export const CUSTOMER = {
  booking: BookingCustomer, catalog: CatalogCustomer, ordering: OrderingCustomer,
  campaigns: CampaignsCustomer, loyalty: LoyaltyCustomer, records: RecordsCustomer,
  plans: PlansCustomer, tracker: TrackerCustomer, subscriptions: SubscriptionsCustomer,
  messaging: MessagingCustomer, reviews: ReviewsCustomer, gallery: GalleryCustomer,
  profile: ProfileCustomer, staff: StaffCustomer, payments: PaymentsCustomer, push: PushCustomer,
};

export const MANAGE = {
  booking: BookingManage, catalog: CatalogManage, ordering: OrderingManage,
  campaigns: CampaignsManage, loyalty: LoyaltyManage, records: RecordsManage,
  plans: PlansManage, tracker: TrackerManage, subscriptions: SubscriptionsManage,
  messaging: MessagingManage, reviews: ReviewsManage, gallery: GalleryManage,
  profile: ProfileManage, staff: StaffManage, payments: PaymentsManage, push: PushManage,
};

export const hasCustomer = (m) => !!CUSTOMER[m];
export const hasManage = (m) => !!MANAGE[m];
