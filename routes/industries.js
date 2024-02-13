const db = require("../db");
const express = require("express");
const router = express.Router();


router.post('/industries', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const result = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);
        return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.get('/industries', async (req, res, next) => {
    try {
        const result = await db.query('SELECT i.code, i.industry, ARRAY_AGG(ci.company_code) AS company_codes FROM industries i LEFT JOIN company_industries ci ON i.code = ci.industry_code GROUP BY i.code, i.industry');
        return res.json({ industries: result.rows });
    } catch (err) {
        return next(err);
    }
});

router.post('/:industryCode/companies', async (req, res, next) => {
    try {
      const { industryCode } = req.params;
      const { companyCode } = req.body;
  
      // Check if the industry and company exist
      const industryResult = await db.query('SELECT * FROM industries WHERE code = $1', [industryCode]);
      const companyResult = await db.query('SELECT * FROM companies WHERE code = $1', [companyCode]);
  
      if (industryResult.rows.length === 0) {
        return res.status(404).json({ error: 'Industry not found' });
      }
  
      if (companyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }
  
      // Check if the association already exists
      const existingAssociation = await db.query(
        'SELECT * FROM company_industries WHERE company_code = $1 AND industry_code = $2',
        [companyCode, industryCode]
      );
  
      if (existingAssociation.rows.length > 0) {
        return res.status(409).json({ error: 'Association already exists' });
      }
  
      // Create the association
      await db.query('INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)', [companyCode, industryCode]);
  
      return res.status(201).json({ success: true });
    } catch (err) {
      return next(err);
    }
  });

  module.exports = router;
