const mapDBToModel = (payload) => {
  const result = {
    ...payload,
    albumId: payload.album_id,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
  delete result.album_id;
  delete result.created_at;
  delete result.updated_at;
  return result;
};

module.exports = { mapDBToModel };
