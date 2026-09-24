import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getBusinesses, getBusinessById, insertBusiness, updateBusiness, deleteBusiness } from './src/db/businesses.ts';
import { getClaims, insertClaim, updateClaimStatus } from './src/db/claims.ts';
import { getQuotes, insertQuote, updateQuoteStatus } from './src/db/quotes.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { seedInitialBusinesses } from './src/db/seed.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed initial dataset if database is empty
  seedInitialBusinesses().catch((err) => {
    console.error('Seed error:', err);
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'Cloud SQL PostgreSQL' });
  });

  // Gemini AI Business Assistant Endpoint
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { prompt, businesses } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const context = JSON.stringify(businesses || []);
      const systemInstruction = `You are EthioSpot AI Business Assistant, an expert concierge helping users discover businesses, coffee roasteries, restaurants, clinics, tech vendors, and services across Addis Ababa (Bole, Kazanchis, Megenagna, Piazza, Sarbet, Mercato, etc.).
Here is the current list of verified businesses in our directory:
${context}

When users ask questions in natural language (English or Amharic) about products, services, locations, or recommendations, analyze their request, suggest the most relevant businesses from the directory list above, provide helpful details (district, price range, contact), and write a warm, professional, helpful response.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }, { text: prompt }] }
        ]
      });

      const reply = response.text || 'I am here to help you discover the best verified businesses in Addis Ababa!';
      res.json({ reply });
    } catch (error: any) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: error.message || 'AI Assistant request failed' });
    }
  });

  // Synchronize authenticated user with database
  app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || '';
      const displayName = req.user?.name || req.body.displayName || '';
      const photoUrl = req.user?.picture || req.body.photoUrl || '';

      if (!uid) {
        return res.status(400).json({ error: 'User UID missing' });
      }

      const user = await getOrCreateUser(uid, email, displayName, photoUrl);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('User sync error:', error);
      res.status(500).json({ error: error.message || 'User synchronization failed' });
    }
  });

  // Businesses Endpoints
  app.get('/api/businesses', async (req, res) => {
    try {
      const list = await getBusinesses();
      const parsed = list.map((b) => {
        let paymentMethods: string[] = [];
        let tags: string[] = [];
        try {
          paymentMethods = b.paymentMethods ? JSON.parse(b.paymentMethods) : [];
        } catch {
          paymentMethods = b.paymentMethods ? b.paymentMethods.split(',') : [];
        }
        try {
          tags = b.tags ? JSON.parse(b.tags) : [];
        } catch {
          tags = b.tags ? b.tags.split(',') : [];
        }

        return {
          id: b.id,
          name: b.name,
          nameAmharic: b.nameAmharic || '',
          category: b.category,
          categoryLabel: b.categoryLabel || b.category,
          district: b.district,
          address: b.address,
          licenseNumber: b.licenseNumber,
          licenseType: b.licenseType,
          tinNumber: b.tinNumber || undefined,
          rating: b.rating ? parseFloat(b.rating) : 4.5,
          reviewCount: b.reviewCount || 0,
          phone: b.phone,
          hours: b.hours || '8:00 AM - 8:00 PM',
          isOpen: b.isOpen ?? true,
          priceRange: b.priceRange || '$$',
          imageUrl: b.imageUrl,
          description: b.description,
          lat: b.coordinatesLat ? parseFloat(b.coordinatesLat) : 9.01,
          lng: b.coordinatesLng ? parseFloat(b.coordinatesLng) : 38.76,
          paymentMethods,
          tags,
          featured: b.featured ?? false,
          creatorId: b.creatorId || undefined,
        };
      });
      res.json(parsed);
    } catch (error: any) {
      console.error('Failed to get businesses from Cloud SQL:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch businesses' });
    }
  });

  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const b = await getBusinessById(req.params.id);
      if (!b) {
        return res.status(404).json({ error: 'Business not found' });
      }
      res.json(b);
    } catch (error: any) {
      console.error('Failed to get business:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch business' });
    }
  });

  app.post('/api/businesses', async (req, res) => {
    try {
      const body = req.body;
      const created = await insertBusiness({
        id: body.id || `biz-${Date.now()}`,
        name: body.name,
        nameAmharic: body.nameAmharic || null,
        category: body.category,
        categoryLabel: body.categoryLabel || null,
        district: body.district,
        address: body.address,
        licenseNumber: body.licenseNumber,
        licenseType: body.licenseType || 'Pending Verification',
        tinNumber: body.tinNumber || null,
        rating: body.rating ? body.rating.toString() : '4.5',
        reviewCount: body.reviewCount || 0,
        phone: body.phone,
        hours: body.hours || null,
        isOpen: body.isOpen ?? true,
        priceRange: body.priceRange || '$$',
        imageUrl: body.imageUrl,
        description: body.description,
        coordinatesLat: body.lat ? body.lat.toString() : null,
        coordinatesLng: body.lng ? body.lng.toString() : null,
        paymentMethods: JSON.stringify(body.paymentMethods || []),
        tags: JSON.stringify(body.tags || []),
        featured: body.featured ?? false,
        creatorId: body.creatorId || null,
      });
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Failed to create business:', error);
      res.status(500).json({ error: error.message || 'Failed to create business' });
    }
  });

  app.put('/api/businesses/:id', async (req, res) => {
    try {
      const body = req.body;
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.nameAmharic !== undefined) updateData.nameAmharic = body.nameAmharic;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.categoryLabel !== undefined) updateData.categoryLabel = body.categoryLabel;
      if (body.district !== undefined) updateData.district = body.district;
      if (body.address !== undefined) updateData.address = body.address;
      if (body.licenseNumber !== undefined) updateData.licenseNumber = body.licenseNumber;
      if (body.licenseType !== undefined) updateData.licenseType = body.licenseType;
      if (body.tinNumber !== undefined) updateData.tinNumber = body.tinNumber;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.hours !== undefined) updateData.hours = body.hours;
      if (body.isOpen !== undefined) updateData.isOpen = body.isOpen;
      if (body.priceRange !== undefined) updateData.priceRange = body.priceRange;
      if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.lat !== undefined) updateData.coordinatesLat = body.lat.toString();
      if (body.lng !== undefined) updateData.coordinatesLng = body.lng.toString();
      if (body.paymentMethods !== undefined) updateData.paymentMethods = JSON.stringify(body.paymentMethods);
      if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
      if (body.featured !== undefined) updateData.featured = body.featured;

      const updated = await updateBusiness(req.params.id, updateData);
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update business:', error);
      res.status(500).json({ error: error.message || 'Failed to update business' });
    }
  });

  app.delete('/api/businesses/:id', async (req, res) => {
    try {
      const deleted = await deleteBusiness(req.params.id);
      res.json({ success: true, deleted });
    } catch (error: any) {
      console.error('Failed to delete business:', error);
      res.status(500).json({ error: error.message || 'Failed to delete business' });
    }
  });

  // Claims Endpoints
  app.get('/api/claims', async (req, res) => {
    try {
      const list = await getClaims();
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get claims:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch claims' });
    }
  });

  app.post('/api/claims', async (req, res) => {
    try {
      const body = req.body;
      const created = await insertClaim({
        id: body.id || `claim-${Date.now()}`,
        businessName: body.businessName,
        licenseNumber: body.licenseNumber,
        tinNumber: body.tinNumber,
        applicantName: body.applicantName,
        role: body.role,
        applicantPhone: body.applicantPhone,
        status: body.status || 'Under MoT Verification',
        submittedAt: body.submittedAt || new Date().toISOString(),
        applicantId: body.applicantId || null,
      });
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Failed to submit claim:', error);
      res.status(500).json({ error: error.message || 'Failed to create claim' });
    }
  });

  app.patch('/api/claims/:id', async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await updateClaimStatus(req.params.id, status);
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update claim:', error);
      res.status(500).json({ error: error.message || 'Failed to update claim' });
    }
  });

  // Quotes Endpoints
  app.get('/api/quotes', async (req, res) => {
    try {
      const list = await getQuotes();
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get quotes:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch quotes' });
    }
  });

  app.post('/api/quotes', async (req, res) => {
    try {
      const body = req.body;
      const created = await insertQuote({
        id: body.id || `quote-${Date.now()}`,
        businessId: body.businessId || null,
        businessName: body.businessName,
        category: body.category,
        contactName: body.contactName,
        phone: body.phone,
        email: body.email || null,
        quantityNotes: body.quantityNotes,
        organization: body.organization,
        urgency: body.urgency,
        status: body.status || 'Under Evaluation',
        submittedAt: body.submittedAt || new Date().toISOString(),
        senderId: body.senderId || null,
      });
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Failed to submit quote:', error);
      res.status(500).json({ error: error.message || 'Failed to create quote' });
    }
  });

  app.patch('/api/quotes/:id', async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await updateQuoteStatus(req.params.id, status);
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update quote:', error);
      res.status(500).json({ error: error.message || 'Failed to update quote' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EthioSpot Cloud SQL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
