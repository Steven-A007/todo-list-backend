function decorateTag(tag) {
  return {
    id: tag.id,
    name: tag.name,
    created_at: tag.created_at,
  };
}

function decorateTagList(tags) {
  return tags.map(decorateTag);
}

module.exports = { decorateTag, decorateTagList };