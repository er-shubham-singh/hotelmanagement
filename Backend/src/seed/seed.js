import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { pathToFileURL } from "url";
import { config } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/wallet.model.js";
import { City } from "../models/city.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Room } from "../models/room.model.js";
import { Offer } from "../models/offer.model.js";
import { Review } from "../models/review.model.js";
import { ROLES, HOTEL_TAGS, OFFER_TYPES } from "../config/constants.js";
import { generateReferralCode } from "../services/referral.service.js";

const placeholderImg = (seed, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const CITIES = [
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Delhi", state: "Delhi" },
  { name: "Bangalore", state: "Karnataka" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Kolkata", state: "West Bengal" },
  { name: "Pune", state: "Maharashtra" },
  { name: "Lucknow", state: "Uttar Pradesh" },
];

const AREAS = ["Central Business District", "Airport Road", "Old Town", "Tech Park", "Railway Station Road"];
const AMENITIES = ["wifi", "ac", "tv", "water", "parking", "breakfast", "room_service"];
const HOTEL_NAMES = [
  "Harbor Nest",
  "Skyline Retreat",
  "The Wayfarer Inn",
  "Urban Perch",
  "Northgate Suites",
  "Cedar Grove Stay",
  "The Traveler's Nook",
  "Lakeside Junction",
  "Metro Comfort Inn",
  "Sunrise Boulevard Hotel",
  "The Merchant's Rest",
  "Willow Creek Stay",
];

const randomFrom = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const runSeed = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[seed] Connected to ${config.mongoUri}`);
  }

  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    City.deleteMany({}),
    Hotel.deleteMany({}),
    Room.deleteMany({}),
    Offer.deleteMany({}),
    Review.deleteMany({}),
  ]);
  // eslint-disable-next-line no-console
  console.log("[seed] Cleared existing data");

  // --- Admin user ---
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await User.create({
    name: "StayByHour Admin",
    phone: "9999900000",
    email: "shubham.singh7985@gmail.com",
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    isPhoneVerified: true,
    isEmailVerified: true,
    referralCode: await generateReferralCode("StayByHour Admin"),
  });
  const adminWallet = await Wallet.create({ user: admin._id, balance: 0 });
  admin.wallet = adminWallet._id;
  await admin.save();
  // eslint-disable-next-line no-console
  console.log("[seed] Created admin user: phone 9999900000 / email shubham.singh7985@gmail.com / password Admin@123");

  // --- Sample regular users (for reviews) ---
  const sampleUsers = [];
  for (let i = 1; i <= 3; i += 1) {
    const passwordHash = await bcrypt.hash("User@123", 10);
    const user = await User.create({
      name: `Demo User ${i}`,
      phone: `900000000${i}`,
      email: `demo${i}@staybyhour.com`,
      passwordHash,
      role: ROLES.USER,
      isPhoneVerified: true,
      referralCode: await generateReferralCode(`Demo User ${i}`),
    });
    const wallet = await Wallet.create({
      user: user._id,
      balance: 200,
      transactions: [{ type: "credit", amount: 200, reason: "Welcome bonus" }],
    });
    user.wallet = wallet._id;
    await user.save();
    sampleUsers.push(user);
  }
  // eslint-disable-next-line no-console
  console.log("[seed] Created 3 demo users (phone 9000000001-3 / password User@123), each with a ₹200 wallet bonus");

  // --- Cities ---
  const cities = await City.insertMany(
    CITIES.map((c, i) => ({ ...c, heroImage: placeholderImg(`city-${i}`, 1200, 600) }))
  );
  // eslint-disable-next-line no-console
  console.log(`[seed] Created ${cities.length} cities`);

  // --- Hotels + Rooms ---
  const hotels = [];
  for (let i = 0; i < HOTEL_NAMES.length; i += 1) {
    const city = cities[i % cities.length];
    const hotel = await Hotel.create({
      name: HOTEL_NAMES[i],
      city: city._id,
      area: randomFrom(AREAS, 1)[0],
      address: `${randomInt(1, 200)}, ${randomFrom(AREAS, 1)[0]}, ${city.name}`,
      geo: { lat: 12 + Math.random() * 10, lng: 72 + Math.random() * 15 },
      description: `${HOTEL_NAMES[i]} is a comfortable stay in ${city.name}, offering flexible hourly and full-day bookings with a clean, modern feel.`,
      images: [placeholderImg(`hotel-${i}-1`), placeholderImg(`hotel-${i}-2`), placeholderImg(`hotel-${i}-3`)],
      amenities: randomFrom(AMENITIES, randomInt(3, AMENITIES.length)),
      tags: randomFrom(Object.values(HOTEL_TAGS), randomInt(1, 3)),
      starCategory: randomInt(2, 5),
      isActive: true,
    });
    hotels.push(hotel);

    const roomTypeCount = randomInt(1, 2);
    for (let r = 0; r < roomTypeCount; r += 1) {
      await Room.create({
        hotel: hotel._id,
        type: r === 0 ? "Deluxe Room" : "Executive Suite",
        capacity: { adults: r === 0 ? 2 : 3, children: 1 },
        images: [placeholderImg(`room-${i}-${r}-1`), placeholderImg(`room-${i}-${r}-2`)],
        amenities: randomFrom(AMENITIES, randomInt(3, AMENITIES.length)),
        priceSlots: {
          threeHr: 899 + r * 300 + randomInt(0, 200),
          sixHr: 1399 + r * 400 + randomInt(0, 200),
          twelveHr: 1999 + r * 500 + randomInt(0, 300),
          fullDay: 2499 + r * 600 + randomInt(0, 300),
        },
        totalUnits: randomInt(2, 8),
        isActive: true,
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Created ${hotels.length} hotels with rooms`);

  // --- Reviews ---
  for (const hotel of hotels.slice(0, 8)) {
    const reviewer = sampleUsers[randomInt(0, sampleUsers.length - 1)];
    const rating = randomInt(3, 5);
    await Review.create({
      hotel: hotel._id,
      user: reviewer._id,
      rating,
      comment: "Clean room, smooth check-in, would book again for a quick stopover.",
    });
    await Hotel.findByIdAndUpdate(hotel._id, { rating, reviewCount: 1 });
  }
  // eslint-disable-next-line no-console
  console.log("[seed] Created sample reviews");

  // --- Offers ---
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  await Offer.insertMany([
    {
      code: "FIRST100",
      title: "₹100 off your first booking",
      description: "Flat ₹100 off on your first hourly stay booking.",
      type: OFFER_TYPES.FLAT,
      value: 100,
      minBooking: 500,
      validFrom: now,
      validTo: in90Days,
      usageLimit: 1000,
    },
    {
      code: "WEEKEND20",
      title: "20% off weekend stays",
      description: "Get 20% off, up to ₹300, on any stay booked for the weekend.",
      type: OFFER_TYPES.PERCENT,
      value: 20,
      maxDiscount: 300,
      minBooking: 800,
      validFrom: now,
      validTo: in90Days,
      usageLimit: null,
    },
    {
      code: "COUPLE250",
      title: "₹250 off couple-friendly stays",
      description: "Flat ₹250 off on couple-friendly hotels for 6-hour or longer slots.",
      type: OFFER_TYPES.FLAT,
      value: 250,
      minBooking: 1200,
      validFrom: now,
      validTo: in90Days,
      usageLimit: 500,
    },
  ]);
  // eslint-disable-next-line no-console
  console.log("[seed] Created 3 offers: FIRST100, WEEKEND20, COUPLE250");

  // eslint-disable-next-line no-console
  console.log("[seed] Done.");

  return { admin, sampleUsers, cities, hotels };
};

const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  runSeed()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("[seed] Failed:", error);
      process.exit(1);
    });
}
