const mapDBToModel = (payload) => {
  const result = {
    ...payload,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
  if (payload.album_id) result.albumId = payload.album_id;
  if (payload.user_id) result.userId = payload.user_id;
  delete result.album_id;
  delete result.user_id;
  delete result.created_at;
  delete result.updated_at;
  return result;
};

module.exports = { mapDBToModel };
