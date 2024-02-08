const db = require("../db");
const express = require("express");
const router = express.Router();

router.get('/', async (req, res) => {
    try{
        const invoices = await db.query('SELECT id, comp_code FROM invoices');
        return res.json({ "invoices": invoices.rows });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res) => {
    try{
        const { id } = req.params;

        const invoice = await db.query(
            'SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description ' +
            'FROM invoices AS i ' +
            'JOIN companies AS c ON i.comp_code = c.code ' +
            'WHERE i.id = $1',
            [id]
        );

        if (invoice.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        return res.json({ "invoice": invoice.rows[0] });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error'});
    }
});

router.post('/', async (req, res) => {
    try {
        const { comp_code, amt } = req.body;

        if (!comp_code || !amt) {
            return res.status(400).json({ error: "Company code and amount are required" });
        }

        const result = await db.query(
            'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [comp_code, amt]
        );

        return res.json({ "invoice": result.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const { amt } = req.body;

        const existingInvoice = await db.query ('SELECT * FROM invoices WHERE id = $1', [id]);

        if(existingInvoice.rows.length === 0){
            return res.status(404).json({ error: 'Invoice not found'});
        }

        const result = await db.query(
            'UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [amt, id]
        );
        return res.json({ "invoice": result.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete("/:id", async (req, res) => {
    try{
        const { id } = req.params;

        const existingInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);

        if (existingInvoice.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        await db.query('DELETE FROM invoices WHERE id = $1', [id]);

        return res.json({ status: 'deleted' });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
