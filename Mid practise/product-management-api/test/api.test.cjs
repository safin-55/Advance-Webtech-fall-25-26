const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const directory = mkdtempSync(join(tmpdir(), 'shop-lab-test-'));
const database = join(directory, 'test.sqlite');
// Set these before importing AppModule: tests never touch the user's database.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_TYPE: 'sqlite',
  DB_DATABASE: database,
  DB_SYNCHRONIZE: 'true',
  DB_LOGGING: 'false',
});
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { DataSource } = require('typeorm');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/configure-app');

test('Products and employees: real HTTP requests and a persisted SQLite database', async (t) => {
  let app;
  let baseUrl;
  async function open() {
    app = await NestFactory.create(AppModule, { logger: false });
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  }
  async function request(method, path, body) {
    const response = await fetch(baseUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }
  const notebook = {
    name: 'Notebook',
    category: 'Stationery',
    price: 120.5,
    quantity: 50,
  };
  const pen = { name: 'Blue Pen', category: 'Stationery', price: 15, quantity: 100 };
  const employee = {
    name: 'Amina Rahman',
    email: 'amina@example.com',
    phone: '+8801712345678',
    password: 'Demo1234!',
    age: 25,
    yearsOfWorking: 3,
  };
  let product1;
  let product2;
  let employee1;
  let employee2;
  try {
    await open();
    await t.test('both collections start empty', async () => {
      assert.deepEqual(await request('GET', '/products'), { status: 200, body: [] });
      assert.deepEqual(await request('GET', '/employees'), { status: 200, body: [] });
    });
    await t.test('POST creates two products with database-generated IDs', async () => {
      const first = await request('POST', '/products', notebook);
      const second = await request('POST', '/products', pen);
      assert.equal(first.status, 201);
      assert.equal(second.status, 201);
      product1 = first.body;
      product2 = second.body;
      assert.ok(Number.isInteger(product1.id) && product1.id > 0);
      assert.notEqual(product1.id, product2.id);
      assert.deepEqual(product1, { ...notebook, id: product1.id });
    });
    await t.test('GET all returns both saved products', async () => {
      const response = await request('GET', '/products');
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, [product1, product2]);
    });
    await t.test('GET by ID returns the correct product', async () => {
      assert.deepEqual(await request('GET', `/products/${product1.id}`), {
        status: 200,
        body: product1,
      });
    });
    await t.test(
      'PATCH changes selected fields and preserves all other fields',
      async () => {
        const response = await request('PATCH', `/products/${product1.id}`, {
          price: 135.75,
          quantity: 40,
        });
        assert.equal(response.status, 200);
        product1 = { ...product1, price: 135.75, quantity: 40 };
        assert.deepEqual(response.body, product1);
        assert.deepEqual(
          (await request('GET', `/products/${product1.id}`)).body,
          product1,
        );
      },
    );
    for (const [label, invalid] of [
      ['negative price', { price: -1 }],
      ['fractional stock', { quantity: 1.5 }],
      ['string instead of number', { price: '10' }],
      ['too many decimal places', { price: 10.123 }],
      ['blank name', { name: '   ' }],
      ['null field', { category: null }],
      ['unknown field', { extra: 'x' }],
      ['manually supplied ID', { id: 999 }],
    ]) {
      await t.test(`POST rejects ${label}`, async () => {
        assert.equal(
          (await request('POST', '/products', { ...notebook, ...invalid })).status,
          400,
        );
      });
    }
    await t.test(
      'PATCH rejects empty, null, and extra fields without changing data',
      async () => {
        for (const body of [{}, { price: null }, { id: 8 }, { quantity: -2 }]) {
          assert.equal(
            (await request('PATCH', `/products/${product1.id}`, body)).status,
            400,
          );
        }
        assert.deepEqual(
          (await request('GET', `/products/${product1.id}`)).body,
          product1,
        );
      },
    );
    await t.test('zero price and zero quantity are valid', async () => {
      const response = await request('PATCH', `/products/${product2.id}`, {
        price: 0,
        quantity: 0,
      });
      assert.equal(response.status, 200);
      assert.equal(response.body.price, 0);
      assert.equal(response.body.quantity, 0);
    });
    await t.test('DELETE removes only the selected product', async () => {
      const response = await request('DELETE', `/products/${product2.id}`);
      assert.equal(response.status, 200);
      assert.equal(response.body.id, product2.id);
      assert.deepEqual((await request('GET', '/products')).body, [product1]);
      assert.equal((await request('GET', `/products/${product2.id}`)).status, 404);
    });
    await t.test('missing product GET, PATCH and DELETE return 404', async () => {
      for (const method of ['GET', 'PATCH', 'DELETE']) {
        assert.equal(
          (
            await request(
              method,
              '/products/2147483647',
              method === 'PATCH' ? { quantity: 1 } : undefined,
            )
          ).status,
          404,
        );
      }
    });
    await t.test('invalid IDs return 400 for both resources', async () => {
      for (const resource of ['products', 'employees']) {
        for (const id of ['abc', '-1', '0', '1.5', '99999999999999999999']) {
          assert.equal((await request('GET', `/${resource}/${id}`)).status, 400);
        }
      }
    });
    await t.test(
      'POST employees accepts all required fields and hides the password',
      async () => {
        const first = await request('POST', '/employees', employee);
        const second = await request('POST', '/employees', {
          ...employee,
          name: 'Farhan Ali',
          email: 'farhan@example.com',
        });
        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        employee1 = first.body;
        employee2 = second.body;
        const { password, ...publicFields } = employee;
        assert.deepEqual(employee1, { ...publicFields, id: employee1.id });
        assert.notEqual(employee1.id, employee2.id);
        const stored = await app
          .get(DataSource)
          .query('SELECT password FROM employees WHERE id = ?', [employee1.id]);
        assert.notEqual(stored[0].password, password);
        assert.match(stored[0].password, /^scrypt:/);
      },
    );
    await t.test(
      'GET all and GET by ID return saved employees without passwords',
      async () => {
        assert.deepEqual((await request('GET', '/employees')).body, [
          employee1,
          employee2,
        ]);
        assert.deepEqual(
          (await request('GET', `/employees/${employee1.id}`)).body,
          employee1,
        );
      },
    );
    await t.test('duplicate email returns 409, including mixed-case email', async () => {
      assert.equal(
        (await request('POST', '/employees', { ...employee, email: 'AMINA@EXAMPLE.COM' }))
          .status,
        409,
      );
      assert.equal(
        (await request('PATCH', `/employees/${employee2.id}`, { email: employee1.email }))
          .status,
        409,
      );
    });
    await t.test('invalid employee values are rejected', async () => {
      for (const changes of [
        { email: 'bad-email' },
        { phone: 1712345678 },
        { age: 2.5 },
        { yearsOfWorking: -1 },
        { yearsOfWorking: 26 },
        { password: 'x' },
        { name: null },
      ]) {
        assert.equal(
          (
            await request('POST', '/employees', {
              ...employee,
              email: 'other@example.com',
              ...changes,
            })
          ).status,
          400,
        );
      }
    });
    await t.test(
      'PATCH employees persists changes and password changes stay private',
      async () => {
        const response = await request('PATCH', `/employees/${employee1.id}`, {
          yearsOfWorking: 4,
          phone: '+8801812345678',
          password: 'UpdatedDemo123!',
        });
        assert.equal(response.status, 200);
        employee1 = { ...employee1, yearsOfWorking: 4, phone: '+8801812345678' };
        assert.deepEqual(response.body, employee1);
        assert.deepEqual(
          (await request('GET', `/employees/${employee1.id}`)).body,
          employee1,
        );
        for (const body of [{}, { age: null }, { age: 3 }, { password: null }]) {
          assert.equal(
            (await request('PATCH', `/employees/${employee1.id}`, body)).status,
            400,
          );
        }
      },
    );
    await t.test(
      'DELETE employees removes the saved row and missing operations return 404',
      async () => {
        assert.equal((await request('DELETE', `/employees/${employee2.id}`)).status, 200);
        assert.deepEqual((await request('GET', '/employees')).body, [employee1]);
        for (const method of ['GET', 'PATCH', 'DELETE']) {
          assert.equal(
            (
              await request(
                method,
                `/employees/${employee2.id}`,
                method === 'PATCH' ? { name: 'Missing' } : undefined,
              )
            ).status,
            404,
          );
        }
      },
    );
    await t.test(
      'database is a real SQLite file and records survive closing and reopening the app',
      async () => {
        assert.equal(
          readFileSync(database).subarray(0, 16).toString(),
          'SQLite format 3\0',
        );
        await app.close();
        await open();
        assert.deepEqual((await request('GET', '/products')).body, [product1]);
        assert.deepEqual((await request('GET', '/employees')).body, [employee1]);
      },
    );
    await t.test('interactive documentation lists all ten CRUD endpoints', async () => {
      const response = await request('GET', '/docs-json');
      assert.equal(response.status, 200);
      const paths = response.body.paths;
      for (const resource of ['products', 'employees']) {
        for (const method of ['get', 'post']) assert.ok(paths[`/${resource}`][method]);
        for (const method of ['get', 'patch', 'delete'])
          assert.ok(paths[`/${resource}/{id}`][method]);
      }
      assert.equal((await fetch(baseUrl + '/docs')).status, 200);
    });
  } finally {
    if (app) await app.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
