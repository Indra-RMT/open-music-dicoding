const mapDBToModel = (payload) => ({
  ...payload,
  albumId: payload.album_id,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
});

module.exports = { mapDBToModel };
