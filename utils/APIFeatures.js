class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A) Filtering

    //create a hard copy of req query object
    //cause when we do it with this
    //const queryObj = req.query it will impact to req.query when we mutate it
    const queryObj = { ...this.queryString };

    //excluding this field because we cant do filter with this fields
    const excludedFields = ['sort', 'page', 'limit', 'fields'];

    //deleting a query object contain excludedFields
    excludedFields.forEach(el => delete queryObj[el]);

    //1B) Advanced Filtering

    //in order to using gte lte lt gt in mongodb
    //{difficulty: 'easy', duration: {$gte: 5}}

    //try on postman
    //difficulty=easy&duration[lte]=5
    //result in req.query
    //{difficulty: 'easy' , duration: {gte: 5}}

    //a solution to add $ to query object
    //parse object to string
    let queryStr = JSON.stringify(queryObj);

    //filtering text where match with gte,gt,lte,lt
    //include \b at the first and end so it will be find a really match
    //and add g to find another match not just for first match
    //do a callback function each of match and add $
    //ex see $ in gte text {difficulty: 'easy' , duration: {'$gte': 5}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(queryStr);
    // console.log(JSON.parse(queryStr));

    //1C) Execute filter

    //using filter object with find method
    //we dont use await keyword cause we lose a chain ability
    //const query = await Tour.find(queryObj);
    //using let cause if there is exist sort it will do sorting
    //Tour.find will return query so we can chaining with another query again
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //default with order by created at
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    //3) Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //excluding this field
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //4) Pagination
    //set a page and if empty return 1 (to prevent a string we can multiply it with number)
    const page = this.queryString.page * 1 || 1;

    //set a limit and if empty return 10 (to prevent a string we can multiply it with number)
    const limit = this.queryString.limit * 1 || 10;

    //if we are on page 1 , skip will be 0 so it starting from first result until limit
    //if we are on page 2 , page will substract 1 so it will skip a result base on limit
    const skip = (page - 1) * limit;

    //page=1&limit=10
    this.query = this.query.skip(skip).limit(limit);

    //returning it self so we can use chaining
    return this;
  }
}
module.exports = APIFeatures;
