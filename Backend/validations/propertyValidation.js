import Joi from "joi";

export const createPropertySchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().trim().min(10).required(),
  price: Joi.number().positive().required(),
  country: Joi.string().trim().min(2).required(),
  state: Joi.string().trim().min(2).required(),
  city: Joi.string().trim().min(2).required(),
  address: Joi.string().trim().min(3).required(),
  totalRooms: Joi.number().integer().min(1).required(),
  amenities: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim()), Joi.string().trim())
    .optional(),
  rules: Joi.string().allow("").optional(),
  location: Joi.alternatives()
    .try(
      Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
      }),
      Joi.string().trim()
    )
    .required(),
});
