import { get } from "lodash";

class ApiFeatures {
  query: object;
  queryString: object;
  constructor(query: object, queryString: object) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj: any = { ...this.queryString };

    const excludeParams = ["sort", "page", "limit", "select"];

    excludeParams.forEach((el: string) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);

    queryString = JSON.parse(
      queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );

    // @ts-ignore
    this.query = this.query.find(queryString);

    return this;
  }

  sort() {
    if (get(this.queryString, "sort")) {
      console.log(this.queryString);
      // @ts-ignore
      const sortList = this.queryString.sort.split(",").join(" ");

      // @ts-ignore
      this.query = this.query.sort(sortList);
    } else {
      // @ts-ignore

      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginate() {
    if (get(this.queryString, "page")) {
      const page = +get(this.queryString, "page") || 1;

      const limit = +get(this.queryString, "limit") || 100;

      const skip = (page - 1) * limit;
      // @ts-ignore
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }

  select() {
    if (get(this.queryString, "select")) {
      const select = get(this, "queryString.select").split(",").join(" ");
      // @ts-ignore
      this.query = this.query.select(select);
    } else {
      // @ts-ignore
      this.query = this.query.select("-__v");
    }

    return this;
  }

  limit() {
    if (get(this.queryString, "limit") && !get(this.queryString, "page")) {
      // @ts-ignore
      this.query = this.query.limit(+get(this.queryString, "limit"));
    }

    return this;
  }
}

export default ApiFeatures;
