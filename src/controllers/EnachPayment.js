// initiatePaymentRoute.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const Joi = require('joi');

const schema = Joi.object({
  firstName: Joi.string().required(),
  amount: Joi.string().valid("1").required(),
  productInfo: Joi.string().required(),
  phone: Joi.string().pattern(/^\d{10}$/).required(),
  email: Joi.string().email().required(),
  successRedirectUrl: Joi.string().uri().required(),
  failureRedirectUrl: Joi.string().uri().required(),
  maxAmount: Joi.number().required(),
  callbackUrl: Joi.string().uri().required(),
  finalCollectionDate: Joi.string().pattern(/^\d{4}\/\d{2}\/\d{2}$/).required(),
  subMerchantId: Joi.string().required(),
  showPaymentMode: Joi.string().valid("", "UPIAD", "EN").optional(),
  address1: Joi.string().required(),
  address2: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipcode: Joi.string().required(),
  userDefinedField1: Joi.string().optional(),
  userDefinedField2: Joi.string().optional(),
  userDefinedField3: Joi.string().optional(),
});

router.post('/initiate-payment', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const response = await axios.post(
      'https://api-preproduction.signzy.app/api/v3/enach/initiatepayment',
      value,
      {
        headers: {
          'Authorization': process.env.SIGNZY_ACCESS_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    const errRes = err.response?.data || { message: 'Unknown error' };
    res.status(err.response?.status || 500).json({ error: errRes });
  }
});

module.exports = router;
