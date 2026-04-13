# MongoDB Subscription API Setup

This guide explains how to setup the MongoDB subscription management system for Mickey Stream.

## Environment Variables

Add to your `.env.local`:

```bash
VITE_MONGODB_URI=your_mongodb_api_url
```

Example (if using MongoDB Atlas with API):
```bash
VITE_MONGODB_URI=https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint
```

## MongoDB API Endpoints

Your MongoDB backend should expose these REST endpoints:

### 1. Get User Subscription
```
GET /subscriptions/{userId}
Returns: Subscription object or null
```

### 2. Create Subscription
```
POST /subscriptions
Body: {
  userId: string,
  duration: "1_week" | "2_weeks" | "1_month",
  startsAt: ISO string,
  expiresAt: ISO string,
  isActive: boolean
}
Returns: Created Subscription object with _id
```

### 3. Update Subscription
```
PUT /subscriptions/{userId}
Body: Partial subscription object
Returns: Updated Subscription object
```

### 4. Delete Subscription
```
DELETE /subscriptions/{userId}
Returns: Success status
```

### 5. Get All Subscriptions (Admin)
```
GET /subscriptions
Returns: Array of Subscription objects
```

## MongoDB Collection Schema

```javascript
db.subscriptions.insertOne({
  _id: ObjectId(),
  userId: UUID,
  duration: "1_month", // enum: 1_week, 2_weeks, 1_month
  startsAt: ISODate(),
  expiresAt: ISODate(),
  isActive: boolean,
  createdAt: ISODate()
})

// Create indexes
db.subscriptions.createIndex({ userId: 1 }, { unique: true })
db.subscriptions.createIndex({ expiresAt: 1 })
```

## Key Features

✅ **Supabase for User Auth & Profiles**
- User authentication via Supabase
- User profiles stored in Supabase

✅ **MongoDB for Subscriptions**
- Subscription data managed via MongoDB
- Admin assigns subscriptions from MongoDB
- User subscription status fetched from MongoDB at login

✅ **Glass Morphism UI**
- All admin pages and modals use glass morphism effect
- Backdrop blur with semi-transparent backgrounds
- Modern, sleek appearance

✅ **Sliders Management**
- Sliders start empty
- Admin can add sliders via local storage
- Sliders persist in browser local storage

## Integration Points

### AuthContext
- User sync: Supabase
- Subscription fetch: MongoDB (via subscriptionService)

### AdminUsers
- User management: Supabase
- Subscription assignment: MongoDB

### AdminSliders
- Sliders: Local Storage (no database)

## Testing the Setup

1. **Sign in as admin**: 
   - Email: mickidadyhamza@gmail.com
   - Password: MICKEY24@

2. **Go to Admin > Users**

3. **Click Subscribe on a user**

4. **Select subscription duration and assign**

5. **Subscription is saved to MongoDB**

## Notes

- MongoDB URL should be a REST API endpoint that handles the subscription operations
- All requests include proper error handling and toast notifications
- Subscriptions are checked at user login to determine access level
