// Database utilities

const buildPagination = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};

const applyPagination = (query, pagination) => {
  return query.limit(pagination.limit).offset(pagination.offset);
};

const getPaginatedResults = async (query, page = 1, limit = 20) => {
  const pagination = buildPagination(page, limit);

  // Clone query for count
  const countQuery = query
    .clone()
    .clearSelect()
    .clearOrder()
    .count('* as total');
  const [{ total }] = await countQuery;

  // Apply pagination to main query
  const results = await applyPagination(query, pagination);

  return {
    data: results,
    pagination: {
      ...pagination,
      total: parseInt(total)
    }
  };
};

module.exports = {
  buildPagination,
  applyPagination,
  getPaginatedResults
};
