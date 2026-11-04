---
name: mevn-native-db-redis
description: Architecture and coding rules for MongoDB Native Driver, Redis caching, and Gemini AI in the CT449 backend. Use when creating or editing backend services, database operations, caching mechanisms, or AI book recommendations.
---

# MongoDB Native Driver & Redis Cache Guidelines (CT449)

This skill documents the exact database, caching, and AI conventions used in the `BACKEND` of this project.

---

## 1. Strictly MongoDB Native Driver (NO MONGOOSE)

The project deliberately avoids Mongoose ODM bloat to achieve high-performance native queries and custom indexing.

### Core Pattern:
```javascript
const MongoDB = require('../utils/mongodb.util');
const { ObjectId } = require('mongodb');

class SachService {
  constructor() {
    this.Sach = MongoDB.client.db().collection('Sach');
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Sach.findOne({ _id: new ObjectId(id) });
  }

  async updateStock(id, delta) {
    // Luôn sử dụng atomic operator để chống race condition
    return await this.Sach.findOneAndUpdate(
      { _id: new ObjectId(id), SoQuyen: { $gte: -delta } },
      { $inc: { SoQuyen: delta } },
      { returnDocument: 'after' }
    );
  }
}
```

### Prohibited:
- ❌ `import mongoose from 'mongoose';`
- ❌ `const Schema = mongoose.Schema;`
- ❌ `Sach.findById(id).exec();`

---

## 2. Redis Caching & Invalidation Strategy

Redis is used to accelerate read queries (`GET /api/user/sach`, `GET /api/user/sach/:id`) down to ~1-2ms.

### Rules:
1. **Cache Pattern**:
   ```javascript
   const Redis = require('../utils/redis.util');

   // Read with cache fallback
   const cacheKey = `sach:list:${JSON.stringify(query)}`;
   const cachedData = await Redis.get(cacheKey);
   if (cachedData) {
     return JSON.parse(cachedData);
   }

   const freshData = await this.Sach.find(query).toArray();
   await Redis.set(cacheKey, JSON.stringify(freshData), 3600); // 1h TTL
   return freshData;
   ```
2. **Mandatory Invalidation on Mutations**:
   Whenever a book, publisher, or loan status is created, updated, or deleted:
   ```javascript
   // Clear all related cache keys
   await Redis.delByPattern('sach:*');
   ```
3. **Graceful Degradation**:
   Always wrap Redis calls in error handling so that if Redis is offline, the backend queries MongoDB directly without crashing.

---

## 3. Gemini AI Integration (`@google/generative-ai`)

The project leverages Gemini for semantic book recommendations:
- Model initialization:
  ```javascript
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  ```
- Always parse the generated AI output with safe JSON fallbacks.
- Never block primary business operations if the Gemini API call exceeds timeout or hits rate-limits.

