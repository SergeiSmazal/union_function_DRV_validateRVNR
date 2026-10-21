# DRV Rentenversicherungsnummer (RVNR) Validator for Genesys Cloud

An AWS Lambda function designed to be integrated into Genesys Cloud Bot Flows via Data Actions. It validates German social security and pension insurance numbers (Rentenversicherungsnummer - RVNR) according to official Deutsche Rentenversicherung (DRV) specifications.

---

## Features

- **Genesys Cloud Integration:** Accepts incoming requests from Genesys Cloud Data Actions (supporting both parsed and unparsed event bodies).
- **Official DRV Validation Algorithm:** 
  - Validates exact length (12 characters).
  - Handles letter-to-digit conversion for the birth name initial at position 9 (`A=01` through `Z=26`).
  - Applies official weighting factors (`[2, 1, 2, 5, 7, 1, 2, 1, 2, 1, 2, 1]`) in reverse order.
  - Computes cross-sums (Quersummen) and validates against the check digit (12th character) using modulo 10 arithmetic.
- **Robust Error Handling:** Returns HTTP 400 status if the `rvnr` parameter is missing or malformed.

---

## Request & Response Format

### Input Payload (JSON)
```json
{
  "rvnr": "12345678A912"
}
```

### Success Response (Valid)
```json
{
  "isValid": true
}
```

### Success Response (Invalid)
```json
{
  "isValid": false
}
```

### Error Response (Missing Parameter)
```json
{
  "statusCode": 400,
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"error\":\"Parameter 'rvnr' is required\"}"
}
```

---

## Setup & Deployment (AWS Lambda)

1. Create a new AWS Lambda function with **Node.js** runtime.
2. Paste the contents of `index.js` into the Lambda handler (`index.handler`).
3. Expose the Lambda function via AWS API Gateway or integrate it directly with Genesys Cloud Integrations (AWS Lambda / Data Actions).
4. Configure your Genesys Cloud Bot Flow Data Action to send the `rvnr` variable in the request body.
