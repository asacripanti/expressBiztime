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

        if (!comp_code || amt === undefined) {
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

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        const existingInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);

        if (existingInvoice.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        let paidDate = null;

        if (existingInvoice.rows[0].paid_date === null && paid) {
            // Paying an unpaid invoice
            paidDate = new Date();
        } else if (!paid) {
            // Unpaying
            paidDate = null;
        } else {
            // Keep current paid_date
            paidDate = existingInvoice.rows[0].paid_date;
        }

        const result = await db.query(
            'UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date',
            [amt, paid, paidDate, id]
        );

        return res.json({ invoice: result.rows[0] });
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

describe("DELETE /invoices/:id", function () {
    test("It should delete an existing invoice", async function () {
      // Assuming there is an invoice with id 1 in the test data
      const response = await request(app).delete("/invoices/1");
  
      expect(response.status).toEqual(200); // Assuming you return a 200 status for a successful DELETE
      expect(response.body).toEqual({
        status: 'deleted'
      });
    });
  
    test("It should return 404 for a non-existent invoice", async function () {
      const response = await request(app).delete("/invoices/999");
  
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        error: 'Invoice not found'
      });
    });
  });








module.exports = router;
