const request = require('supertest');
const app = require('../app');
const db = require('../db');

const { createData } = require("../_test-common");

beforeEach(createData);

afterAll(async () => {
  await db.end();
});

// Your test setup code, if any

afterAll(async () => {
  await db.end(); // Close the database connection after all tests
});

describe('GET /companies', () => {
  test('should respond with JSON containing a list of companies', async () => {
    const response = await request(app).get('/companies');

    // Add assertions based on your expected response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('companies');
  });
});

describe("GET /companies/ibm", function () {
  test("It return company info", async function () {
    const response = await request(app).get("/companies/ibm");
    expect(response.body).toEqual({
      "company": {
        code: "ibm",
        name: "IBM",
        description: "Big blue."
      },
    });
  });
});

describe("GET /companies/nonexistent", function () {
  test("It should return 500 for a non-existent company", async function () {
    const response = await request(app).get("/companies/nonexistent");
    expect(response.status).toEqual(500);
  });
});

describe("POST /", function () {

  test("It should add company", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "TacoTime", code: "tacotime", description: "Yum!"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "tacotime",
            name: "TacoTime",
            description: "Yum!",
          }
        }
    );
  });

  test("It should return 400 for conflict", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Apple", description: "Huh?"});

    expect(response.status).toEqual(400);
  })
});

describe("DELETE /", function(){

  test("It should delete the company", async function(){
    const response = await request(app)
      .delete("/companies/apple");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .delete("/companies/blargh");

    expect(response.status).toEqual(404);
  });
})