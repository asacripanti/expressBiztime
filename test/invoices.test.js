const request = require('supertest');
const app = require('../app');
const db = require('../db');

const { createData } = require('../_test-common');

//All my tests pass except for tests on a route I have not written tests for, I am confused on why this is happening.


beforeEach(createData);

afterAll(async () => {
  await db.end();
});

describe("GET /", function () {

    test("It should respond with array of invoices", async function () {
      const response = await request(app).get("/invoices");
      expect(response.body).toEqual({
        "invoices": [
          {id: 1, comp_code: "apple"},
          {id: 2, comp_code: "apple"},
          {id: 3, comp_code: "ibm"},
        ]
      });
    })
  
  });
  
  describe("GET /invoices/:id", function () {
  test("It should return invoice info by ID", async function () {
    const response = await request(app).get("/invoices/1");
    // Adjusted expectation for the add_date field
    const expectedDate = new Date("2018-01-01T06:00:00.000Z").toISOString();

    expect(response.body).toEqual({
      "invoice": {
        id: 1,
        amt: 100,
        paid: false,
        add_date: expectedDate,
        paid_date: null,
        code: "apple",  // Change comp_code to code
        name: "Apple",
        description: "Maker of OSX."
      }
    });
  });

  test("It should return 404 for non-existent invoice", async function () {
    const response = await request(app).get("/invoices/999");

    expect(response.status).toEqual(404);
    expect(response.body).toEqual({
      error: 'Invoice not found'
    });
  });
});

describe("POST /invoices", function () {
    test("It should add a new invoice", async function () {
      const response = await request(app)
        .post("/invoices")
        .send({ comp_code: "apple", amt: 500 }); // Adjust values as needed
  
      expect(response.status).toEqual(200); // Assuming you return a 200 status for successful POST
      expect(response.body).toEqual({
        "invoice": {
          id: expect.any(Number),
          comp_code: "apple",
          amt: 500,
          paid: false,
          add_date: expect.any(String),
          paid_date: null
        }
      });
    });
  
    test("It should return 400 for missing parameters", async function () {
      const response = await request(app)
        .post("/invoices")
        .send({ comp_code: "apple" }); // Missing 'amt'
  
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error: 'Company code and amount are required'
      });
    });
  });

  describe("PUT /", function () {

    test("It should update an invoice", async function () {
      const response = await request(app)
          .put("/invoices/1")
          .send({amt: 1000, paid: false});
  
      expect(response.body).toEqual(
          {
            "invoice": {
              id: 1,
              comp_code: 'apple',
              paid: false,
              amt:1000,
              add_date: expect.any(String),
              paid_date: null,
            }
          }
      );
    });
  
    test("It should return 404 for no-such-invoice", async function () {
      const response = await request(app)
          .put("/invoices/9999")
          .send({amt: 1000});
  
      expect(response.status).toEqual(404);
    });
  
    test("It should return 500 for missing data", async function () {
      const response = await request(app)
          .put("/invoices/1")
          .send({});
  
      expect(response.status).toEqual(500);
    })
  });
  

  describe("DELETE /", function () {

    test("It should delete invoice", async function () {
      const response = await request(app)
          .delete("/invoices/1");
  
      expect(response.body).toEqual({"status": "deleted"});
    });
  
    test("It should return 404 for no-such-invoices", async function () {
      const response = await request(app)
          .delete("/invoices/999");
  
      expect(response.status).toEqual(404);
    });
  });
  
  