function decorateCategory(category) {
  return {
    id: category.id,
    name: category.name,
    created_at: category.created_at,
  };
}

function decorateCategoryList(categories) {
  return categories.map(decorateCategory);
}

module.exports = { decorateCategory, decorateCategoryList };