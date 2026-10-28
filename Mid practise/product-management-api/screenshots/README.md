# Postman evidence

The PNGs in this folder are genuine captures of successful local HTTP requests in **Postman's Lightweight API Client** against this NestJS project. They show actual database-generated IDs and responses. The sample people, email addresses, and passwords are dummy lab data. The database used for these captures is separate from your new local database.

## Products - required filenames

| File | Request and evidence |
| --- | --- |
| `01-create.png` | POST `/products`, JSON request body and 201 response |
| `02-get-all.png` | GET `/products`, 200 response containing two products |
| `03-get-by-id.png` | GET `/products/1`, the product actually created |
| `04-update.png` | PATCH `/products/1`, changed price and quantity and 200 response |
| `05-confirm-update.png` | GET `/products/1`, saved price 135.75 and quantity 40 |
| `06-delete.png` | DELETE `/products/1`, 200 response confirming deletion |
| `07-confirm-delete.png` | GET `/products`, deleted ID 1 absent and ID 2 retained |

The second product was also created through Postman before the GET-all capture. The seven images show the active HTTP method, complete URL, response status, and JSON response; POST and PATCH also show their JSON request bodies.

## Employees - additional evidence

The `employees/` subfolder contains the same seven-operation evidence sequence for employees, including creation of two employees, lookup by ID, update, confirmation, deletion, and confirmation of deletion. Dummy passwords are accepted in the request and omitted from the response.

`evidence.json` records the request and response data used in these capture sequences. The included PNGs are the visual evidence.

## Reproduce on your computer

1. Run the API with `npm run start:dev`.
2. Import the collection and environment from `postman/`, or enter the requests manually in Postman.
3. Create two products. Record the actual IDs from your POST responses.
4. Perform GET all, GET by ID, PATCH, GET to confirm, DELETE, and GET all to confirm deletion.
5. Capture each successful operation using the filenames above. Keep the full URL, response status, and response visible together. For POST and PATCH, keep the request JSON visible too.
6. Use your own saved IDs; they do not have to be 1 and 2. Change the table above if you replace the images with a later run.

For screenshots showing a fully resolved URL, enter `http://localhost:3000/products` and the actual numeric ID in the Postman URL field. The reusable collection uses `{{baseUrl}}` and captured ID variables instead.

Review the captures and replace them with your own run if your instructor requires evidence from your personal machine. No database credentials appear in the images.
