const db = require("../db");
const express = require("express");
const router = express.Router();
const slugify = require('slugify');

router.get('/', async (req, res) => {
    try{
        const companies = await db.query(`SELECT code, name FROM companies`);
        return res.json({"companies": companies.rows});
    } catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    } 
});

router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        // Validate the 'code' parameter
        if (!code) {
            return res.status(400).json({ error: 'Bad Request - Missing or Invalid "code" parameter' });
        }

        const compObj = await db.query(`SELECT code, name, description 
                                        FROM companies WHERE code = $1`, [code]);

        if (compObj.rows.length === 0) {
            // If company not found, return 404
            return res.status(500).json({ error: 'Company not found' });
        }

        return res.json({ "company": compObj.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;

        const code = slugify(name, {lower: true});

        if(!code || !name){
            return res.status(400).json({ error: "Code and name are required"});
        }

        const result = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
            [code, name, description]
        );

        return res.status(201).json({"company": result.rows[0]});
    }
    catch(err){
        console.error(err);
        return res.status(400).json({ error: 'Internal Server Error'});
    }

   
});

router.put('/:code', async (req, res) => {
    try{
        const { code } = req.params;
        const { name, description } = req.body;

        const existingCompany = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

        if (existingCompany.rows.length === 0) {
            // If company not found, return 404
            return res.status(404).json({ error: 'Company not found' });
        }

        const result = await db.query(
            'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
            [name, description, code]
        );

        return res.json({ "company": result.rows[0] });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/:code", async (req, res) => {
    try{
        const { code } = req.params;
        
        const existingCompany = await db.query('SELECT * FROM companies where code = $1', [code]);

        if(existingCompany.rows.length === 0){
            return res.status(404).json({ error: 'Company not found'});
        }

        await db.query('DELETE FROM companies WHERE code = $1', [code]);

        return res.json({ status: 'deleted' });
    }
    catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;