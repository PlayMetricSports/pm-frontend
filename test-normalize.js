import { normalizeApiResponse } from './lib/helpers.js';

const res = {
  "code": 200,
  "success": true,
  "data": {
    "timeslots": [
      {
        "_id": "6a29a58ff0b2d915b3628cce",
        "slotIndex": 1,
        "orgId": {
          "_id": "6a299c62d7c28c0c99219fda",
          "name": "Sportizo"
        },
        "startTime": "10:00",
        "endTime": "11:00"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  },
  "error": [],
  "message": "Timeslots fetched successfully."
};

console.log("Result:", normalizeApiResponse(res, 'timeslots'));
